import { access, readdir, readFile } from 'node:fs/promises';
import {
  dirname,
  extname,
  join,
  normalize,
  relative,
  resolve
} from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const output = join(root, 'site-dist');
const failures = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}

function isExternal(reference) {
  return /^(?:[a-z]+:|#|\/\/)/i.test(reference);
}

async function checkReference(file, reference) {
  if (isExternal(reference)) return;
  if (reference.startsWith('/')) {
    failures.push(
      `${relative(output, file)} uses root-relative path ${reference}`
    );
    return;
  }

  const cleanReference = decodeURIComponent(reference.split(/[?#]/)[0]);
  if (cleanReference === '') return;
  let target = resolve(dirname(file), cleanReference);
  if (reference.endsWith('/')) target = join(target, 'index.html');
  if (!normalize(target).startsWith(normalize(output))) {
    failures.push(`${relative(output, file)} escapes site root: ${reference}`);
    return;
  }
  try {
    await access(target);
  } catch {
    failures.push(`${relative(output, file)} -> missing ${reference}`);
  }
}

for (const file of await walk(output)) {
  const extension = extname(file);
  if (extension !== '.html' && extension !== '.js') continue;
  const contents = await readFile(file, 'utf8');
  const referencesSource =
    extension === '.html'
      ? contents.replace(/<(?:pre|code)\b[^>]*>[\s\S]*?<\/(?:pre|code)>/gi, '')
      : contents;
  const patterns =
    extension === '.html'
      ? [/(?:href|src)=["']([^"']+)["']/g]
      : [/\bfrom\s+["']([^"']+)["']/g, /\bimport\s+["']([^"']+)["']/g];

  for (const pattern of patterns) {
    for (const match of referencesSource.matchAll(pattern)) {
      await checkReference(file, match[1]);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Documentation links and subpath-safe assets verified.');
}
