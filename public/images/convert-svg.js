const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const { JSDOM } = require('jsdom');
const { SVGPathData } = require('svg-pathdata');

// Functie om SVG naar PNG te converteren
async function convertSvgToPng(svgPath, pngPath, width, height) {
  try {
    // SVG bestand lezen
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Canvas maken met de gewenste afmetingen
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // SVG naar data URL converteren
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    
    // SVG laden als afbeelding
    const img = await loadImage(svgDataUrl);
    
    // Afbeelding op canvas tekenen
    ctx.drawImage(img, 0, 0, width, height);
    
    // Canvas naar PNG bestand opslaan
    const pngBuffer = canvas.toBuffer('image/png');
    fs.writeFileSync(pngPath, pngBuffer);
    
    console.log(`Geconverteerd: ${svgPath} -> ${pngPath}`);
  } catch (error) {
    console.error(`Fout bij het converteren van ${svgPath}:`, error);
  }
}

// Hoofdfunctie
async function main() {
  const imagesDir = path.join(__dirname);
  
  // Favicon converteren naar verschillende formaten
  const faviconSvgPath = path.join(imagesDir, 'favicon.svg');
  
  // Favicon formaten
  const faviconSizes = [16, 32, 48, 64, 128, 192, 512];
  
  for (const size of faviconSizes) {
    const pngPath = path.join(imagesDir, `favicon-${size}x${size}.png`);
    await convertSvgToPng(faviconSvgPath, pngPath, size, size);
  }
  
  // Logo converteren
  const logoSvgPath = path.join(imagesDir, 'logo.svg');
  await convertSvgToPng(logoSvgPath, path.join(imagesDir, 'logo-192x192.png'), 192, 192);
  await convertSvgToPng(logoSvgPath, path.join(imagesDir, 'logo-512x512.png'), 512, 512);
  
  // OG Image converteren
  const ogImageSvgPath = path.join(imagesDir, 'og-image.svg');
  await convertSvgToPng(ogImageSvgPath, path.join(imagesDir, 'og-image.jpg'), 1200, 630);
  
  console.log('Alle conversies voltooid!');
}

// Script uitvoeren
main().catch(console.error); 