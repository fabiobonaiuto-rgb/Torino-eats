const sharp = require('sharp');

// Crea un'immagine 512x512 con background granata e testo "TE"
const svgString = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#a81c39"/>
  <text x="256" y="320" font-size="280" font-weight="bold" fill="white" 
        text-anchor="middle" font-family="Arial, sans-serif">TE</text>
</svg>
`;

sharp(Buffer.from(svgString))
  .png()
  .toFile('public/favicon.png')
  .then(() => {
    console.log('✓ favicon.png created');
    return sharp('public/favicon.png')
      .resize(32, 32)
      .toFile('public/favicon-32.png');
  })
  .then(() => {
    console.log('✓ favicon-32.png created');
  })
  .catch(err => console.error('Error:', err));
