/**
 * Reorganize Pattern Files by SPL Category
 *
 * Moves all pattern files from:
 * - high-impact/
 * - tier-5-8/
 * - manual/
 * - generated-patterns.ts
 *
 * Into organized category folders based on SPL command categories
 */

import { readdirSync, existsSync, mkdirSync, copyFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Category mapping for SPL command organization
const CATEGORY_FOLDERS: Record<string, string> = {
  // Search & Filter
  'search::search': 'search',
  'results::filter': 'search',

  // Aggregation & Reporting
  'reporting': 'aggregation',
  'stats': 'aggregation',

  // Field Operations
  'fields::add': 'field-manipulation',
  'fields::modify': 'field-manipulation',
  'fields::create': 'field-manipulation',
  'fields::filter': 'field-manipulation',
  'fields::convert': 'field-manipulation',
  'fields::read': 'field-manipulation',
  'formatting': 'field-manipulation',

  // Results Operations
  'results::order': 'results',
  'results::group': 'results',
  'results::write': 'results',
  'results::read': 'results',

  // Lookup & Join
  'results::append': 'lookup',

  // Subsearch & Advanced
  'search::subsearch': 'subsearch',
  'results::generate': 'subsearch',

  // Index Operations
  'index::summary': 'indexing',
};

interface CommandInfo {
  command: string;
  category: string;
  targetFolder: string;
  sourceFiles: string[];
}

async function main() {
  console.log('='.repeat(80));
  console.log('REORGANIZING PATTERNS BY CATEGORY');
  console.log('='.repeat(80));
  console.log();

  const patternsDir = __dirname;
  const commandsMap = new Map<string, CommandInfo>();

  // Source directories to process
  const sourceDirs = [
    join(patternsDir, 'high-impact'),
    join(patternsDir, 'tier-5-8'),
    join(patternsDir, 'manual'),
  ];

  // Step 1: Scan all source directories
  console.log('📂 Step 1: Scanning source directories...\n');

  for (const sourceDir of sourceDirs) {
    if (!existsSync(sourceDir)) continue;

    const files = readdirSync(sourceDir);
    const patternFiles = files.filter(f => f.endsWith('-pattern.ts'));

    console.log(`   ${sourceDir.split(/[/\\]/).pop()}/: ${patternFiles.length} patterns`);

    for (const file of patternFiles) {
      const filePath = join(sourceDir, file);
      const content = readFileSync(filePath, 'utf-8');

      // Extract command name and category from file
      const commandMatch = file.match(/^(.+)-pattern\.ts$/);
      if (!commandMatch) continue;

      const command = commandMatch[1];

      // Try to extract category from content (handles both TS and JSON format)
      const categoryMatch = content.match(/['"]?category['"]?\s*:\s*['"]([^'"]+)['"]/);
      const category = categoryMatch ? categoryMatch[1] : 'unknown';

      // Determine target folder
      const targetFolder = CATEGORY_FOLDERS[category] || 'other';

      // Get all related files (pattern, grammar, token, test)
      const baseFiles = files.filter(f =>
        f.startsWith(command + '-') || f === command + '.test.ts'
      ).map(f => join(sourceDir, f));

      commandsMap.set(command, {
        command,
        category,
        targetFolder,
        sourceFiles: baseFiles,
      });
    }
  }

  console.log(`\n   Total commands found: ${commandsMap.size}`);

  // Step 2: Create category folders
  console.log('\n📁 Step 2: Creating category folders...\n');

  const categories = new Set(Array.from(commandsMap.values()).map(c => c.targetFolder));

  for (const category of categories) {
    const categoryPath = join(patternsDir, category);
    if (!existsSync(categoryPath)) {
      mkdirSync(categoryPath, { recursive: true });
      console.log(`   ✅ Created: ${category}/`);
    } else {
      console.log(`   ✓  Exists: ${category}/`);
    }
  }

  // Step 3: Move files
  console.log('\n📦 Step 3: Moving files to category folders...\n');

  const moveStats = new Map<string, number>();

  for (const [command, info] of commandsMap) {
    const targetDir = join(patternsDir, info.targetFolder);

    for (const sourceFile of info.sourceFiles) {
      if (!existsSync(sourceFile)) continue;

      const fileName = sourceFile.split(/[/\\]/).pop()!;
      const targetFile = join(targetDir, fileName);

      try {
        copyFileSync(sourceFile, targetFile);
        moveStats.set(info.targetFolder, (moveStats.get(info.targetFolder) || 0) + 1);
      } catch (error) {
        console.error(`   ❌ Failed to copy ${fileName}: ${error}`);
      }
    }
  }

  // Step 4: Summary by category
  console.log('\n📊 Step 4: Summary by category...\n');

  const categoryGroups = new Map<string, CommandInfo[]>();
  for (const info of commandsMap.values()) {
    if (!categoryGroups.has(info.targetFolder)) {
      categoryGroups.set(info.targetFolder, []);
    }
    categoryGroups.get(info.targetFolder)!.push(info);
  }

  for (const [folder, commands] of Array.from(categoryGroups.entries()).sort()) {
    console.log(`\n   ${folder}/ (${commands.length} commands):`);
    commands.forEach(cmd => {
      console.log(`      - ${cmd.command} (${cmd.category})`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('REORGANIZATION COMPLETE');
  console.log('='.repeat(80));
  console.log(`\nFiles organized into ${categories.size} category folders`);
  console.log(`Total commands: ${commandsMap.size}`);
  console.log('\nNext steps:');
  console.log('1. Review the new structure');
  console.log('2. Update registry.ts imports');
  console.log('3. Delete old directories (high-impact/, tier-5-8/, manual/)');
  console.log('4. Update workflow outputDir to use category-based paths');
  console.log('='.repeat(80) + '\n');
}

main().catch(console.error);
