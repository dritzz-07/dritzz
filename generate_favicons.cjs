const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico');

async function main() {
  const publicDir = path.join(__dirname, 'public');
  const rawSource = path.join(__dirname, 'faaon11.jpg');
  const sourceImage = path.join(__dirname, 'icon_source_optimized.png');

  // Verify file exists
  if (!fs.existsSync(rawSource)) {
    console.error('Source image not found:', rawSource);
    return;
  }

  // Pre-process image to remove excess transparent padding and ensure solid white logo on solid black background
  console.log('Processing raw source:', rawSource);
  const { data, info } = await sharp(rawSource)
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Find bounding box based on dark logo on light background (luminance < 150)
  let minX = info.width, maxX = 0, minY = info.height, maxY = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * 3;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (lum < 150) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  console.log('Dynamic Bounds found - Width:', w, 'Height:', h, 'minX:', minX, 'minY:', minY);

  // Extract the cropped region and convert to solid white (#FFFFFF) for logo and solid black (#000000) for background
  const croppedData = Buffer.alloc(w * h * 3);
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const srcX = minX + dx;
      const srcY = minY + dy;
      const srcIdx = (srcY * info.width + srcX) * 3;
      const destIdx = (dy * w + dx) * 3;

      const r = data[srcIdx], g = data[srcIdx+1], b = data[srcIdx+2];
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const isLogo = lum < 150;

      if (isLogo) {
        croppedData[destIdx] = 255;   // R
        croppedData[destIdx+1] = 255; // G
        croppedData[destIdx+2] = 255; // B
      } else {
        croppedData[destIdx] = 0;     // R
        croppedData[destIdx+1] = 0;   // G
        croppedData[destIdx+2] = 0;   // B
      }
    }
  }

  // Create sharp image from raw buffer
  const logoImage = sharp(croppedData, {
    raw: {
      width: w,
      height: h,
      channels: 3
    }
  });

  // Scale the logo so it occupies 91.5% of a 1024x1024 canvas.
  // 1024 * 0.915 = 937 pixels width.
  const scaledWidth = 937;
  const scaledHeight = Math.round(scaledWidth * (h / w));
  console.log('Scaled logo dimensions:', scaledWidth, 'x', scaledHeight);

  const resizedLogoBuffer = await logoImage
    .resize(scaledWidth, scaledHeight)
    .png()
    .toBuffer();

  // Create a solid black 1024x1024 background canvas
  const blackBackground = sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 3,
      background: { r: 0, g: 0, b: 0 }
    }
  });

  const leftOffset = Math.floor((1024 - scaledWidth) / 2);
  const topOffset = Math.floor((1024 - scaledHeight) / 2);

  await blackBackground
    .composite([{
      input: resizedLogoBuffer,
      left: leftOffset,
      top: topOffset
    }])
    .png()
    .toFile(sourceImage);

  console.log('Optimized master image generated at:', sourceImage);

  // Generate PNG sizes
  const sizes = [16, 32, 48, 96, 144, 180, 192, 512];
  
  for (const size of sizes) {
    if (size === 180) {
      await sharp(sourceImage).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } }).png().toFile(path.join(publicDir, `apple-touch-icon.png`));
    } else {
      await sharp(sourceImage).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } }).png().toFile(path.join(publicDir, `favicon-${size}x${size}.png`));
    }
  }

  // Generate 1024x1024 favicon PNG as well
  await sharp(sourceImage).resize(1024, 1024).png().toFile(path.join(publicDir, 'favicon-1024x1024.png'));

  const buf16 = await sharp(sourceImage).resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } }).png().toBuffer();
  const buf32 = await sharp(sourceImage).resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } }).png().toBuffer();
  const buf48 = await sharp(sourceImage).resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } }).png().toBuffer();

  const icoBuf = await (pngToIco.default || pngToIco)([buf16, buf32, buf48]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);

  // Also update standard SEO Open Graph image (1200x630) with solid black background
  await sharp(sourceImage).resize(1200, 630, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } }).png().toFile(path.join(publicDir, 'og-image.png'));

  console.log('Icons generated successfully.');
}

main().catch(console.error);
