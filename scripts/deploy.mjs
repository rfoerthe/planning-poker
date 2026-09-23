import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const [target, ...extraArgs] = process.argv.slice(2);
const projectId = process.env.VITE_FB_PROJECT_ID?.trim();

if (!['production', 'preview'].includes(target) || extraArgs.length > 0) {
  console.error('Usage: node --env-file=.env scripts/deploy.mjs <production|preview>');
  process.exit(1);
}

if (!projectId) {
  console.error('Missing VITE_FB_PROJECT_ID. Set it in .env before deploying.');
  process.exit(1);
}

// Vite gives existing environment variables priority over its mode-specific
// files. Keep the built app and the Hosting deployment on the same project.
process.env.VITE_FB_PROJECT_ID = projectId;

const run = (packageName, binaryName, args) => {
  const packagePath = require.resolve(`${packageName}/package.json`);
  const binaryPath = resolve(dirname(packagePath), require(packagePath).bin[binaryName]);
  const result = spawnSync(process.execPath, [binaryPath, ...args], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
};

try {
  console.log(`Building and deploying ${target} Hosting to Firebase project ${projectId}.`);
  rmSync('dist', { recursive: true, force: true });
  run('vite', 'vite', ['build']);
  const args =
    target === 'preview'
      ? ['hosting:channel:deploy', 'preview', '--expires', '14d']
      : ['deploy', '--only', 'hosting'];
  run('firebase-tools', 'firebase', [...args, '--project', projectId]);
} catch (error) {
  console.error(`Deployment failed: ${error.message}`);
  process.exitCode = 1;
}
