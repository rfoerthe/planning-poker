import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

// Run the real package commands in an isolated project with fake CLI binaries.
// No Firebase login, network request, or deployment is possible in these tests.
const fixture = (t, envFile = 'VITE_FB_PROJECT_ID=example-project\n') => {
  const cwd = mkdtempSync(join(tmpdir(), 'planning-poker-deploy-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  mkdirSync(join(cwd, 'scripts'));
  copyFileSync(new URL('./deploy.mjs', import.meta.url), join(cwd, 'scripts/deploy.mjs'));
  if (envFile !== null) writeFileSync(join(cwd, '.env'), envFile);
  mkdirSync(join(cwd, 'dist'));
  writeFileSync(join(cwd, 'dist/stale.txt'), 'old build');

  for (const [name, bin] of [
    ['vite', 'vite'],
    ['firebase-tools', 'firebase'],
  ]) {
    const directory = join(cwd, 'node_modules', name);
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, 'package.json'), JSON.stringify({ bin: { [bin]: 'cli.cjs' } }));
    writeFileSync(
      join(directory, 'cli.cjs'),
      `
      const fs = require('node:fs');
      fs.appendFileSync('calls.jsonl', JSON.stringify({
        binary: ${JSON.stringify(bin)},
        args: process.argv.slice(2),
        projectId: process.env.VITE_FB_PROJECT_ID,
        staleBuildExists: fs.existsSync('dist/stale.txt'),
      }) + '\\n');
      process.exit(Number(process.env[${JSON.stringify(`${bin.toUpperCase()}_EXIT_CODE`)}] || 0));
    `,
    );
  }

  const run = (script, overrides = {}) => {
    const env = { ...process.env };
    delete env.VITE_FB_PROJECT_ID;
    delete env.VITE_EXIT_CODE;
    delete env.FIREBASE_EXIT_CODE;
    const [node, ...args] = packageJson.scripts[script].split(' ');
    assert.equal(node, 'node');
    const result = spawnSync(process.execPath, args, {
      cwd,
      env: { ...env, ...overrides },
      encoding: 'utf8',
    });
    const log = join(cwd, 'calls.jsonl');
    return {
      ...result,
      calls: existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n').map(JSON.parse) : [],
    };
  };
  return { cwd, run };
};

test('production cleans, builds, and deploys Hosting to the project from .env', (t) => {
  const { run } = fixture(t);
  const result = run('deploy');
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.calls, [
    { binary: 'vite', args: ['build'], projectId: 'example-project', staleBuildExists: false },
    {
      binary: 'firebase',
      args: ['deploy', '--only', 'hosting', '--project', 'example-project'],
      projectId: 'example-project',
      staleBuildExists: false,
    },
  ]);
});

test('preview uses the same project and a 14-day preview channel', (t) => {
  const { run } = fixture(t);
  const result = run('preview-deploy');
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.calls[1].args, [
    'hosting:channel:deploy',
    'preview',
    '--expires',
    '14d',
    '--project',
    'example-project',
  ]);
});

for (const envFile of [null, '', 'VITE_FB_PROJECT_ID="   "\n']) {
  test(`missing configuration stops before cleanup or CLI calls (${JSON.stringify(envFile)})`, (t) => {
    const { cwd, run } = fixture(t, envFile);
    const result = run('deploy');
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, envFile === null ? /\.env/ : /Missing VITE_FB_PROJECT_ID/);
    assert.deepEqual(result.calls, []);
    assert.ok(existsSync(join(cwd, 'dist/stale.txt')));
  });
}

test('an exported project override reaches both the build and deployment', (t) => {
  const { run } = fixture(t);
  const result = run('deploy', { VITE_FB_PROJECT_ID: 'override-project' });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.calls.every((call) => call.projectId === 'override-project'));
  assert.equal(result.calls[1].args.at(-1), 'override-project');
});

test('a failed build prevents deployment and preserves its exit status', (t) => {
  const { run } = fixture(t);
  const result = run('deploy', { VITE_EXIT_CODE: '7' });
  assert.equal(result.status, 7);
  assert.deepEqual(
    result.calls.map((call) => call.binary),
    ['vite'],
  );
});

test('a failed Firebase deployment returns a failure', (t) => {
  const { run } = fixture(t);
  const result = run('preview-deploy', { FIREBASE_EXIT_CODE: '9' });
  assert.equal(result.status, 9);
});
