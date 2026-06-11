import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, '..');
const iconsDir = resolve(root, 'public/icons');

const svgMain = readFileSync(resolve(iconsDir, 'icon.svg'));
const svgMono = readFileSync(resolve(iconsDir, 'icon-mono.svg'));

const sizes = [1024, 512, 192, 180, 128, 48, 32, 16];

async function render(svgBuf, outPath, size) {
  await sharp(svgBuf, { density: Math.ceil((size / 100) * 72) })
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log(`  ${outPath.replace(root + '/', '')}`);
}

console.log('Generating main icons...');
for (const size of sizes) {
  await render(svgMain, resolve(iconsDir, `icon-${size}x${size}.png`), size);
}

console.log('Generating maskable icons (192, 512)...');
for (const size of [192, 512]) {
  await render(svgMain, resolve(iconsDir, `icon-maskable-${size}x${size}.png`), size);
}

console.log('Generating monochrome icons (192, 512)...');
for (const size of [192, 512]) {
  await render(svgMono, resolve(iconsDir, `icon-mono-${size}x${size}.png`), size);
}

console.log('Generating apple-touch-icon (180)...');
await render(svgMain, resolve(iconsDir, 'apple-touch-icon-180x180.png'), 180);

console.log('Copying favicon SVG...');
import { copyFileSync } from 'fs';
copyFileSync(resolve(iconsDir, 'icon.svg'), resolve(root, 'public', 'favicon.svg'));
console.log('  public/favicon.svg');

console.log('\nDone.');
