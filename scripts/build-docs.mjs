import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const output = join(root, 'site-dist');

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(join(root, 'website'), output, { recursive: true });
await cp(join(root, 'examples'), join(output, 'examples'), { recursive: true });
await cp(join(root, 'dist'), join(output, 'dist'), { recursive: true });
await writeFile(join(output, '.nojekyll'), '');

console.log('Documentation assembled in site-dist/.');
