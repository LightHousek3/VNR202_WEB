import fs from 'node:fs/promises';
import path from 'node:path';

export const BOOK_TEXT = 'Giao-trinh-Lich-su-Dang-Cong-san-Viet-Nam-2021.txt';
export const BOOK_PDF = 'Giao-trinh-Lich-su-Dang-Cong-san-Viet-Nam-2021.pdf';

export const normalize = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[đĐ]/g, 'd')
  .toLocaleLowerCase('vi')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim();

const STOP_WORDS = new Set(normalize('và là của cho trong với về như nào gì giữa được hay một các nhiều trên dưới đến từ khi tại theo có thể không phải do này thì đang sao vì để hơn từng việc qua ra vào tôi bạn mình giúp xin nội dung chính tóm tắt theo hỏi về nào đâu đại hội ix đặt vị trí nhận định thế quyết nghị nêu ra thuộc giai đoạn gì được xác định nào giao trinh chuong chapter chapters sach cuon nay may vay').split(' '));
const tokensOf = (text) => normalize(text).split(/\s+/).filter((token) => token.length > 1 && !STOP_WORDS.has(token));

const CHAPTER_WORDS = new Map([
  ['mot', 1], ['nhat', 1], ['i', 1],
  ['hai', 2], ['nhi', 2], ['ii', 2],
  ['ba', 3], ['tam', 3], ['iii', 3],
]);

export function requestedChapters(question = '') {
  const query = normalize(question);
  const chapters = [];
  for (const match of query.matchAll(/\b(?:chuong|chapter)\s+(?:thu\s+)?(\d+|[a-z]+)\b/g)) {
    const number = /^\d+$/.test(match[1]) ? Number(match[1]) : CHAPTER_WORDS.get(match[1]);
    if (number >= 1 && number <= 3 && !chapters.includes(number)) chapters.push(number);
  }
  return chapters;
}

const SUMMARY_CUES = /\b(tom tat|tom lai|tom luoc|so luoc|tong hop|tong quan|khai quat|noi dung chinh|noi dung co ban|trinh bay noi dung|noi ve gi|noi dung nao)\b/;

function summaryRequest(question = '') {
  if (!SUMMARY_CUES.test(normalize(question))) return null;
  const chapters = requestedChapters(question);
  if (chapters.length) return { kind: 'chapters', chapters };
  if (asksAboutCongressIX(question)) return { kind: 'section', section: 'Đại hội IX', label: 'Đại hội IX' };
  return { kind: 'unspecified', chapters: [] };
}

export function isChapterSummaryIntent(question = '') {
  return summaryRequest(question)?.kind === 'chapters';
}

const DETAIL_FOLLOWUP = /\b(chi tiet hon|noi ro hon|giai thich them|mo rong them|phan tich them|phan tich sau hon|noi them|cu the hon|day du hon|tiep tuc|y chinh la gi)\b/;

function resolveStudyQuestion(question, history = []) {
  const previousUserQuestion = [...history].reverse()
    .find((entry) => entry?.role === 'user' && typeof entry.text === 'string')?.text?.trim() || '';
  const detectedSummary = summaryRequest(question);
  const previousSummary = summaryRequest(previousUserQuestion);
  const isSummaryDetailFollowup = Boolean(previousSummary) && DETAIL_FOLLOWUP.test(normalize(question));
  const activeSummary = (!detectedSummary || detectedSummary.kind === 'unspecified') && isSummaryDetailFollowup
    ? previousSummary
    : detectedSummary;
  const summaryFields = activeSummary ? {
    summaryIntent: true,
    summaryChapters: activeSummary.kind === 'chapters' ? activeSummary.chapters : [],
    summarySection: activeSummary.kind === 'section' ? activeSummary.section : '',
    summaryLabel: activeSummary.kind === 'section' ? activeSummary.label : '',
  } : { summaryIntent: false, summaryChapters: [], summarySection: '', summaryLabel: '' };

  if (isSummaryDetailFollowup && activeSummary === previousSummary) {
    return {
      retrievalQuestion: previousUserQuestion + ' ' + question,
      ...summaryFields,
      followup: true,
      previousUserQuestion,
    };
  }
  if (detectedSummary) {
    return {
      retrievalQuestion: question,
      ...summaryFields,
      followup: false,
      previousUserQuestion,
    };
  }
  const normalizedCurrent = normalize(question);
  const isReferentialFollowup = /\b(vay|con|the nao|dieu do|noi tren|y do|cai do|con viec|van de nay|vi sao|tai sao)\b/.test(normalizedCurrent)
    && tokensOf(question).length <= 7
    && Boolean(previousUserQuestion);
  return {
    retrievalQuestion: isReferentialFollowup ? question + ' ' + previousUserQuestion : question,
    ...summaryFields,
    followup: isReferentialFollowup,
    previousUserQuestion,
  };
}

