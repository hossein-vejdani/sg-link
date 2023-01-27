"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkController = void 0;
const chalk = require('chalk');
const { findAllPackageJson, findLinkedPackages, linkDependencies, readPackageJson } = require('../model/package.model');
const { asyncCompose } = require('../tools/compose.tool');
const linkController = async () => {
    return asyncCompose(findAllPackageJson, readPackageJson, findLinkedPackages, linkDependencies)([]);
};
exports.linkController = linkController;
