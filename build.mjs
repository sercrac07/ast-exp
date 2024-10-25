import { globSync } from 'glob'
import { resolve } from 'node:path'
import { build } from 'tsup'

function buildPackage(path) {
  const file = resolve(`./${path}/src/index.ts`).replace(/\\/g, '/')
  const dist = resolve(`./${path}/dist`).replace(/\\/g, '/')

  build({
    format: ['cjs', 'esm'],
    entry: [file],
    outDir: dist,
    dts: true,
    shims: true,
    skipNodeModulesBundle: true,
    clean: true,
    minify: true,
  })
}

globSync('packages/*').forEach(buildPackage)