const chapterForHeading = (line) => {
  const match = line.match(/^chương\s+(\d+)\b/i);
  return match ? 'Chương ' + Number(match[1]) : '';
};

function splitLongText(text, maxLength = 1450) {
  if (text.length <= maxLength) return [text];
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g) || [text];
  const result = [];
  let current = '';
  for (const sentence of sentences) {
    const next = current ? current + ' ' + sentence.trim() : sentence.trim();
    if (current && next.length > maxLength) {
      result.push(current);
      current = sentence.trim();
    } else current = next;
  }
  if (current) result.push(current);
  return result;
}

export function splitChunks(text, filename = BOOK_TEXT, { maxLength = 1450 } = {}) {
  const pageBlocks = String(text).replace(/^\uFEFF/, '').split(/(?=^\[\[PAGE\s+\d+\]\]\s*$)/m);
  const chunks = [];
  let chapter = 'Mở đầu';
  let section = 'Nội dung giáo trình';
  let sequence = 0;
  const pdfFilename = filename.toLowerCase().endsWith('.txt') ? filename.slice(0, -4) + '.pdf' : filename;

  for (const block of pageBlocks) {
    const marker = block.match(/^\[\[PAGE\s+(\d+)\]\]/m);
    if (!marker) continue;
    const printedPage = Number(marker[1]);
    const pageBody = block.slice(marker[0].length).trim();
    if (chapter === 'Chương 3' && printedPage >= 146 && printedPage <= 148) section = 'Đại hội IX';
    if (chapter === 'Chương 3' && printedPage >= 149 && printedPage <= 153) section = 'Triển khai sau Đại hội IX';

    let lines = [];
    let size = 0;
    const flush = () => {
      if (!lines.length) return;
      const passage = lines.join(' ').replace(/\s+/g, ' ').trim();
      lines = [];
      size = 0;
      if (passage.length < 45) return;
      for (const piece of splitLongText(passage, maxLength)) {
        chunks.push({
          id: filename + ':' + printedPage + ':' + sequence++,
          file: filename,
          sourceFile: pdfFilename,
          chapter,
          section,
          page: printedPage,
          text: piece,
          tokens: tokensOf(piece),
          sourceType: 'giao trinh',
        });
      }
    };

    for (const rawLine of pageBody.split(/\n/)) {
      const line = rawLine.replace(/\s+/g, ' ').trim();
      if (!line) { flush(); continue; }
      const normalizedLine = normalize(line);
      const nextChapter = chapterForHeading(line);
      if (nextChapter) {
        flush();
        chapter = nextChapter;
        section = chapter;
        continue;
      }
      if (/^dai hoi dai bieu toan quoc lan thu ix\b/.test(normalizedLine)) {
        flush(); section = 'Đại hội IX'; continue;
      }
      if (/^trong toan khoa ix\b/.test(normalizedLine) || /^sau dai hoi ix\b/.test(normalizedLine)) {
        flush(); section = 'Triển khai sau Đại hội IX';
      }
      if (/^dai hoi dai bieu toan quoc lan thu x\b/.test(normalizedLine)) {
        flush(); section = 'Đại hội X'; continue;
      }
      const numberedSection = line.match(/^(?:[1-3])\.\s+\S/);
      const romanSection = line.match(/^(?:I|II|III|IV|V|VI|VII|VIII|IX|X)\.\s+\S/);
      const inKnownIXPages = chapter === 'Chương 3' && printedPage >= 146 && printedPage <= 153;
      if (!inKnownIXPages && line.length <= 200 && (numberedSection || romanSection)
        && !(chapter === 'Chương 3' && printedPage >= 204)) {
        flush();
        section = line;
      }
      if (/^\d{1,3}$/.test(line)) continue;
      if (size + line.length > maxLength) flush();
      lines.push(line);
      size += line.length + 1;
    }
    flush();
  }
  return chunks;
}

