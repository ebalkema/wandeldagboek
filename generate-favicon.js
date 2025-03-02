const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { execSync } = require('child_process');

const svgPath = path.join(__dirname, 'src', 'logo.svg');
const svgBuffer = fs.readFileSync(svgPath);
const outputDir = path.join(__dirname, 'public');

// Functie om SVG naar PNG te converteren en op te slaan
async function generateFavicon() {
  try {
    // Genereer 16x16 en 32x32 PNG bestanden voor favicon
    await sharp(svgBuffer)
      .resize(16, 16)
      .png()
      .toFile(path.join(outputDir, 'favicon-16x16.png'));
    
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'favicon-32x32.png'));
    
    // Installeer het 'png-to-ico' pakket als dat nog niet is gedaan
    try {
      execSync('npm list -g png-to-ico || npm install -g png-to-ico');
      
      // Converteer PNG naar ICO met beide formaten
      execSync(`png-to-ico ${path.join(outputDir, 'favicon-16x16.png')} ${path.join(outputDir, 'favicon-32x32.png')} > ${path.join(outputDir, 'favicon.ico')}`);
      
      console.log('✅ favicon.ico is succesvol gegenereerd!');
    } catch (execError) {
      console.error('❌ Fout bij het uitvoeren van png-to-ico:', execError);
      
      // Alternatief: kopieer gewoon de 32x32 als favicon.ico als png-to-ico niet werkt
      fs.copyFileSync(
        path.join(outputDir, 'favicon-32x32.png'),
        path.join(outputDir, 'favicon.ico')
      );
      console.log('⚠️ PNG gekopieerd als favicon.ico (niet ideaal maar werkt als fallback)');
    }
    
  } catch (error) {
    console.error('❌ Fout bij het genereren van favicon:', error);
  }
}

generateFavicon().catch(err => {
  console.error('Er is een fout opgetreden:', err);
}); 