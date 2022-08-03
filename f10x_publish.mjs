import { unlink, rename, writeFile, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

const run = (cmd, args, opts = {}) => new Promise((resolve, reject) => {
  const spawned = spawn(cmd, args, {...{ stdio: 'inherit' }, ...opts})
  spawned.on('close', (exitCode) => exitCode === 0 ? resolve(exitCode) : reject(exitCode))
  spawned.on('error', reject)
})

const shadowVersion = "2"

const pkgsToPublish = [
  'merge-styles',
  'react',
  'react-focus',
  'react-hooks',
  'react-window-provider',
  'utilities',
]

const pkgsDir = 'packages'
const changePkgName = (name) => name.replace('@fluentui/', '@factor10x/fluentui-')
const changePkgVersion = (version) => `${version}-shadow.${shadowVersion}`

const modifyPkg = async (pkg) => {
  console.log(`Publishing [${pkg}]`)

  const pkgPath = join(pkgsDir, pkg)
  // const npmIgnorePath = join(pkgPath, '.npmignore')
  const pkgJsonPath = join(pkgPath, 'package.json')
  const pkgJsonBackupPath = `${pkgJsonPath}.backup`

  await rename(pkgJsonPath, pkgJsonBackupPath)
  const pkgJson = JSON.parse(await readFile(pkgJsonBackupPath))

  const updatedName = changePkgName(pkgJson.name)
  console.log(`[${pkgJson.name}] => [${updatedName}]`)
  pkgJson.name = updatedName

  const updatedVersion = changePkgVersion(pkgJson.version)
  console.log(`[${pkgJson.version}] => [${updatedVersion}]`)
  pkgJson.version = updatedVersion

  await writeFile(pkgJsonPath, `${JSON.stringify(pkgJson, null, 2)}\n`)
  // await writeFile(npmIgnorePath, '.package.json.backup')

  await run('npm', ['publish', '--access', 'public'], {
    cwd: pkgPath
  })

  await rename(pkgJsonBackupPath, pkgJsonPath)
  // await unlink(npmIgnorePath)

  console.log('\n')
}


try {
  await run('npm', ['whoami'], { stdio: undefined })
} catch (err) {
  console.error('must be logged into npm')
  process.exit(1)
}

for (const pkg of pkgsToPublish) {
  await modifyPkg(pkg)
}
