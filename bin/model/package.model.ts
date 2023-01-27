import { dirname, join } from 'path'
import { fileFinder } from '../tools/fileFinder.tool'
import fs from 'fs-extra'

type Package = {
    name?: string
    path?: string
    version?: string
    outDir?: string
    dependencies?: Package[]
    _allPackages?: Package[]
}

const root = process.cwd()

export const findAllPackageJson = async (): Promise<Package[]> => {
    const files = (await fileFinder(root, 'package.json$', Infinity)).filter(item => !item.dir.includes('node_modules'))
    const allPackages: Package[] = []

    files.forEach(({ dir }) => {
        allPackages.push({
            path: dir,
            _allPackages: allPackages
        })
    })

    return allPackages
}

export const readPackageJson = async (data: Package[]): Promise<Package[]> => {
    try {
        await Promise.allSettled(
            data.map(async item => {
                const result = await fs.readFile(join(item.path, 'package.json'))
                const packageData = JSON.parse(result.toString())
                item.name = packageData.name
                item.dependencies = Object.entries(packageData.dependencies).map(([name, version]) => ({ name, version: version as string }))
            })
        )
    } catch (error) {
        throw new Error(error)
    }
    return data
}

export const findLinkedPackages = (data: Package[]): Package[] => {
    data.forEach(item => {
        item.dependencies = item.dependencies
            .filter(({ version }) => version.startsWith('sg-link:'))
            .map(({ name, version }) => {
                const [_, ...outDir] = version.split(':')
                return {
                    name,
                    outDir: outDir.join(':'),
                    path: item._allPackages.find(p => p.name === name)?.path
                }
            })
    })
    return data
}

export const linkDependencies = async (data: Package[]): Promise<void> => {
    const symlinkPromises = data.flatMap(item => {
        return item.dependencies.map(async d => {
            try {
                const source = join(d.path, d.outDir)
                const destination = join(item.path, './node_modules', d.name)
                if (!(await fs.pathExists(dirname(destination)))) {
                    await fs.mkdirp(dirname(destination))
                }
                await fs.symlink(source, destination, 'junction')
                console.log(`Symlink created from ${source} to ${destination}`)
            } catch (err) {
                console.error(err)
            }
        })
    })
    await Promise.allSettled(symlinkPromises)
}
