import express from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { answerQuestion, BOOK_PDF, BOOK_TEXT, loadTextbooks, textbookSignature } from './textbooks.js';
import { createGeminiClient } from './gemini.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
try {
  process.loadEnvFile(path.resolve(root, '.env'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const configuredTextbookDir = process.env.TEXTBOOK_DIR || 'textbooks';
const configuredApiKeys = [process.env.GEMINI_API_KEY_1, process.env.GEMINI_API_KEY_2]
  .map((key) => key?.trim())
  .filter(Boolean);

function cleanHistory(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(-12).flatMap((entry) => {
    if (!entry || !['user', 'assistant'].includes(entry.role) || typeof entry.text !== 'string') return [];
    return [{ role: entry.role, text: entry.text.trim().slice(0, 1500) }];
  });
}

export function createApp({ corpus = [], getCorpus, staticDirectory = null, apiKeys = configuredApiKeys, fetchImpl = globalThis.fetch } = {}) {
  const app = express();
  const gemini = createGeminiClient({ apiKeys, fetchImpl, preferredModel: process.env.GEMINI_MODEL?.trim() || '' });
  app.disable('x-powered-by');
  if (process.env.VERCEL) app.set('trust proxy', 1);
  app.use(express.json({ limit: '24kb' }));

  const chatLimit = rateLimit({
    windowMs: 60_000,
    limit: 18,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Bạn đã gửi nhiều câu hỏi trong thời gian ngắn. Hãy chờ một chút rồi thử lại.' },
  });

  app.get('/api/health', async (_request, response) => {
    try {
      const activeCorpus = getCorpus ? await getCorpus() : corpus;
      response.json({
        textbookCount: activeCorpus.length ? 1 : 0,
        textbooks: activeCorpus.length ? [BOOK_PDF] : [],
        indexedPassages: activeCorpus.length,
        sourceYear: '2021',
      });
    } catch {
      response.status(503).json({ textbookCount: 0, textbooks: [], indexedPassages: 0 });
    }
  });

  app.post('/api/chat', chatLimit, async (request, response) => {
    const question = typeof request.body?.message === 'string' ? request.body.message.trim().slice(0, 700) : '';
    if (!question) return response.status(400).json({ error: 'Hãy nhập câu hỏi trước khi gửi.' });
    const history = cleanHistory(request.body?.history);
    try {
      let activeCorpus = corpus;
      if (getCorpus) {
        try {
          activeCorpus = await getCorpus();
        } catch (error) {
          activeCorpus = [];
          console.warn('Textbook corpus unavailable for this request:', error?.message || error);
        }
      }
      const result = answerQuestion(question, activeCorpus, history);
      if (!gemini.configured) {
        return response.status(503).json({ error: 'Gemini chưa được cấu hình. Hãy kiểm tra GEMINI_API_KEY_1 hoặc GEMINI_API_KEY_2 trong tệp .env rồi khởi động lại server.' });
      }

      try {
        const { answer, model } = await gemini.generate({ question, history, result });
        const { evidence, ...publicResult } = result;
        return response.json({ ...publicResult, answer, provider: 'gemini', model, fallback: false });
      } catch (error) {
        console.warn('Gemini request failed:', JSON.stringify({
          code: error?.code || '',
          status: error?.status || null,
          retryDelay: error?.retryDelay || '',
          quotaViolations: error?.quotaViolations || [],
          attempts: error?.attempts || [],
          message: error?.message || String(error),
        }));
        const status = [401, 403, 429].includes(error?.status) ? error.status : 502;
        const message = status === 429
          ? error.quotaViolations?.some((violation) => /per.?day|requestsperday|rpd/i.test(violation.limit + ' ' + violation.metric))
            ? 'Project Gemini đã chạm hạn mức theo ngày cho model. Hai API key thuộc cùng project dùng chung hạn mức; xem mục Rate limits trong Google AI Studio để biết thời điểm đặt lại.'
            : 'Google đã trả 429 cho tất cả model văn bản đã thử. Nếu hai API key thuộc cùng project, chúng dùng chung quota; kiểm tra Rate limits trong Google AI Studio.'
              + (error.retryDelay ? ` Google đề nghị thử lại sau ${error.retryDelay}.` : '')
          : status === 401 || status === 403
            ? 'Gemini từ chối API key hoặc key không có quyền dùng model. Hãy kiểm tra key trong tệp .env.'
            : 'Gemini chưa trả lời được câu hỏi này sau khi thử các model khả dụng. Hãy thử gửi lại.';
        return response.status(status).json({ error: message });
      }
    } catch (error) {
      console.error('Textbook lookup failed:', error?.message || error);
      return response.status(503).json({ error: 'Chưa tra cứu được giáo trình trong lượt này. Hãy thử gửi lại câu hỏi.' });
    }
  });

  if (staticDirectory) {
    app.use(express.static(staticDirectory));
    app.get(/^\/(?!api\/).*/, (_request, response, next) => {
      response.sendFile(path.join(staticDirectory, 'index.html'), (error) => { if (error) next(); });
    });
  }
  return app;
}

let vercelCorpusPromise;
const vercelApp = createApp({
  getCorpus: () => {
    vercelCorpusPromise ??= loadTextbooks(root, configuredTextbookDir);
    return vercelCorpusPromise;
  },
});

export default vercelApp;

export async function startServer() {
  let corpus = await loadTextbooks(root, configuredTextbookDir);
  let signature = await textbookSignature(root, configuredTextbookDir);
  const getCorpus = async () => {
    const current = await textbookSignature(root, configuredTextbookDir);
    if (current !== signature) {
      corpus = await loadTextbooks(root, configuredTextbookDir);
      signature = current;
      console.log('Textbook source refreshed: ' + corpus.length + ' passage(s)');
    }
    return corpus;
  };
  if (!corpus.length) console.warn('No readable textbook text was found.');
  const app = createApp({ getCorpus, staticDirectory: path.resolve(root, 'dist') });
  const port = Number(process.env.PORT || 8787);
  const server = app.listen(port, '127.0.0.1', () => {
    console.log('VNR202 study server listening at http://127.0.0.1:' + port);
    console.log(BOOK_TEXT + ': ' + corpus.length + ' passage(s) indexed');
  });
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await startServer();
