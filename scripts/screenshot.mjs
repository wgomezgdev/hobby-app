import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'misc', 'ui-design');
const BASE = 'http://localhost:5174';

// Seed some demo data so screens look populated
const SEED_SCRIPT = `
  (async () => {
    const { db } = await import('/src/db/db.ts');
    const now = Date.now();
    const books = [
      { title: 'The Name of the Wind', author: 'Patrick Rothfuss', status: 'READING',
        currentProgress: 67, year: 2007, totalPages: 662, currentPage: 442,
        genres: ['Fantasy', 'Adventure'], cover: undefined, genres: ['Fantasy'],
        createdAt: now - 10*86400000, updatedAt: now - 86400000 },
      { title: 'Dune', author: 'Frank Herbert', status: 'FINISHED',
        currentProgress: 100, year: 1965, totalPages: 688, currentPage: 688,
        genres: ['Science Fiction'], cover: undefined,
        createdAt: now - 40*86400000, updatedAt: now - 20*86400000 },
      { title: '1984', author: 'George Orwell', status: 'FINISHED',
        currentProgress: 100, year: 1949, totalPages: 328, currentPage: 328,
        genres: ['Science Fiction'], cover: undefined,
        createdAt: now - 60*86400000, updatedAt: now - 35*86400000 },
      { title: 'The Hobbit', author: 'J.R.R. Tolkien', status: 'WANT_TO_READ',
        currentProgress: 0, year: 1937, totalPages: 310, currentPage: 0,
        genres: ['Fantasy'], cover: undefined,
        createdAt: now - 5*86400000, updatedAt: now - 5*86400000 },
    ];
    for (const b of books) { try { await db.books.add(b); } catch(e) {} }
  })();
`;

async function screenshot(page, route, filename) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, filename) });
  console.log(`✓ ${filename}`);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  // iPhone 14 Pro viewport
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  // Home
  await screenshot(page, '/', 'screen1_home.png');

  // Add Book
  await screenshot(page, '/books/new', 'screen2_add.png');

  // Stats
  await screenshot(page, '/stats', 'screen3_stats.png');

  // Library (for the book detail we need an id — grab the first book id from the URL after adding)
  await page.goto(`${BASE}/library`, { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 600));

  // Try to get to the first book detail
  const firstCard = await page.$('[href^="/books/"]');
  if (firstCard) {
    await firstCard.click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(OUT_DIR, 'screen4_detail.png') });
    console.log('✓ screen4_detail.png');
  } else {
    // Fallback: just screenshot /books/1
    await screenshot(page, '/books/1', 'screen4_detail.png');
  }

  await browser.close();
  console.log('\nAll screenshots saved to misc/ui-design/');
})();
