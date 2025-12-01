/**
 * Script to remove unused properties from pattern files
 *
 * Removes: category, description, examples, related, tags
 * These properties are not used by the parser or field-lineage systems.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findPatternFiles(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findPatternFiles(fullPath, files);
    } else if (entry.name.endsWith('-pattern.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function cleanupPatterns() {
  const patternsDir = path.join(__dirname, '../parser/patterns');
  const patternFiles = findPatternFiles(patternsDir);

  console.log(`Found ${patternFiles.length} pattern files to process\n`);

  let updatedCount = 0;

  for (const filePath of patternFiles) {
    const file = path.relative(patternsDir, filePath);
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // Remove JSDoc lines with Category: and Description:
    content = content.replace(/^ \* Category:.*\n/gm, '');
    content = content.replace(/^ \* Description:.*\n/gm, '');

    // Remove empty comment lines after removal
    content = content.replace(/\/\*\*\n \* [A-Za-z]+ Command Pattern\n \*\n \*\/\n/g,
      (match) => match.replace(/ \*\n \*\//g, ' */'));

    // Remove properties from the object - handle JSON format with double quotes
    // category
    content = content.replace(/,?\s*"category":\s*"[^"]*"/g, '');

    // description (can have escaped quotes inside)
    content = content.replace(/,?\s*"description":\s*"(?:[^"\\]|\\.)*"/g, '');

    // examples array (multiline)
    content = content.replace(/,?\s*"examples":\s*\[[^\]]*\]/gs, '');

    // related array (multiline)
    content = content.replace(/,?\s*"related":\s*\[[^\]]*\]/gs, '');

    // tags array (multiline)
    content = content.replace(/,?\s*"tags":\s*\[[^\]]*\]/gs, '');

    // Clean up: remove leading comma after syntax closes if it's now the last property
    content = content.replace(/(\})\s*,\s*(\n\s*\};)/g, '$1$2');

    // Clean up any double newlines created
    content = content.replace(/\n{3,}/g, '\n\n');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      updatedCount++;
      console.log(`✓ Updated: ${file}`);
    } else {
      console.log(`  Skipped: ${file} (no changes needed)`);
    }
  }

  console.log(`\nCompleted: Updated ${updatedCount}/${patternFiles.length} files`);
}

cleanupPatterns().catch(console.error);
