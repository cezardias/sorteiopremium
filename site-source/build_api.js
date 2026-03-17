import { build } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runBuild() {
    console.log('Starting build via Vite API...');
    try {
        await build({
            root: __dirname,
            configFile: path.resolve(__dirname, 'vite.config.js'),
        });
        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed with error:', error);
        process.exit(1);
    }
}

runBuild();
