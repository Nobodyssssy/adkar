'use strict';
/* One-off: Backup assets/books to E:\Books + Formations.
   - Creates the 9 exact category folders in E: if missing.
   - Copies all normalized PDFs from assets/books into E:.
   - Leaves all existing E: files (mp3, mp4, extra PDFs) untouched.
   - Dry run by default. Use --apply to copy. */

const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const SRC = 'C:\\Users\\Protagonist\\Desktop\\Html app\\Sahib\\assets\\books';
const DEST = 'E:\\Books + Formations';

console.log('Sahib Backup to E:');
console.log('Source:', SRC);
console.log('Dest  :', DEST);
console.log('Mode  :', APPLY ? 'APPLY' : 'DRY RUN\n');

if (!fs.existsSync(SRC)) { console.error('Source missing.'); process.exit(1); }
if (!fs.existsSync(DEST)) { console.error('Dest missing.'); process.exit(1); }

const srcFolders = fs.readdirSync(SRC, { withFileTypes: true })
  .filter(d => d.isDirectory()).map(d => d.name);

let copyCount = 0, skipCount = 0, totalBytes = 0;

for (const folder of srcFolders) {
  const srcDir = path.join(SRC, folder);
  const destDir = path.join(DEST, folder);
  const srcFiles = fs.readdirSync(srcDir).filter(f => f.toLowerCase().endsWith('.pdf'));
  if (!srcFiles.length) continue;

  if (APPLY && !fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const destFiles = fs.existsSync(destDir) ? fs.readdirSync(destDir) : [];

  for (const file of srcFiles) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);

    if (destFiles.includes(file)) {
      skipCount++;
      console.log('SKIP: ' + folder + '/' + file);
    } else {
      copyCount++;
      const size = fs.statSync(srcPath).size;
      totalBytes += size;
      console.log('COPY: ' + folder + '/' + file + ' (' + (size / 1048576).toFixed(1) + ' MB)');
      if (APPLY) fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('\nSummary: copy=' + copyCount + '  skip=' + skipCount + '  total=' + (totalBytes / 1048576).toFixed(1) + ' MB');
console.log(APPLY 
  ? '\nApplied. E: now contains a perfect 1:1 backup of the app library.' 
  : '\nDry run. Re-run with --apply to copy.');