// Script for creating .ico file from SVG
// Required: npm install sharp png-to-ico

const sharp = require('sharp');
const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');

async function createIcon() {
    try {
        console.log('Creating icon for exe file...');
        
        // Create PNG files of different sizes from SVG
        const sizes = [16, 32, 48, 64, 128, 256];
        const pngBuffers = [];
        
        for (const size of sizes) {
            console.log(`Generating PNG ${size}x${size}...`);
            const buffer = await sharp('favicon.svg')
                .resize(size, size)
                .png()
                .toBuffer();
            pngBuffers.push(buffer);
        }
        
        console.log('Converting to ICO format...');
        const icoBuffer = await pngToIco(pngBuffers);
        
        fs.writeFileSync('app.ico', icoBuffer);
        console.log('Success! Icon app.ico created!');
        
    } catch (error) {
        console.error('Error creating icon:', error);
        process.exit(1);
    }
}

createIcon();
