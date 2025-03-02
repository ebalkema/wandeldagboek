const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { execSync } = require('child_process');

// Paden configureren
const SOURCE_LOGO_SVG = path.join(__dirname, 'public', 'images', 'logo.svg');
const SOURCE_FAVICON_SVG = path.join(__dirname, 'public', 'images', 'favicon.svg');
const PUBLIC_DIR = path.join(__dirname, 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');

// Controleer of de bronbestanden bestaan
if (!fs.existsSync(SOURCE_LOGO_SVG)) {
  console.error(`Fout: ${SOURCE_LOGO_SVG} bestaat niet.`);
  process.exit(1);
}

if (!fs.existsSync(SOURCE_FAVICON_SVG)) {
  console.error(`Fout: ${SOURCE_FAVICON_SVG} bestaat niet.`);
  process.exit(1);
}

// Functie om SVG naar PNG te converteren met Sharp
async function convertSvgToPng(svgPath, outputPath, width, height) {
  try {
    const svgBuffer = fs.readFileSync(svgPath);
    await sharp(svgBuffer)
      .resize(width, height)
      .png()
      .toFile(outputPath);
    console.log(`Gegenereerd: ${outputPath}`);
  } catch (error) {
    console.error(`Fout bij het genereren van ${outputPath}:`, error);
  }
}

// Functie om meerdere iconen te genereren
async function generateIcons() {
  console.log('Genereren van app iconen...');

  // Standaard app iconen
  await convertSvgToPng(SOURCE_LOGO_SVG, path.join(PUBLIC_DIR, 'logo192.png'), 192, 192);
  await convertSvgToPng(SOURCE_LOGO_SVG, path.join(PUBLIC_DIR, 'logo512.png'), 512, 512);

  // Apple Touch icoon
  await convertSvgToPng(SOURCE_LOGO_SVG, path.join(PUBLIC_DIR, 'apple-touch-icon.png'), 180, 180);

  // Favicon formaten
  await convertSvgToPng(SOURCE_FAVICON_SVG, path.join(PUBLIC_DIR, 'favicon-16x16.png'), 16, 16);
  await convertSvgToPng(SOURCE_FAVICON_SVG, path.join(PUBLIC_DIR, 'favicon-32x32.png'), 32, 32);
  
  // Kopieer favicon.svg naar public directory
  fs.copyFileSync(SOURCE_FAVICON_SVG, path.join(PUBLIC_DIR, 'favicon.svg'));
  
  // Genereer favicon.ico (32x32)
  try {
    await convertSvgToPng(SOURCE_FAVICON_SVG, path.join(PUBLIC_DIR, 'favicon.ico'), 32, 32);
  } catch (error) {
    console.error('Fout bij het genereren van favicon.ico:', error);
    // Fallback: kopieer favicon-32x32.png als favicon.ico
    fs.copyFileSync(path.join(PUBLIC_DIR, 'favicon-32x32.png'), path.join(PUBLIC_DIR, 'favicon.ico'));
  }
}

// Functie om Apple splash screens te genereren
async function generateAppleSplashScreens() {
  console.log('Genereren van Apple splash screens...');

  const splashSizes = [
    { width: 2048, height: 2732, name: 'apple-splash-2048-2732.png' }, // 12.9" iPad Pro
    { width: 1668, height: 2388, name: 'apple-splash-1668-2388.png' }, // 11" iPad Pro
    { width: 1668, height: 2224, name: 'apple-splash-1668-2224.png' }, // 10.5" iPad Pro
    { width: 1536, height: 2048, name: 'apple-splash-1536-2048.png' }, // 9.7" iPad
    { width: 1242, height: 2688, name: 'apple-splash-1242-2688.png' }, // iPhone XS Max
    { width: 1125, height: 2436, name: 'apple-splash-1125-2436.png' }, // iPhone X/XS
    { width: 828, height: 1792, name: 'apple-splash-828-1792.png' },   // iPhone XR
    { width: 750, height: 1334, name: 'apple-splash-750-1334.png' },   // iPhone 8/7/6s/6
    { width: 640, height: 1136, name: 'apple-splash-640-1136.png' },   // iPhone SE
  ];

  // Maak een eenvoudige splash screen met logo en achtergrondkleur
  for (const size of splashSizes) {
    try {
      // Maak een canvas met de juiste afmetingen en groene achtergrond
      const canvas = sharp({
        create: {
          width: size.width,
          height: size.height,
          channels: 4,
          background: { r: 76, g: 175, b: 80, alpha: 1 } // #4CAF50
        }
      });

      // Lees het logo
      const logoBuffer = fs.readFileSync(SOURCE_LOGO_SVG);
      
      // Bereken de logo grootte (40% van de kleinste dimensie)
      const logoSize = Math.min(size.width, size.height) * 0.4;
      
      // Verwerk het logo en plaats het in het midden
      const resizedLogo = await sharp(logoBuffer)
        .resize(Math.round(logoSize), Math.round(logoSize))
        .toBuffer();

      // Bereken de positie om het logo in het midden te plaatsen
      const logoX = Math.round((size.width - logoSize) / 2);
      const logoY = Math.round((size.height - logoSize) / 2);

      // Voeg het logo toe aan de canvas
      await canvas
        .composite([
          {
            input: resizedLogo,
            top: logoY,
            left: logoX
          }
        ])
        .png()
        .toFile(path.join(PUBLIC_DIR, size.name));

      console.log(`Gegenereerd: ${size.name}`);
    } catch (error) {
      console.error(`Fout bij het genereren van ${size.name}:`, error);
    }
  }
}

// Functie om manifest.json bij te werken
function updateManifest() {
  console.log('Bijwerken van manifest.json...');
  
  const manifestPath = path.join(PUBLIC_DIR, 'manifest.json');
  let manifest;
  
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    console.error('Fout bij het lezen van manifest.json:', error);
    return;
  }
  
  // Bijwerken van de icons array
  manifest.icons = [
    {
      "src": "favicon.svg",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    },
    {
      "src": "favicon-16x16.png",
      "sizes": "16x16",
      "type": "image/png"
    },
    {
      "src": "favicon-32x32.png",
      "sizes": "32x32",
      "type": "image/png"
    },
    {
      "src": "favicon.ico",
      "sizes": "32x32",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "any maskable"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512",
      "purpose": "any maskable"
    }
  ];
  
  // Verwijder de verwijzing naar weer in de beschrijving
  manifest.description = "Leg je wandelervaringen vast met audio, foto's en locatie";
  
  // Schrijf het bijgewerkte manifest terug
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('manifest.json bijgewerkt');
}

// Hoofdfunctie
async function main() {
  console.log('Start genereren van PWA assets...');
  
  // Zorg ervoor dat de output directories bestaan
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }
  
  // Genereer alle assets
  await generateIcons();
  await generateAppleSplashScreens();
  updateManifest();
  
  console.log('Alle PWA assets zijn succesvol gegenereerd!');
}

// Voer het script uit
main().catch(console.error); 