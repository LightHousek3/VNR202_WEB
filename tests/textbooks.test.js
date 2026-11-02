import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterCongress, chatSuggestions, dossiers, textbook } from '../src/data.js';
import { answerQuestion, BOOK_PDF, loadTextbooks, normalize, retrieve, splitChunks } from '../server/textbooks.js';
import { createApp } from '../server/index.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const corpus = await loadTextbooks(root);

async function withServer(options, callback) {
  const server = createApp(options).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  try { await callback('http://127.0.0.1:' + address.port); }
  finally { await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); }
}

test('the replacement corpus uses the supplied 2021 book and carries printed page markers', () => {
  assert.equal(textbook.file, BOOK_PDF);
  assert.equal(textbook.printedTitle, 'Giáo trình Lịch sử Đảng Cộng sản Việt Nam');
  assert.ok(corpus.length > 100);
  assert.deepEqual([...new Set(corpus.map((chunk) => chunk.sourceFile))], [BOOK_PDF]);
  assert.ok(corpus.some((chunk) => chunk.chapter === 'Chương 3' && chunk.page === 146));
  assert.ok(corpus.every((chunk) => chunk.sourceType === 'giao trinh'));
});

test('page and chapter markers keep Đại hội IX and later implementation in distinct source sections', () => {
  const sample = [
    '[[PAGE 146]]',
    'Chương 3',
    'Đại hội đại biểu toàn quốc lần thứ IX',
    'Sau 15 năm đổi mới, Việt Nam đạt được nhiều thành tựu quan trọng.',
    '[[PAGE 149]]',
    'Hội nghị Trung ương 7 (3-2003) bàn về đổi mới chính sách đất đai.',
  ].join('\n');
  const chunks = splitChunks(sample, 'sample.txt');
  const congress = chunks.find((chunk) => chunk.page === 146);
  const followup = chunks.find((chunk) => chunk.page === 149);
  assert.equal(congress.chapter, 'Chương 3');
  assert.equal(congress.section, 'Đại hội IX');
  assert.equal(followup.section, 'Triển khai sau Đại hội IX');
});

test('questions about Congress IX retrieve only its chapter and period', () => {
  const questions = [
    ['Đại hội IX nhận định thế nào về 15 năm đổi mới?', 146],
    ['Con đường đi lên chủ nghĩa xã hội Đại hội IX nêu ra sao?', 147],
    ['Đại hội IX xác định mô hình kinh tế thị trường thế nào?', 148],
    ['Đại hội IX đặt văn hóa ở vị trí nào?', 148],
    ['Đại hội IX định hướng đối ngoại và hội nhập ra sao?', 148],
  ];
  for (const [question, expectedPage] of questions) {
    const matches = retrieve(question, corpus);
    assert.ok(matches.length > 0, question);
    assert.ok(matches.some((match) => match.page === expectedPage), question + ' should cite printed page ' + expectedPage);
    assert.ok(matches.every((match) => match.chapter === 'Chương 3' && match.page >= 146 && match.page <= 153), question);
  }
});

test('the culture answer cites the direct Congress IX statement without post-Congress sources', () => {
  const result = answerQuestion('Đại hội IX đặt văn hóa ở vị trí nào?', corpus);
  assert.equal(result.responseKind, 'textbook');
  assert.match(result.answer, /nền tảng tinh thần/i);
  assert.doesNotMatch(result.answer, /triển khai sau Đại hội IX/i);
  assert.deepEqual(result.sources.map((source) => source.page), [148]);
});

test('a five-year-plan question is answered from the exact IX strategy stated in the textbook', () => {
  const result = answerQuestion('Kế hoạch 2001–2005 của Đại hội IX gồm những chỉ tiêu nào?', corpus);
  assert.equal(result.grounded, true);
  assert.equal(result.responseKind, 'textbook');
  assert.match(result.answer, /Chiến lược phát triển kinh tế/i);
  assert.match(result.answer, /năm 2020/i);
  assert.ok(result.sources.some((source) => source.page === 146 && source.file === BOOK_PDF));
});

test('later Central Committee policies stay labeled as implementation after Congress IX', () => {
  const result = answerQuestion('Sau Đại hội IX, Hội nghị Trung ương 8 năm 2003 nêu chiến lược gì?', corpus);
  assert.ok(result.sources.length > 0);
  assert.match(result.answer, /triển khai sau Đại hội IX/i);
  assert.ok(result.sources.every((source) => source.page >= 149 && source.page <= 153));
});

