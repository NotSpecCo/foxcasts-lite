import { createWriteStream } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import { execSync } from 'child_process';
import archiver from 'archiver';

const manifest = await getManifest();

console.log('Building app...');
execSync('npm run build', { stdio: 'inherit' });
execSync('cp ./manifest.webapp ./build/manifest.webapp');

console.log('Packaging app...');
const result = await createZip();
console.log(`Created ${result.fileName} (${result.totalBytes} bytes)`);

if (process.argv[2] && process.argv[2] === '--deploy') {
    console.log('Deploying app...');
    execSync(`kosqi install --id ${manifest.id} --path ./${result.fileName}`, { stdio: 'inherit' });
}

async function getManifest() {
    const file = await readFile('./manifest.webapp', 'utf8');
    return JSON.parse(file);
}

function createZip() {
    const dir = dirname(fileURLToPath(import.meta.url));
    const fileName = `${manifest.id}_${manifest.version}.zip`;

    const output = createWriteStream(`${dir}/${fileName}`);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    return new Promise((resolve, reject) => {
        output.on('close', function() {
            resolve({
                fileName,
                totalBytes: archive.pointer()
            });
        });

        archive.on('warning', function(err) {
            if (err.code === 'ENOENT') {
                console.warn(err);
            } else {
                reject(err);
            }
        });

        archive.on('error', function(err) {
            reject(err);
        });

        archive.pipe(output);
        archive.directory('build/', false);
        archive.finalize();
    });
}