export async function listTextbookFiles(root, configuredDirectory = 'textbooks') {
  const directory = path.isAbsolute(configuredDirectory) ? configuredDirectory : path.resolve(root, configuredDirectory);
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch((error) => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  return entries.filter((entry) => entry.isFile() && /^Giao-trinh-Lich-su-Dang-Cong-san-Viet-Nam-2021\.txt$/i.test(entry.name))
    .map((entry) => path.join(directory, entry.name));
}

export async function textbookSignature(root, configuredDirectory = 'textbooks') {
  const paths = await listTextbookFiles(root, configuredDirectory);
  const stats = await Promise.all(paths.map(async (filePath) => {
    const info = await fs.stat(filePath);
    return path.relative(root, filePath) + ':' + info.size + ':' + info.mtimeMs;
  }));
  return stats.join('|');
}

export async function loadTextbooks(root, configuredDirectory = 'textbooks') {
  const paths = await listTextbookFiles(root, configuredDirectory);
  const corpus = [];
  for (const filePath of paths) {
    const stat = await fs.stat(filePath);
    if (stat.size > 20 * 1024 * 1024) continue;
    const text = (await fs.readFile(filePath, 'utf8')).replace(/^\uFEFF/, '');
    corpus.push(...splitChunks(text, path.basename(filePath)));
  }
  return corpus;
}

function questionTerms(question) {
  const normalized = normalize(question);
  const terms = tokensOf(question);
  const additions = [
    [/(thanh lap dang|dang ra doi|nguyen ai quoc|cuong linh chinh tri dau tien)/, ['hoi nghi thanh lap dang', 'bao cao chinh tri dau tien', '1930', 'nguyen ai quoc']],
    [/(cach mang thang tam|thang tam 1945|gianh chinh quyen)/, ['tong khoi nghia', 'chinh quyen cach mang', '1945', 'viet minh']],
    [/(khang chien chong phap|dien bien phu|hiep dinh geneve)/, ['toan quoc khang chien', 'dien bien phu', '1954', 'thuc dan phap']],
    [/(khang chien chong my|giai phong mien nam|thong nhat dat nuoc)/, ['mien bac', 'mien nam', 'dai thang mua xuan', '1975']],
    [/(doi moi|dai hoi vi|nam 1986)/, ['doi moi tu duy', 'kinh te xa hoi', 'dai hoi vi', '1986']],
    [/(bau.*trung uong|ban chap hanh trung uong|tong bi thu)/, ['150 uy vien', 'ban chap hanh trung uong', 'tong bi thu']],
    [/(boi canh|nhan thuc moi|15 nam doi moi)/, ['toan cau hoa', 'kinh te tri thuc', 'hieu qua', 'canh tranh']],
    [/(con duong|qua do|chu nghia xa hoi)/, ['qua do', 'bo qua', 'tiep thu', 'ke thua', 'luc luong san xuat']],
    [/(thi truong|mo hinh kinh te)/, ['hang hoa', 'nhieu thanh phan', 'nha nuoc quan ly', 'phan phoi']],
    [/(chien luoc|ke hoach 2001)/, ['2001 2010', 'muc tieu tong quat', 'kem phat trien', 'gdp']],
    [/(van hoa|xa hoi|giao duc|khoa hoc|viec lam|giam ngheo|y te|bao hiem)/, ['nen tang tinh than', 'ban sac dan toc']],
    [/(doi ngoai|hoi nhap|quan he quoc te)/, ['doc lap tu chu', 'da phuong hoa', 'da dang hoa', 'doi tac tin cay']],
    [/(doan ket|dan toc|ton giao|nguoi viet nam o nuoc ngoai)/, ['dai doan ket', 'cong nhan', 'nong dan', 'tri thuc', 'nghi quyet']],
    [/(bao ve to quoc|quoc phong|an ninh)/, ['chien luoc bao ve to quoc', 'hoi nghi trung uong 8', 'hoa binh', 'chu quyen']],
    [/(xay dung dang|dang cong san)/, ['ban chap hanh trung uong', 'hoi nghi trung uong', 'bao ve dang', 'an ninh chinh tri']],
  ];
  for (const [pattern, extra] of additions) if (pattern.test(normalized)) terms.push(...extra);
  return [...new Set(terms.flatMap((term) => tokensOf(term)))];
}

function asksAboutCongressIX(question) {
  return /\b(dai hoi(?: lan thu)? (?:ix|9|09|chin)|khoa ix|khoa 9|2001 2010|2001 2005|sau dai hoi ix|sau dai hoi 9|trien khai sau dai hoi ix|trien khai sau dai hoi 9)\b/.test(normalize(question));
}

function asksAboutPostIX(question) {
  return /\b(sau dai hoi ix|trien khai sau dai hoi|hoi nghi trung uong [3578]|nghi quyet 36|bo chinh tri khoa ix|chien luoc.*2003)\b/.test(normalize(question));
}

function topicalTextFilter(question) {
  const normalized = normalize(question);
  const topics = [
    [/\b(van hoa|doi song tinh than)\b/, /xay dung nen van hoa|nen tang tinh than/],
    [/\b(thi truong|mo hinh kinh te|kinh te nhieu thanh phan)\b/, /thi truong|nhieu thanh phan/],
    [/\b(doi ngoai|hoi nhap|quan he quoc te)\b/, /doi ngoai|hoi nhap|quan he quoc te/],
    [/\b(15 nam doi moi|boi canh|nhan dinh|thanh tuu doi moi)\b/, /15 nam doi moi|boi canh|thanh tuu/],
    [/\b(con duong|qua do|chu nghia xa hoi)\b/, /qua do|bo qua che do tu ban|chu nghia xa hoi/],
    [/\b(dat dai|chinh sach dat)\b/, /dat dai|chinh sach.*dat/],
    [/\b(tu tuong ho chi minh|tuyen truyen tu tuong)\b/, /tu tuong ho chi minh/],
    [/\b(doan ket|dai doan ket)\b/, /dai doan ket/],
    [/\b(dan toc|cong tac dan toc)\b/, /cong tac dan toc|van de dan toc/],
    [/\b(ton giao|tin nguong)\b/, /ton giao|tin nguong/],
    [/\b(nguoi viet nam o nuoc ngoai|viet kieu)\b/, /nguoi viet nam o nuoc ngoai/],
    [/\b(bao ve to quoc|quoc phong|an ninh|chien luoc bao ve|2003)\b/, /bao ve to quoc|chien luoc.*bao ve|hoi nghi trung uong 8/],
    [/\b(xay dung dang|dang cong san)\b/, /xay dung dang|bao ve dang|ban chap hanh trung uong/],
  ];
  return topics.find(([questionPattern]) => questionPattern.test(normalized))?.[1] || null;
}

export function retrieve(question, corpus, limit = 4) {
  if (!question.trim() || !corpus.length) return [];
  if (isChapterSummaryIntent(question) && requestedChapters(question).length) {
    return retrieveChapterSummary(question, corpus);
  }
  const terms = questionTerms(question);
  if (!terms.length) return [];
  const normalizedQuestion = normalize(question);
  const postIXTopic = asksAboutCongressIX(question)
    && /\b(dat dai|tu tuong|ton giao|tin nguong|nguoi viet nam o nuoc ngoai|viet kieu)\b/.test(normalizedQuestion);
  const postOnly = asksAboutPostIX(question) || postIXTopic;
  const periodScoped = asksAboutCongressIX(question) || postOnly;
  let searchCorpus = periodScoped
    ? corpus.filter((chunk) => chunk.chapter === 'Chương 3'
      && chunk.page >= 146 && chunk.page <= 153
      && (!postOnly || chunk.section === 'Triển khai sau Đại hội IX')
      && (postOnly || !asksAboutCongressIX(question) || chunk.section === 'Đại hội IX'))
    : corpus;
  const topicalFilter = topicalTextFilter(question);
  if (topicalFilter) {
    const topicalMatches = searchCorpus.filter((chunk) => topicalFilter.test(normalize(chunk.text)));
    if (topicalMatches.length) searchCorpus = topicalMatches;
  }
  if (!searchCorpus.length) return [];
  const documentFrequency = new Map();
  for (const chunk of searchCorpus) for (const token of new Set(chunk.tokens)) documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
  const query = normalizedQuestion;
  const ranked = searchCorpus.map((chunk) => {
    const counts = new Map();
    for (const token of chunk.tokens) counts.set(token, (counts.get(token) || 0) + 1);
    let score = 0;
    let matched = 0;
    for (const term of terms) {
      const count = counts.get(term) || 0;
      if (!count) continue;
      matched += 1;
      const df = documentFrequency.get(term) || 0;
      const idf = Math.log(1 + (searchCorpus.length - df + 0.5) / (df + 0.5));
      score += idf * (count * 2.1) / (count + 1.2);
    }
    const normalizedText = normalize(chunk.text);
    const normalizedSection = normalize(chunk.section);
    if (query.includes('sau dai hoi ix') && normalizedSection.includes('trien khai sau')) score += 5;
    if (/2001 2010/.test(query) && normalizedText.includes('2001 2010')) score += 7;
    if (/2001 2005/.test(query) && normalizedText.includes('2001 2005')) score += 10;
    if (!matched) score = 0;
    return { chunk, score, matched };
  }).filter((item) => item.score > 2.2 && item.matched >= 2)
    .sort((a, b) => b.score - a.score || a.chunk.page - b.chunk.page);
  const strongestScore = ranked[0]?.score || 0;
  const selected = [];
  const usedPages = new Set();
  for (const item of ranked) {
    if (item.score < strongestScore * 0.58) continue;
    if (usedPages.has(item.chunk.page)) continue;
    selected.push(item.chunk);
    usedPages.add(item.chunk.page);
    if (selected.length >= limit) break;
  }
  return selected;
}

const SUMMARY_EXCLUDED_SECTION = /^(?:muc tieu|cau hoi on tap|danh muc tai lieu|tai lieu tham khao|ve kien thuc|ve ky nang|ve tu tuong|hoc vien chinh tri|vien nghien cuu)\b/;

function isSummaryExcluded(chunk) {
  const normalizedSection = normalize(chunk.section || '');
  const normalizedText = normalize(chunk.text || '');
  const publisherMentions = normalizedText.match(/\b(?:nxb|nha xuat ban)\b/g)?.length || 0;
  return SUMMARY_EXCLUDED_SECTION.test(normalizedSection) || publisherMentions >= 2;
}

export function retrieveChapterSummary(question, corpus, limit = 24) {
  const chapters = requestedChapters(question);
  if (!chapters.length || !corpus.length) return [];
  const perChapterLimit = Math.max(8, Math.floor(limit / chapters.length));
  const selected = [];

  for (const chapterNumber of chapters) {
    const chapter = 'Chương ' + chapterNumber;
    const chapterChunks = corpus.filter((chunk) => chunk.chapter === chapter && !isSummaryExcluded(chunk));
    const byPage = new Map();
    for (const chunk of chapterChunks) {
      if (!byPage.has(chunk.page)) byPage.set(chunk.page, []);
      byPage.get(chunk.page).push(chunk);
    }
    const pages = [...byPage.entries()].sort((a, b) => a[0] - b[0]);
    if (!pages.length) continue;
    const sectionGroups = new Map();
    for (const chunk of chapterChunks) {
      if (!/^[1-5]\.\s/.test(chunk.section || '')) continue;
      const sectionKey = normalize(chunk.section);
      if (!sectionGroups.has(sectionKey)) sectionGroups.set(sectionKey, []);
      sectionGroups.get(sectionKey).push(chunk);
    }
    const sectionAnchors = [...sectionGroups.values()]
      .map((group) => group.sort((a, b) => a.page - b.page)[0])
      .sort((a, b) => a.page - b.page)
      .slice(0, Math.floor(perChapterLimit / 2));
    selected.push(...sectionAnchors);
    const anchoredPages = new Set(sectionAnchors.map((chunk) => chunk.page));
    const remainingPages = pages.filter(([page]) => !anchoredPages.has(page));
    const remainingCount = Math.min(perChapterLimit - sectionAnchors.length, remainingPages.length);
    const pageIndexes = remainingCount === 1
      ? [Math.floor((remainingPages.length - 1) / 2)]
      : Array.from({ length: remainingCount }, (_, index) => Math.round(index * (remainingPages.length - 1) / Math.max(1, remainingCount - 1)));
    for (const pageIndex of [...new Set(pageIndexes)]) {
      const [, pageChunks] = remainingPages[pageIndex];
      const passage = [...pageChunks].sort((a, b) => b.text.length - a.text.length)[0];
      if (passage && !selected.some((item) => item.id === passage.id)) selected.push(passage);
    }
  }
  return selected.sort((a, b) => a.chapter.localeCompare(b.chapter, 'vi') || a.page - b.page);
}

export function retrieveSectionSummary(section, corpus, limit = 12) {
  if (!section || !corpus.length) return [];
  return corpus
    .filter((chunk) => chunk.chapter === 'Chương 3'
      && chunk.section === section
      && chunk.text.trim().length >= 180
      && !isSummaryExcluded(chunk))
    .sort((a, b) => a.page - b.page || a.id.localeCompare(b.id, 'vi'))
    .slice(0, limit);
}

function summaryEvidenceSources(question, matches, limit = 8) {
  if (!matches.length) return [];
  const pageMatches = [...new Map(matches.map((chunk) => [`${chunk.chapter}:${chunk.page}`, chunk])).values()];
  const count = Math.min(limit, pageMatches.length);
  const indexes = count === 1
    ? [0]
    : [...new Set(Array.from({ length: count }, (_, index) => Math.round(index * (pageMatches.length - 1) / (count - 1))))];
  return indexes.map((index) => {
    const chunk = pageMatches[index];
    return {
      ...publicSource(question, chunk),
      excerpt: chunk.text.replace(/\s+/g, ' ').trim().slice(0, 900),
    };
  });
}

function relevantSentences(question, passage) {
  const terms = questionTerms(question);
  const sentences = passage.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [passage];
  return sentences.map((sentence) => {
    const normalized = normalize(sentence);
    const score = terms.reduce((total, term) => total + (normalized.includes(term) ? 1 : 0), 0);
    return { sentence: sentence.replace(/\s+/g, ' ').trim(), score };
  }).filter((item) => item.score > 0 && item.sentence.length > 50)
    .sort((a, b) => b.score - a.score || a.sentence.length - b.sentence.length);
}

function excerptFor(question, chunk) {
  const sentence = relevantSentences(question, chunk.text)[0]?.sentence || chunk.text.replace(/\s+/g, ' ').trim();
  return sentence.length > 360 ? sentence.slice(0, 357).replace(/[\s,;:]+$/, '') + '…' : sentence;
}

function publicSource(question, chunk) {
  return {
    id: chunk.id,
    file: chunk.sourceFile || BOOK_PDF,
    chapter: chunk.chapter,
    section: chunk.section,
    page: chunk.page || null,
    excerpt: excerptFor(question, chunk),
    sourceType: 'giao trinh',
  };
}

const NEXT_QUESTIONS = [
  'Kinh tế thị trường định hướng xã hội chủ nghĩa được mô tả ra sao?',
  'Đại hội IX đặt văn hóa ở vị trí nào?',
  'Chiến lược bảo vệ Tổ quốc năm 2003 thuộc giai đoạn nào?',
];

const TEXTBOOK_INTENT = /\b(giao trinh|sach|tai lieu|chuong|chapter|tom tat|tom lai|tom luoc|so luoc|tong hop|tong quan|khai quat|lich su dang|dang cong san|dang lanh dao|vai tro cua dang|su ra doi cua dang|dang ta|dai hoi|hoi nghi|cuong linh|nghi quyet|van kien|bao cao chinh tri|cach mang|khang chien|giai phong dan toc|thong nhat dat nuoc|chu nghia xa hoi|xa hoi chu nghia|xay dung dang|cong nghiep hoa|hien dai hoa|doi moi|kinh te thi truong|dinh huong xa hoi|dan chu|doc lap dan toc|bao ve to quoc|viet nam|1930|1945|1954|1975|1986|2001|2003|2018|xhcn|cnxh|cnh|hdh)\b/;

function hasTextbookIntent(question) {
  return TEXTBOOK_INTENT.test(normalize(question));
}

const TEXTBOOK_STRUCTURE = [
  {
    indexedChapter: 'Mở đầu', chapter: 'Chương nhập môn', page: 2,
    title: 'Chương nhập môn: Đối tượng, chức năng, nhiệm vụ, nội dung và phương pháp nghiên cứu, học tập Lịch sử Đảng Cộng sản Việt Nam',
  },
  {
    indexedChapter: 'Chương 1', chapter: 'Chương 1', page: 14,
    title: 'Chương 1: Đảng Cộng sản Việt Nam ra đời và lãnh đạo đấu tranh giành chính quyền (1930–1945)',
  },
  {
    indexedChapter: 'Chương 2', chapter: 'Chương 2', page: 60,
    title: 'Chương 2: Đảng lãnh đạo hai cuộc kháng chiến, hoàn thành giải phóng dân tộc, thống nhất đất nước (1945–1975)',
  },
  {
    indexedChapter: 'Chương 3', chapter: 'Chương 3', page: 115,
    title: 'Chương 3: Đảng lãnh đạo cả nước quá độ lên chủ nghĩa xã hội và tiến hành công cuộc đổi mới (1975–2018)',
  },
];

function asksAboutChapterStructure(question) {
  const normalized = normalize(question);
  const namesChapters = /\b(chuong|chapters?)\b/.test(normalized);
  const asksStructure = /\b(bao nhieu|may|so luong|tong so|gom|bao gom|co nhung|danh sach|ten|cau truc|bo cuc|muc luc|how many|number of|count|list|what are|what chapters|which chapters|structure)\b/.test(normalized);
  return namesChapters && asksStructure;
}

function chapterStructureSources(question, corpus) {
  return TEXTBOOK_STRUCTURE.flatMap((entry) => {
    const chunk = corpus.find((item) => item.chapter === entry.indexedChapter && item.page === entry.page);
    if (!chunk) return [];
    return [{
      ...publicSource(question, chunk),
      id: 'textbook-structure-' + entry.page,
      chapter: entry.chapter,
      section: '',
      excerpt: entry.title,
    }];
  });
}

function chapterTitleSources(chapters) {
  return TEXTBOOK_STRUCTURE.flatMap((entry) => {
    const chapterNumber = Number(entry.indexedChapter.match(/^Chương\s+(\d+)$/)?.[1]);
    if (!chapters.includes(chapterNumber)) return [];
    return [{
      id: 'chapter-title-' + entry.page,
      file: BOOK_PDF,
      chapter: entry.chapter,
      section: '',
      page: entry.page,
      excerpt: entry.title,
      sourceType: 'giao trinh',
    }];
  });
}

function sourceForIXPage(question, corpus, page, pattern) {
  const chunk = corpus.find((item) => item.chapter === 'Chương 3' && item.page === page
    && item.section === 'Đại hội IX' && pattern.test(normalize(item.text)));
  return chunk ? publicSource(question, chunk) : null;
}

export function groundedFallback(question, matches) {
  if (!matches.length) return 'Mình chưa tìm được đoạn phù hợp cho câu hỏi này. Bạn có thể nêu thêm khái niệm, giai đoạn hoặc số chương để Agent tra cứu chính xác hơn trong toàn bộ giáo trình.';
  const excerpts = matches.slice(0, 2).map((chunk) => excerptFor(question, chunk));
  const postCongressMatch = matches[0]?.section === 'Triển khai sau Đại hội IX';
  const scopeNote = postCongressMatch
    ? 'Lưu ý: đoạn này thuộc phần triển khai sau Đại hội IX trong toàn khóa, không phải quyết nghị tại Đại hội IX. '
    : '';
  return scopeNote + 'Theo giáo trình: ' + excerpts.join(' ') + ' Mở phần Nguồn để xem chương và trang in.';
}

function nearestStrategySource(question, corpus) {
  const candidates = corpus.filter((chunk) => chunk.chapter === 'Chương 3' && chunk.page === 146);
  const chunk = candidates.find((item) => normalize(item.text).includes('chien luoc phat trien kinh te xa hoi 2001 2010'));
  return chunk ? [publicSource(question, chunk)] : [];
}

export function answerQuestion(question, corpus, history = []) {
  const context = resolveStudyQuestion(question, history);
  const effectiveQuestion = context.retrievalQuestion;
  if (!hasTextbookIntent(effectiveQuestion)) {
    return {
      answer: '',
      sources: [],
      evidence: [],
      suggestions: [],
      grounded: null,
      textbookChecked: false,
      responseKind: 'general',
      retrievalQuestion: effectiveQuestion,
      summaryIntent: false,
      summaryChapters: [],
    };
  }
  const normalizedQuestion = normalize(effectiveQuestion);
  if (context.summaryIntent && !context.summaryChapters.length) {
    if (context.summarySection) {
      const summaryQuestion = effectiveQuestion;
      const matches = retrieveSectionSummary(context.summarySection, corpus, 12);
      return {
        answer: '',
        sources: summaryEvidenceSources(summaryQuestion, matches, matches.length),
        evidence: matches.map((chunk) => ({
          file: chunk.sourceFile || BOOK_PDF,
          chapter: chunk.chapter,
          section: chunk.section,
          page: chunk.page,
          excerpt: chunk.text.replace(/\s+/g, ' ').trim().slice(0, 1200),
        })),
        suggestions: NEXT_QUESTIONS,
        grounded: matches.length > 0,
        textbookChecked: true,
        responseKind: 'section-summary',
        summaryIntent: true,
        summaryChapters: [],
        summarySection: context.summarySection,
        summaryLabel: context.summaryLabel,
        retrievalQuestion: summaryQuestion,
        followedUp: context.followup,
      };
    }
    return {
      answer: 'Người học muốn tóm tắt nhưng chưa nêu rõ phạm vi. Hỏi chương hoặc chủ đề nào cần tóm tắt; có thể chọn một chương hoặc Đại hội IX.',
      sources: [], evidence: [],
      suggestions: NEXT_QUESTIONS,
      grounded: false,
      textbookChecked: true,
      responseKind: 'clarification',
      summaryIntent: true,
      summaryChapters: [],
      retrievalQuestion: effectiveQuestion,
    };
  }
  if (context.summaryIntent && context.summaryChapters.length) {
    const summaryQuestion = effectiveQuestion;
    const matches = retrieveChapterSummary(summaryQuestion, corpus, 24);
    const titleSources = chapterTitleSources(context.summaryChapters);
    return {
      answer: '',
      sources: [...titleSources, ...summaryEvidenceSources(summaryQuestion, matches, Math.max(1, 12 - titleSources.length))],
      evidence: [...titleSources, ...matches.map((chunk) => ({
        file: chunk.sourceFile || BOOK_PDF,
        chapter: chunk.chapter,
        section: chunk.section,
        page: chunk.page,
        excerpt: chunk.text.replace(/\s+/g, ' ').trim().slice(0, 1200),
      }))],
      suggestions: NEXT_QUESTIONS,
      grounded: matches.length > 0,
      textbookChecked: true,
      responseKind: 'chapter-summary',
      summaryIntent: true,
      summaryChapters: context.summaryChapters,
      retrievalQuestion: summaryQuestion,
      followedUp: context.followup,
    };
  }
  if (asksAboutChapterStructure(question)) {
    return {
      answer: 'Giáo trình có 3 chương chính được đánh số (Chương 1–3). Trước đó sách có Chương nhập môn; vì vậy nếu tính cả phần nhập môn thì có 4 phần mang tên chương.',
      sources: chapterStructureSources(question, corpus),
      evidence: chapterStructureSources(question, corpus),
      suggestions: NEXT_QUESTIONS,
      grounded: true,
      textbookChecked: true,
      responseKind: 'chapter-structure',
      retrievalQuestion: question,
      summaryIntent: false,
      summaryChapters: [],
    };
  }
  const isPlanQuestion = normalizedQuestion.includes('2001 2005');
  const socialProgramQuestion = asksAboutCongressIX(question)
    && /\b(giao duc|khoa hoc|viec lam|giam ngheo|xoa doi giam ngheo|y te|bao hiem)\b/.test(normalizedQuestion);
  if (socialProgramQuestion) {
    const cultureSource = sourceForIXPage(effectiveQuestion, corpus, 148, /van hoa|nen tang tinh than/);
    const justiceSource = sourceForIXPage(effectiveQuestion, corpus, 147, /cong bang xa hoi|nuoc ngheo/);
    const sources = [cultureSource, justiceSource].filter(Boolean);
    return {
      answer: 'Trong phần Đại hội IX, giáo trình nêu văn hóa là nền tảng tinh thần, đồng thời là mục tiêu và động lực phát triển kinh tế – xã hội; nội dung đấu tranh hiện nay cũng nhấn mạnh khắc phục tình trạng nghèo, kém phát triển và thực hiện công bằng xã hội. Đây là những định hướng xã hội được sách ghi rõ ở trang 147–148.',
      sources, suggestions: NEXT_QUESTIONS, grounded: true, textbookChecked: true, responseKind: 'textbook',
      retrievalQuestion: effectiveQuestion, summaryIntent: false, summaryChapters: [],
    };
  }
  if (isPlanQuestion) {
    return {
      answer: 'Phần Đại hội IX trong giáo trình trình bày Chiến lược phát triển kinh tế – xã hội 2001–2010: đưa nước ta ra khỏi tình trạng kém phát triển, tạo nền tảng để đến năm 2020 cơ bản trở thành nước công nghiệp theo hướng hiện đại; GDP năm 2010 gấp đôi năm 2000. Đây là mục tiêu chiến lược được sách nêu tại trang 146–147.',
      sources: nearestStrategySource(effectiveQuestion, corpus),
      suggestions: NEXT_QUESTIONS,
      grounded: true,
      textbookChecked: true,
      responseKind: 'textbook',
      retrievalQuestion: effectiveQuestion,
      summaryIntent: false,
      summaryChapters: [],
    };
  }
  if (asksAboutCongressIX(question) && !asksAboutPostIX(question)
    && /\b(xay dung dang|dang cong san|ban chap hanh trung uong)\b/.test(normalizedQuestion)) {
    const organizationSource = sourceForIXPage(effectiveQuestion, corpus, 146, /ban chap hanh trung uong moi/);
    const leadershipSource = sourceForIXPage(effectiveQuestion, corpus, 147, /duong loi dung dan cua dang/);
    return {
      answer: 'Trong phần Đại hội IX, giáo trình ghi việc bầu Ban Chấp hành Trung ương mới và khẳng định đường lối đúng đắn của Đảng là nhân tố quyết định thành công của đổi mới. Đây là nội dung trực tiếp được sách nêu tại trang 146–147.',
      sources: [organizationSource, leadershipSource].filter(Boolean),
      suggestions: NEXT_QUESTIONS,
      grounded: true,
      textbookChecked: true,
      responseKind: 'textbook',
      retrievalQuestion: effectiveQuestion,
      summaryIntent: false,
      summaryChapters: [],
    };
  }
  if (asksAboutCongressIX(question) && !asksAboutPostIX(question)
    && /\b(bao ve to quoc|quoc phong|an ninh)\b/.test(normalizedQuestion)) {
    const generalDirection = sourceForIXPage(effectiveQuestion, corpus, 147, /xay dung va bao ve to quoc/);
    const independenceDirection = sourceForIXPage(effectiveQuestion, corpus, 147, /bao ve doc lap dan toc/);
    const postIXStrategy = corpus.find((chunk) => chunk.chapter === 'Chương 3' && chunk.page === 152
      && chunk.section === 'Triển khai sau Đại hội IX' && /chien luoc bao ve to quoc/.test(normalize(chunk.text)));
    const strategySource = postIXStrategy ? publicSource(effectiveQuestion, postIXStrategy) : null;
    return {
      answer: 'Phần Đại hội IX nêu đoàn kết, hợp tác lâu dài trong sự nghiệp xây dựng và bảo vệ Tổ quốc, đồng thời nhấn mạnh bảo vệ độc lập dân tộc. Chiến lược bảo vệ Tổ quốc trong tình hình mới được giáo trình đặt riêng ở Hội nghị Trung ương 8 tháng 7-2003, trong phần triển khai sau Đại hội.',
      sources: [generalDirection, independenceDirection, strategySource].filter(Boolean),
      suggestions: NEXT_QUESTIONS,
      grounded: true,
      textbookChecked: true,
      responseKind: 'textbook',
      retrievalQuestion: effectiveQuestion,
      summaryIntent: false,
      summaryChapters: [],
    };
  }
  const matches = retrieve(effectiveQuestion, corpus, 4);
  if (matches.length) {
    return {
      answer: groundedFallback(effectiveQuestion, matches),
      sources: [...new Map(matches.map((chunk) => [chunk.id, publicSource(effectiveQuestion, chunk)])).values()],
      suggestions: NEXT_QUESTIONS,
      grounded: true,
      textbookChecked: true,
      responseKind: matches.some((chunk) => chunk.section === 'Triển khai sau Đại hội IX') ? 'post-congress' : 'textbook',
      retrievalQuestion: effectiveQuestion,
      summaryIntent: false,
      summaryChapters: [],
    };
  }
  return {
    answer: 'Mình chưa tìm thấy đoạn liên quan trong giáo trình được cấp. Hãy hỏi theo một tờ trình hoặc khái niệm cụ thể; mình sẽ chỉ trả lời khi tìm được nguồn phù hợp.',
    sources: [], suggestions: NEXT_QUESTIONS, grounded: false, textbookChecked: true, responseKind: 'not-found',
    retrievalQuestion: effectiveQuestion, summaryIntent: false, summaryChapters: [],
  };
}
