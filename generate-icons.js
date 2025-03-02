const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgPath = path.join(__dirname, 'src', 'logo.svg');
const svgBuffer = fs.readFileSync(svgPath);

// Functie om SVG naar PNG te converteren en op te slaan
async function convertToPng(width, height, outputPath) {
  try {
    await sharp(svgBuffer)
      .resize(width, height)
      .png()
      .toFile(outputPath);
    console.log(`✅ Gegenereerd: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Fout bij genereren van ${outputPath}:`, error);
  }
}

// Genereer verschillende formaten
async function generateIcons() {
  const outputDir = path.join(__dirname, 'public');
  
  // Standaard app iconen
  await convertToPng(192, 192, path.join(outputDir, 'logo192.png'));
  await convertToPng(512, 512, path.join(outputDir, 'logo512.png'));
  
  // Apple Touch iconen
  await convertToPng(180, 180, path.join(outputDir, 'apple-touch-icon.png'));
  
  // Favicon formaten
  await convertToPng(32, 32, path.join(outputDir, 'favicon-32x32.png'));
  await convertToPng(16, 16, path.join(outputDir, 'favicon-16x16.png'));
  
  console.log('🎉 Alle iconen zijn gegenereerd!');
}

generateIcons().catch(err => {
  console.error('Er is een fout opgetreden:', err);
}); 