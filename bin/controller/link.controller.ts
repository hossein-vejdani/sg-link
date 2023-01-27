const chalk = require('chalk')
const { findAllPackageJson, findLinkedPackages, linkDependencies, readPackageJson } = require('../model/package.model')
const { asyncCompose } = require('../tools/compose.tool')

export const linkController = async () => {
    return asyncCompose(findAllPackageJson, readPackageJson, findLinkedPackages, linkDependencies)([])
}
