/**
 *  Generates the CommonJS-flavoured declaration files for the package.
 *
 *  `tsc` emits `dist/main.d.ts` (from the JSDoc in `src/main.js`) and
 *  `dist/index.d.ts` (from `src/index.ts`). Both are ESM-shaped, because the
 *  package is `"type": "module"`. Node's `require` condition in
 *  `package.json` resolves to the CommonJS build — so TypeScript needs
 *  CommonJS-shaped declarations for that condition, otherwise `node16`/
 *  `nodenext` consumers report TS1479 ("the referenced file is an ECMAScript
 *  module and cannot be imported with 'require'").
 *
 *  The CommonJS build exposes the controller in one of two ways, and the
 *  declaration has to match it exactly:
 *
 *    - `exports.default = VisualController`  → the module is `{ default: fn }`.
 *      The declaration uses `export default`.
 *    - `module.exports = VisualController`   → the module *is* the function.
 *      The declaration uses `export =`.
 *
 *  Which one it is depends on the bundler's `output.exports` setting, so the
 *  shape is read back from the built CommonJS bundle instead of being
 *  hard-coded — if the build changes, this script follows.
 *
 *  Getting this wrong is not cosmetic: with `export default` on a bundle that
 *  really does `module.exports = fn`, a CommonJS consumer without
 *  `esModuleInterop` compiles cleanly and then gets `undefined` at runtime.
 *
 *  Copying the generated files (instead of hand-writing a second set) keeps
 *  the two declarations from ever drifting apart.
 */
import { copyFile, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join ( dirname ( fileURLToPath ( import.meta.url ) ), '..' )
const dist = join ( root, 'dist' )

// The instance types — same content, CommonJS extension.
await copyFile ( join ( dist, 'main.d.ts' ), join ( dist, 'main.d.cts' ) )

// How does the CommonJS build expose the controller?
const pkg = JSON.parse ( await readFile ( join ( root, 'package.json' ), 'utf8' ) )
const cjsBundle = pkg.exports[ '.' ].require.default
const bundle = await readFile ( join ( root, cjsBundle ), 'utf8' )

const assignsModuleExports = /module\.exports\s*=/.test ( bundle )
const setsExportsDefault = /exports\.default\s*=/.test ( bundle )

if ( assignsModuleExports === setsExportsDefault ) {
    throw new Error (
        `generate-cjs-types: cannot tell the CommonJS export shape of ${ cjsBundle } ` +
        '(expected exactly one of "module.exports =" / "exports.default =").'
    )
}

const indexEsm = await readFile ( join ( dist, 'index.d.ts' ), 'utf8' )

if ( setsExportsDefault ) {
    // `exports.default = fn` — the module is `{ default: fn }`.
    // Same declaration, but importing its sibling in CommonJS form.
    const indexCjs = indexEsm.replace ( /(['"])\.\/main\.js\1/g, "'./main.d.cts'" )
    await writeFile ( join ( dist, 'index.d.cts' ), indexCjs )
} else {
    // `module.exports = fn` — the module *is* the controller.
    // `export =` is the only accurate way to describe that, and it cannot be
    // combined with other exports, so the named types are reachable through
    // the instance type alone.
    const indexCjs = `import type { VisualControllerInstance } from './main.d.cts'

interface VisualControllerFactory {
    (dependencies?: any): VisualControllerInstance
    new (dependencies?: any): VisualControllerInstance
}

declare const VisualController: VisualControllerFactory

export = VisualController
`
    await writeFile ( join ( dist, 'index.d.cts' ), indexCjs )
}

console.log (
    `types: wrote dist/main.d.cts and dist/index.d.cts ` +
    `(${ assignsModuleExports ? 'module.exports =' : 'exports.default =' } shape)`
)
