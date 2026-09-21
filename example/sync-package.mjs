/**
 * Repacks the package and refreshes the copy installed in this app.
 *
 * The example installs @entry-place/calendar from a real tarball rather than
 * a file: symlink, so it exercises exactly what npm publishes and resolves
 * React from its own node_modules instead of reaching up into the club site.
 * The cost of that is staleness, so this runs before every test.
 *
 * The extraction is done here rather than by `npm install` on purpose: npm
 * restores a file: dependency from the integrity hash recorded in the
 * lockfile, so a rebuilt tarball with the same name is served from cache and
 * source changes silently never arrive. That failure is invisible, and every
 * assertion downstream would be about stale code.
 *
 * The package declares no runtime dependencies of its own (everything is a
 * peer, supplied by this app), so replacing its files is a complete install.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const packageRoot = resolve(here, '..')
const target = resolve(here, 'node_modules/@entry-place/calendar')

const packed = execFileSync('npm', ['pack', '--pack-destination', here, '--silent'], {
  cwd: packageRoot,
  encoding: 'utf8',
}).trim().split('\n').pop()

rmSync(target, { recursive: true, force: true })
mkdirSync(target, { recursive: true })
execFileSync('tar', ['-xzf', resolve(here, packed), '-C', target, '--strip-components=1'], {
  stdio: 'inherit',
})

console.log(`[sync] ${packed} -> node_modules/@entry-place/calendar`)