test('Congress IX defense and party answers use its direct source and label later strategy separately', () => {
  const party = answerQuestion('Đại hội IX quyết định gì về xây dựng Đảng?', corpus);
  assert.equal(party.grounded, true);
  assert.match(party.answer, /đường lối đúng đắn của Đảng/i);
  assert.ok(party.sources.some((source) => source.page === 146));
  assert.ok(party.sources.some((source) => source.page === 147));

  const defense = answerQuestion('Đại hội IX thông qua chiến lược quốc phòng nào?', corpus);
  assert.equal(defense.grounded, true);
  assert.match(defense.answer, /Hội nghị Trung ương 8 tháng 7-2003/i);
  assert.ok(defense.sources.some((source) => source.page === 147 && source.section === 'Đại hội IX'));
  assert.ok(defense.sources.some((source) => source.page === 152 && source.section === 'Triển khai sau Đại hội IX'));
});

test('specific social questions about Congress IX are answered only with cited general social directions', () => {
  for (const question of [
    'Đại hội IX quyết nghị gì về bảo hiểm y tế?',
    'Đại hội IX có chương trình nào về giáo dục và khoa học?',
    'Đại hội IX nêu chỉ tiêu việc làm và giảm nghèo nào?',
  ]) {
    const result = answerQuestion(question, corpus);
    assert.equal(result.grounded, true, question);
    assert.match(result.answer, /nền tảng tinh thần/i, question);
    assert.ok(result.sources.some((source) => source.page === 148), question);
    assert.ok(result.sources.some((source) => source.page === 147), question);
  }
});

test('Agent can summarize each chapter and the whole book with chapter-matched citations', () => {
  for (const [question, expectedPage] of [
    ['Tóm tắt chương 1', 14],
    ['Tóm tắt chương 2', 60],
    ['Tóm tắt chương 3', 115],
  ]) {
    const result = answerQuestion(question, corpus);
    assert.equal(result.grounded, true, question);
    assert.equal(result.responseKind, 'chapter-summary');
    assert.ok(result.sources.some((source) => source.page === expectedPage), question);
  }
  const allChapters = answerQuestion('Tóm tắt chương 1, chương 2 và chương 3', corpus);
  assert.deepEqual(allChapters.sources.slice(0, 3).map((source) => source.page), [14, 60, 115]);
});

test('every suggested question returns a source or a clear not-found response', () => {
  for (const question of chatSuggestions) {
    const result = answerQuestion(question, corpus);
    assert.ok(result.grounded ? result.sources.length > 0 : /chưa tìm thấy/i.test(result.answer), question);
    assert.equal(result.textbookChecked, true, question);
  }
});

test('all nine required dossiers have source-map coverage and typed discussion content', () => {
  assert.equal(dossiers.length, 9);
  for (const dossier of dossiers) {
    assert.ok(dossier.id && dossier.title && dossier.summary.text, dossier.id);
    assert.equal(dossier.summary.sourceType, 'dien giai', dossier.id);
    assert.equal(dossier.choices.length, 3, dossier.id);
    assert.equal(dossier.choices.filter((choice) => choice.alignment === 'official').length, 1, dossier.id);
    assert.equal(dossier.choices.filter((choice) => choice.alignment === 'alternative').length, 2, dossier.id);
    assert.ok(dossier.choices.every((choice) => choice.sourceType === 'mo phong'), dossier.id);
    assert.ok(['giao trinh', 'dien giai'].includes(dossier.congressDirection.sourceType), dossier.id);
    assert.equal(dossier.comparisonExplanation.sourceType, 'dien giai', dossier.id);
    assert.equal(dossier.verification.sourceType, 'dien giai', dossier.id);
    assert.ok(dossier.sources.length > 0, dossier.id);
    assert.ok(dossier.sources.every((source) => source.file === BOOK_PDF && source.chapter === 'Chương 3' && source.printedPage && source.sourceType === 'giao trinh'), dossier.id);
  }
  assert.equal(afterCongress.title, 'Triển khai sau Đại hội IX');
  assert.ok(afterCongress.entries.every((entry) => entry.sourceType === 'dien giai' && entry.sources.length && entry.sources.every((source) => source.printedPage >= 149 && source.printedPage <= 153 && source.sourceType === 'giao trinh')));
  assert.equal(normalize('Giáo trình'), 'giao trinh');
});

test('every displayed source excerpt is a literal passage from its cited printed page', () => {
  const sources = [...dossiers.flatMap((dossier) => dossier.sources), ...afterCongress.entries.flatMap((entry) => entry.sources)];
  for (const source of sources) {
    const citedPage = corpus.filter((chunk) => chunk.chapter === source.chapter && chunk.page === source.printedPage)
      .map((chunk) => normalize(chunk.text)).join(' ');
    assert.ok(citedPage.includes(normalize(source.excerpt)), source.id + ' excerpt must match printed page ' + source.printedPage);
  }
});

