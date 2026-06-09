const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico');

async function main() {
  const publicDir = path.join(__dirname, 'public');
  const rawSource = path.join(__dirname, 'faaon.jpg');
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

  const width = info.width;
  const height = info.height;

  // 1. Categorize pixels as logo (value 1) or background (value 0)
  const isLogoOrig = new Uint8Array(width * height);
  for (let idx = 0; idx < width * height; idx++) {
    const r = data[idx * 3];
    const g = data[idx * 3 + 1];
    const b = data[idx * 3 + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    isLogoOrig[idx] = lum > 100 ? 1 : 0;
  }

  // 2. Perform Morphological Dilation (to make the stroke slightly thicker)
  // Dilating by a circular neighborhood of radius 6 pixels on 843x582 canvas
  const dilateRadius = 6;
  const isLogoDilated = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let active = false;
      for (let dy = -dilateRadius; dy <= dilateRadius; dy++) {
        for (let dx = -dilateRadius; dx <= dilateRadius; dx++) {
          if (dx * dx + dy * dy <= dilateRadius * dilateRadius) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              if (isLogoOrig[ny * width + nx]) {
                active = true;
                break;
              }
            }
          }
        }
        if (active) break;
      }
      isLogoDilated[y * width + x] = active ? 1 : 0;
    }
  }

  // 3. Find precise Bounding Box of the dilated/thickened logo
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isLogoDilated[y * width + x]) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  console.log('Dilated Bounds found - Width:', w, 'Height:', h, 'minX:', minX, 'minY:', minY);

  // 4. Extract cropped region and convert to solid white (#FFFFFF) with transparent background
  const croppedData = Buffer.alloc(w * h * 4); // RGBA format
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const srcX = minX + dx;
      const srcY = minY + dy;
      const isLogo = isLogoDilated[srcY * width + srcX];
      const destIdx = (dy * w + dx) * 4;

      if (isLogo) {
        croppedData[destIdx] = 255;     // R
        croppedData[destIdx+1] = 255;   // G
        croppedData[destIdx+2] = 255;   // B
        croppedData[destIdx+3] = 255;   // A (solid white)
      } else {
        croppedData[destIdx] = 0;       // R
        croppedData[destIdx+1] = 0;     // G
        croppedData[destIdx+2] = 0;     // B
        croppedData[destIdx+3] = 0;     // A (fully transparent)
      }
    }
  }

  const logoImage = sharp(croppedData, {
    raw: {
      width: w,
      height: h,
      channels: 4
    }
  });

  // Calculate scaling for full canvas composite
  // Rounded square fills the entire 1024x1024 canvas.
  // Logo diameter scaled to occupy 87% (approx 890px width) of the 1024px canvas.
  const scaledWidth = 890;
  const scaledHeight = Math.round(scaledWidth * (h / w));
  console.log('Scaled logo dimensions:', scaledWidth, 'x', scaledHeight);

  const resizedLogoBuffer = await logoImage
    .resize(scaledWidth, scaledHeight)
    .png()
    .toBuffer();

  // Create a 1024x1024 transparent background canvas
  const transparentCanvas = sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  });

  // Create SVG string for solid black rounded-square badge that fills the full 1024x1024 canvas
  const roundedSquareSvg = `
  <svg width="1024" height="1024">
    <rect x="0" y="0" width="1024" height="1024" rx="160" ry="160" fill="#000000" />
  </svg>
  `;

  const leftOffset = Math.floor((1024 - scaledWidth) / 2);
  const topOffset = Math.floor((1024 - scaledHeight) / 2);

  // Composite rounded-square badge and the perfectly centered white logo
  await transparentCanvas
    .composite([
      { input: Buffer.from(roundedSquareSvg), left: 0, top: 0 },
      { input: resizedLogoBuffer, left: leftOffset, top: topOffset }
    ])
    .png()
    .toFile(sourceImage);

  console.log('Optimized master image with black rounded-square badge generated at:', sourceImage);

  // Generate PNG sizes
  const sizes = [16, 32, 48, 96, 144, 180, 192, 512];
  
  for (const size of sizes) {
    if (size === 180) {
      await sharp(sourceImage)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(path.join(publicDir, `apple-touch-icon.png`));
    } else {
      await sharp(sourceImage)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(path.join(publicDir, `favicon-${size}x${size}.png`));
    }
  }

  // Generate 1024x1024 favicon PNG as well
  await sharp(sourceImage).resize(1024, 1024).png().toFile(path.join(publicDir, 'favicon-1024x1024.png'));

  // Generate .ico file
  const buf16 = await sharp(sourceImage).resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const buf32 = await sharp(sourceImage).resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const buf48 = await sharp(sourceImage).resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();

  const icoBuf = await (pngToIco.default || pngToIco)([buf16, buf32, buf48]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);

  // Also update standard SEO Open Graph image (1200x630) centered layout
  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{
    input: await sharp(sourceImage).resize(540, 540, { fit: 'contain' }).png().toBuffer(),
    left: Math.floor((1200 - 540) / 2),
    top: Math.floor((630 - 540) / 2)
  }])
  .png()
  .toFile(path.join(publicDir, 'og-image.png'));

  console.log('Icons generated successfully.');
}

main().catch(console.error);
