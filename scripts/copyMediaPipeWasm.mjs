import fs from 'node:fs';
import path from 'node:path';

const sourceDir = path.resolve('node_modules/@mediapipe/tasks-vision/wasm');
const targetDir = path.resolve('public/mediapipe/wasm');

if (!fs.existsSync(sourceDir)){
    console.error('Source wasm folder tidak ditemukan:', sourceDir);
    process.exit(1);
}

fs.mkdirSync(targetDir, {recursive: true});
fs.cpSync(sourceDir, targetDir, {recursive: true});

console.log('MediaPipe wasm berhasil disalin:', targetDir);