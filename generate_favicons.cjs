const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico');

async function main() {
  const publicDir = path.join(__dirname, 'public');

  // SVG square icon with a dark background to make it look premium
  const iconSvg = `
  <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" rx="100" fill="#0A0D14"/>
    <g transform="translate(56, 176) scale(1.0)">
      <!-- Box is roughly 400x160 -->
      <path d="M 0 160 L 64 0 H 320 C 400 0 336 160 256 160 H 80 L 96 120 H 272 C 312 120 344 40 304 40 H 88 L 40 160 Z" fill="#e2ba66" fill-rule="evenodd" />
    </g>
  </svg>
  `;

  const svgBuffer = Buffer.from(iconSvg.trim());

  // Wait, let's just make it transparent for favicons usually, 
  // but a dark background might look better. Let's make an alternate transparent one if needed.
  // Actually, standard favicon can have the background:
  const iconSvgTransparent = `
  <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(56, 176) scale(1.0)">
      <path d="M 0 160 L 64 0 H 320 C 400 0 336 160 256 160 H 80 L 96 120 H 272 C 312 120 344 40 304 40 H 88 L 40 160 Z" fill="#c9a84c" fill-rule="evenodd" />
    </g>
  </svg>
  `;
  const svgBufferTransparent = Buffer.from(iconSvgTransparent.trim());

  // Generate PNG sizes
  const sizes = [16, 32, 48, 96, 144, 180, 192, 512];
  
  for (const size of sizes) {
    if (size === 180) {
      // Apple touch icon typically has a background
        await sharp(svgBuffer).resize(size, size).png().toFile(path.join(publicDir, `apple-touch-icon.png`));
    } else {
      await sharp(svgBufferTransparent).resize(size, size).png().toFile(path.join(publicDir, `favicon-${size}x${size}.png`));
    }
  }

  // Generate favicon.ico using 16x16 and 32x32 transparent
  const buf16 = await sharp(svgBufferTransparent).resize(16, 16).png().toBuffer();
  const buf32 = await sharp(svgBufferTransparent).resize(32, 32).png().toBuffer();
  const buf48 = await sharp(svgBufferTransparent).resize(48, 48).png().toBuffer();

  const icoBuf = await (pngToIco.default || pngToIco)([buf16, buf32, buf48]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);

  // Generate an Open Graph Image (1200x630)
  const ogSvg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#0A0D14"/>
    <g transform="translate(300, 115) scale(1.5)">
      <path d="M 100 220 L 164 60 H 420 C 500 60 436 220 356 220 H 180 L 196 180 H 372 C 412 180 444 100 404 100 H 188 L 140 220 Z" fill="#e2ba66" fill-rule="evenodd" />
      <text x="300" y="340" font-family="system-ui, -apple-system, sans-serif" font-weight="950" font-style="italic" font-size="110" fill="white" text-anchor="middle" style="letter-spacing: -0.02em; text-transform: uppercase;">DRITZZ</text>
    </g>
  </svg>
  `;
  await sharp(Buffer.from(ogSvg.trim())).png().toFile(path.join(publicDir, 'og-image.png'));

  console.log('Icons generated successfully.');
}

main().catch(console.error);