test('chat API uses Gemini and returns Vietnamese answers with separate textbook citations', async () => {
  const mockFetch = async (url) => {
    if (String(url).includes('/v1beta/models?')) {
      return new Response(JSON.stringify({ models: [
        { name: 'models/gemini-test-flash', supportedGenerationMethods: ['generateContent'] },
      ] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: 'Theo giáo trình, văn hóa là nền tảng tinh thần, đồng thời là mục tiêu và động lực phát triển kinh tế – xã hội.' }] } }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  await withServer({ corpus, apiKeys: ['test-key'], fetchImpl: mockFetch }, async (base) => {
    const response = await fetch(base + '/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Đại hội IX đặt văn hóa ở vị trí nào?' }),
    });
    const result = await response.json();
    assert.equal(response.status, 200);
    assert.equal(result.grounded, true);
    assert.equal(result.fallback, false);
    assert.equal(result.provider, 'gemini');
    assert.match(result.answer, /Theo giáo trình/);
    assert.ok(result.sources.some((source) => source.file === BOOK_PDF && source.chapter === 'Chương 3' && source.page === 148));
    assert.ok(result.suggestions.length > 0);
  });
});

test('chat lists models per key, rotates after quota, and returns a successful Gemini response', async () => {
  const listedKeys = [];
  const generationCalls = [];
  const mockFetch = async (url, options) => {
    const target = String(url);
    const key = options.headers['x-goog-api-key'];
    if (target.includes('/v1beta/models?')) {
      listedKeys.push(key);
      return new Response(JSON.stringify({ models: key === 'key-one'
        ? [
          { name: 'models/text-embedding-004', supportedGenerationMethods: ['embedContent'] },
          { name: 'models/gemini-fast-a', supportedGenerationMethods: ['generateContent'] },
        ]
        : [{ name: 'models/gemini-fast-b', supportedGenerationMethods: ['generateContent'] }] }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      });
    }
    const model = target.match(/models\/([^/:]+):generateContent$/)?.[1];
    generationCalls.push({ key, model, prompt: JSON.parse(options.body).contents[0].parts[0].text });
    if (key === 'key-one') return new Response(JSON.stringify({ error: { message: 'quota exceeded' } }), { status: 429 });
    return new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: 'Theo giáo trình, văn hóa là nền tảng tinh thần, đồng thời là mục tiêu và động lực phát triển kinh tế – xã hội.' }] } }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  await withServer({ corpus, apiKeys: ['key-one', 'key-two'], fetchImpl: mockFetch }, async (base) => {
    const sendQuestion = () => fetch(base + '/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Đại hội IX đặt văn hóa ở vị trí nào?' }),
    });
    const firstResponse = await sendQuestion();
    const firstData = await firstResponse.json();
    assert.equal(firstResponse.status, 200);
    assert.equal(firstData.provider, 'gemini');
    assert.equal(firstData.fallback, false);
    assert.equal(firstData.model, 'gemini-fast-b');
    assert.match(firstData.answer, /nền tảng tinh thần/);
    assert.ok(firstData.sources.some((source) => source.page === 148));
    assert.doesNotMatch(JSON.stringify(firstData), /key-one|key-two/);

    const secondResponse = await sendQuestion();
    const secondData = await secondResponse.json();
    assert.equal(secondResponse.status, 200);
    assert.equal(secondData.provider, 'gemini');
    assert.equal(secondData.model, 'gemini-fast-b');
  });

  assert.deepEqual(listedKeys, ['key-one', 'key-two']);
  assert.deepEqual(generationCalls.map(({ key, model }) => [key, model]), [
    ['key-one', 'gemini-fast-a'],
    ['key-two', 'gemini-fast-b'],
    ['key-two', 'gemini-fast-b'],
  ]);
  assert.match(generationCalls[0].prompt, /trang in 148/);
});

test('health endpoint exposes only the current course corpus', async () => {
  await withServer({ corpus }, async (base) => {
    const response = await fetch(base + '/api/health');
    const result = await response.json();
    assert.equal(response.status, 200);
    assert.equal(result.textbookCount, 1);
    assert.deepEqual(result.textbooks, [BOOK_PDF]);
    assert.ok(result.indexedPassages > 100);
    assert.equal(result.sourceYear, '2021');
  });
});
