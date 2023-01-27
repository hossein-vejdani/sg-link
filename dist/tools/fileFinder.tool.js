"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileFinder = void 0;
const { promisePool } = require('./promisePool.tool');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const fs_readDir = promisify(fs.readdir);
const fs_stat = promisify(fs.stat);
const search = async (dir, regex, depth, result = [], concurrency) => {
    async function fileAnalyzer(file) {
        const filePath = path.join(dir, file);
        const stat = await fs_stat(filePath);
        if (stat.isFile() && regex.test(regex.global ? filePath : file)) {
            result.push({ dir, file });
        }
        else if (stat.isDirectory() && depth > 0) {
            await search(filePath, regex, depth - 1, result, concurrency);
        }
        regex.lastIndex = 0;
    }
    const folderContents = await fs_readDir(dir);
    return promisePool(folderContents, fileAnalyzer, concurrency, { stopOnErr: false });
};
const fileFinder = async (baseDir = path.resolve('../../'), pattern = '.*', depth = 0, options = { concurrency: 10 }) => {
    const { concurrency } = options;
    const result = [];
    depth > -1 && (await search(path.resolve(baseDir), typeof pattern === 'string' ? new RegExp(pattern) : pattern, depth, result, concurrency));
    return result;
};
exports.fileFinder = fileFinder;
