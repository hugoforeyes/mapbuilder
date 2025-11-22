import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, '../public/assets');
const outputFile = path.join(__dirname, '../src/assets.json');

const getFiles = (dir, baseDir = dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(filePath, baseDir));
        } else {
            if (!file.startsWith('.')) {
                // Get path relative to assetsDir
                const relativePath = path.relative(assetsDir, filePath);
                results.push('/assets/' + relativePath);
            }
        }
    });
    return results;
};

const assets = {};

try {
    const items = fs.readdirSync(assetsDir);
    items.forEach(item => {
        const itemPath = path.join(assetsDir, item);
        if (fs.statSync(itemPath).isDirectory()) {
            assets[item] = getFiles(itemPath);
        }
    });
} catch (e) {
    console.error("Error reading assets directory:", e);
}

fs.writeFileSync(outputFile, JSON.stringify(assets, null, 2));
console.log('Assets generated:', assets);
