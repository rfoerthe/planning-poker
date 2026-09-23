import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const firebaseRequire = createRequire(require.resolve('firebase-tools/package.json'));
const { command } = firebaseRequire('./lib/commands/auth-import.js');
const accountImporter = firebaseRequire('./lib/accountImporter.js');
const DatabaseImporter = firebaseRequire('./lib/database/import.js').default;

// Exercise the installed, patched CLI. Replace all remote writes with local mocks.
function authFixture(t, extension, content) {
  const directory = mkdtempSync(join(tmpdir(), 'planning-poker-auth-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const file = join(directory, `users.${extension}`);
  writeFileSync(file, content);
  const upload = t.mock.method(accountImporter, 'serialImportUsers', async () => 'imported');
  return { file, upload };
}

test('Firebase CLI loads its commands and Next.js integration', (t) => {
  const configDirectory = mkdtempSync(join(tmpdir(), 'planning-poker-cli-'));
  t.after(() => rmSync(configDirectory, { recursive: true, force: true }));
  const result = spawnSync(process.execPath, [
    firebaseRequire.resolve('./lib/bin/firebase.js'), 'auth:import', '--help',
  ], {
    encoding: 'utf8', timeout: 30_000,
    env: { ...process.env, CI: 'true', XDG_CONFIG_HOME: configDirectory },
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /auth:import/);
  assert.doesNotThrow(() => firebaseRequire('./lib/frameworks/next/index.js'));
});

test('Firebase auth imports JSON users across the 1000-record batch boundary', async (t) => {
  const users = Array.from({ length: 1001 }, (_, i) => ({
    localId: `user-${i}`, email: `user-${i}@example.test`,
  }));
  const { file, upload } = authFixture(t, 'json', JSON.stringify({ users }));
  assert.equal(await command.actionFn(file, { project: 'demo-local' }), 'imported');
  const [project, , batches] = upload.mock.calls[0].arguments;
  assert.equal(project, 'demo-local');
  assert.deepEqual(batches.map((batch) => batch.length), [1000, 1]);
  assert.deepEqual(batches.flat(), users);
});

test('Firebase auth still parses CSV quoting with csv-parse 7', async (t) => {
  const { file, upload } = authFixture(t, 'csv',
    'user-1,user@example.test,true,,,"Doe, Jane"\n');
  await command.actionFn(file, { project: 'demo-local' });
  const [[user]] = upload.mock.calls[0].arguments[2];
  assert.equal(user.localId, 'user-1');
  assert.equal(user.emailVerified, true);
  assert.equal(user.displayName, 'Doe, Jane');
});

test('Firebase auth rejects malformed JSON before uploading', async (t) => {
  const { file, upload } = authFixture(t, 'json', '{"users":[{"localId":');
  await assert.rejects(command.actionFn(file, { project: 'demo-local' }));
  assert.equal(upload.mock.callCount(), 0);
});

for (const dataPath of ['', '/selected']) {
  test(`Firebase database import preserves the selected data (${dataPath || 'root'})`, async (t) => {
    const selected = { first: { vote: 3 }, second: { vote: 5 } };
    const input = dataPath ? { selected, ignored: { vote: 99 } } : selected;
    const importer = new DatabaseImporter(
      new URL('https://demo-local.invalid/destination'),
      Readable.from([JSON.stringify(input)]), dataPath, 1024, 1,
    );
    const write = t.mock.method(importer, 'doWriteBatch', async (batch) => batch);
    const batches = await importer.readAndWriteChunks();
    assert.ok(write.mock.callCount() > 0);
    assert.deepEqual(batches.map(({ json }) => json), [selected]);
    assert.equal(batches[0].pathname, `/destination${dataPath}`);
  });
}

test('CSV duplicate prototype headers remain ordinary own properties', () => {
  const { parse } = firebaseRequire('csv-parse/sync');
  const [record] = parse('__proto__,__proto__\nfirst,second\n', {
    columns: true, group_columns_by_name: true,
  });
  assert.equal(Object.getPrototypeOf(record), Object.prototype);
  assert.ok(Object.hasOwn(record, '__proto__'));
  assert.deepEqual(record.__proto__, ['first', 'second']);
});
