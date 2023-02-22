"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkDependencies = exports.findLinkedPackages = exports.readPackageJson = exports.findAllPackageJson = void 0;
const path_1 = require("path");
const fileFinder_tool_1 = require("../tools/fileFinder.tool");
const fs_extra_1 = __importDefault(require("fs-extra"));
const findAllPackageJson = async () => {
    const root = process.cwd();
    const files = (await fileFinder_tool_1.fileFinder(root, 'package.json$', Infinity)).filter(item => !item.dir.includes('node_modules'));
    const allPackages = [];
    files.forEach(({ dir }) => {
        allPackages.push({
            path: dir,
            _allPackages: allPackages
        });
    });
    return allPackages;
};
exports.findAllPackageJson = findAllPackageJson;
const readPackageJson = async (data) => {
    try {
        await Promise.all(data.map(async (item) => {
            try {
                const result = await fs_extra_1.default.readFile(path_1.join(item.path, 'package.json'));
                const packageData = JSON.parse(result.toString());
                item.name = packageData.name;
                item.dependencies = Object.entries(packageData.dependencies).map(([name, version]) => ({ name, version: version }));
            }
            catch (err) {
                return Promise.resolve();
            }
        }));
    }
    catch (error) {
        throw new Error(error);
    }
    return data;
};
exports.readPackageJson = readPackageJson;
const findLinkedPackages = (data) => {
    data.forEach(item => {
        item.dependencies = item.dependencies
            ?.filter?.(({ version }) => version.startsWith('sg-link:'))
            ?.map?.(({ name, version }) => {
            const [_, ...outDir] = version.split(':');
            return {
                name,
                outDir: outDir.join(':'),
                path: item._allPackages.find(p => p.name === name)?.path
            };
        });
    });
    return data;
};
exports.findLinkedPackages = findLinkedPackages;
const linkDependencies = async (data) => {
    const symlinkPromises = data.flatMap(item => {
        return item.dependencies?.map?.(async (d) => {
            try {
                const source = path_1.join(d.path, d.outDir);
                const destination = path_1.join(item.path, './node_modules', d.name);
                if (!(await fs_extra_1.default.pathExists(path_1.dirname(destination)))) {
                    await fs_extra_1.default.mkdirp(path_1.dirname(destination));
                }
                else {
                    await fs_extra_1.default.rmdir(destination, { recursive: true });
                }
                await fs_extra_1.default.symlink(source, destination, 'junction');
                console.log(`Symlink created from ${source} to ${destination}`);
            }
            catch (err) {
                console.error(err);
            }
        });
    });
    await Promise.all(symlinkPromises);
};
exports.linkDependencies = linkDependencies;
