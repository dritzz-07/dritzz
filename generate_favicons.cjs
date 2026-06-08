const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico');

async function main() {
  const publicDir = path.join(__dirname, 'public');
  const sourceImage = path.join(__dirname, 'LOGO DRITZZ.jpg');

  // Verify file exists
  if (!fs.existsSync(sourceImage)) {
    console.error('Source image not found:', sourceImage);
    return;
  }

  // Load the image with sharp
  const image = sharp(sourceImage);

  // Generate PNG sizes
  const sizes = [16, 32, 48, 96, 144, 180, 192, 512];
  
  for (const size of sizes) {
    if (size === 180) {
      await sharp(sourceImage).resize(size, size, { fit: 'contain', background: { r: 10, g: 10, b: 12, alpha: 1 } }).png().toFile(path.join(publicDir, `apple-touch-icon.png`));
    } else {
      await sharp(sourceImage).resize(size, size, { fit: 'contain', background: { r: 10, g: 10, b: 12, alpha: 1 } }).png().toFile(path.join(publicDir, `favicon-${size}x${size}.png`));
    }
  }

  const buf16 = await sharp(sourceImage).resize(16, 16, { fit: 'contain', background: { r: 10, g: 10, b: 12, alpha: 0 } }).png().toBuffer();
  const buf32 = await sharp(sourceImage).resize(32, 32, { fit: 'contain', background: { r: 10, g: 10, b: 12, alpha: 0 } }).png().toBuffer();
  const buf48 = await sharp(sourceImage).resize(48, 48, { fit: 'contain', background: { r: 10, g: 10, b: 12, alpha: 0 } }).png().toBuffer();

  const icoBuf = await (pngToIco.default || pngToIco)([buf16, buf32, buf48]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);

  // Leave OG image as is or update it
  await sharp(sourceImage).resize(1200, 630, { fit: 'contain', background: { r: 10, g: 13, b: 20, alpha: 1 } }).png().toFile(path.join(publicDir, 'og-image.png'));

  console.log('Icons generated successfully.');
}

main().catch(console.error);
