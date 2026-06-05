import type { BookStatus } from '../types/entities';

export interface GoodreadsBookRaw {
  title: string;
  author: string;
  isbn: string;
  status: BookStatus;
  totalPages: number | undefined;
  year: number | undefined;
  cover: string | undefined;
  userRating: number | undefined;
  shelves: string[];
}

const STATUS_MAP: Record<string, BookStatus> = {
  'read': 'FINISHED',
  'currently-reading': 'READING',
  'to-read': 'WANT_TO_READ',
};

export function extractUserId(input: string): string | null {
  const trimmed = input.trim();
  // bare numeric ID
  if (/^\d+$/.test(trimmed)) return trimmed;
  // profile URL: /user/show/12345678
  const match = trimmed.match(/\/user\/show\/(\d+)/);
  return match?.[1] ?? null;
}

export function parseRSSShelf(xml: string, shelf: string): GoodreadsBookRaw[] {
  const status: BookStatus = STATUS_MAP[shelf] ?? 'WANT_TO_READ';
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');

  if (doc.querySelector('parsererror')) return [];

  return Array.from(doc.querySelectorAll('item')).map(item =>
    parseItem(item, status)
  );
}

function parseItem(item: Element, status: BookStatus): GoodreadsBookRaw {
  const descCdata = item.querySelector('description')?.textContent ?? '';
  const fields = parseDescriptionHtml(descCdata);

  // Title: prefer the "name" label from description; fall back to <title> minus " by Author"
  let title = fields['name'] ?? '';
  let author = fields['author'] ?? '';

  if (!title) {
    const rawTitle = item.querySelector('title')?.textContent?.trim() ?? '';
    const byIdx = rawTitle.lastIndexOf(' by ');
    if (byIdx !== -1) {
      title = rawTitle.slice(0, byIdx).trim();
      if (!author) author = rawTitle.slice(byIdx + 4).trim();
    } else {
      title = rawTitle;
    }
  }

  const isbn = fields['isbn13'] ?? fields['isbn'] ?? '';

  const pagesRaw = parseInt(fields['num_pages'] ?? fields['number of pages'] ?? '', 10);
  const totalPages = !isNaN(pagesRaw) && pagesRaw > 0 ? pagesRaw : undefined;

  const yearRaw = parseInt(fields['book published'] ?? '', 10);
  const year = !isNaN(yearRaw) && yearRaw > 1000 && yearRaw <= new Date().getFullYear() + 1
    ? yearRaw
    : undefined;

  const ratingRaw = parseInt(fields['rating'] ?? '0', 10);
  const userRating = !isNaN(ratingRaw) && ratingRaw >= 1 && ratingRaw <= 5
    ? ratingRaw
    : undefined;

  const cover = fields['__cover__'] || undefined;

  const shelvesRaw = fields['shelves'] ?? '';
  const shelves = shelvesRaw
    ? shelvesRaw.split(/[,\s]+/).map(s => s.trim()).filter(Boolean)
    : [];

  return { title, author, isbn, status, totalPages, year, cover, userRating, shelves };
}

function parseDescriptionHtml(html: string): Record<string, string> {
  const fields: Record<string, string> = {};
  if (!html) return fields;

  const tmp = document.createElement('div');
  tmp.innerHTML = html;

  const img = tmp.querySelector('img');
  if (img) {
    const src = img.getAttribute('src');
    if (src) fields['__cover__'] = src;
  }

  // Each data line looks like: "key: value<br>" or "key: value<br/>"
  // We split by <br> tags in the raw HTML and parse each line
  const lines = tmp.innerHTML.split(/<br\s*\/?>/i);
  for (const line of lines) {
    const text = line.replace(/<[^>]+>/g, '').trim();
    const colonIdx = text.indexOf(':');
    if (colonIdx <= 0) continue;
    const key = text.slice(0, colonIdx).trim().toLowerCase();
    const value = text.slice(colonIdx + 1).trim();
    if (key && value && key.length < 40) {
      fields[key] = value;
    }
  }

  return fields;
}
