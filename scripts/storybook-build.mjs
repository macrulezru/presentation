import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const bin = path.join(
  process.cwd(),
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'storybook.cmd' : 'storybook',
);

if (!fs.existsSync(bin)) {
  console.error('Storybook CLI not found at', bin);
  console.error(
    'Run "npm install" to install devDependencies before building Storybook.',
  );
  process.exit(1);
}

const args = ['build', '--output-dir', 'storybook-static'];
const useShell = process.platform === 'win32';

const result = spawnSync(bin, args, {
  stdio: 'inherit',
  env: { ...process.env, STORYBOOK: 'true' },
  shell: useShell,
});

if (result.error) {
  console.error(result.error.message);
}

process.exit(result.status ?? 1);
