
import fs from 'fs';
import path from 'path';

const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');
const RELEASE_NOTES_PATH = path.join(process.cwd(), 'public', 'data', 'release_notes.json');

interface Release {
  version: string;
  date: string;
  changes: string[];
}

interface ReleaseData {
  releases: Release[];
  upcoming: string[];
  known_issues?: string[];
}

function syncReleaseNotes() {
  try {
    // 1. Read package.json
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
    const currentVersion = packageJson.version;
    console.log(`Current package version: ${currentVersion}`);

    // 2. Read release_notes.json
    let releaseData: ReleaseData;
    if (fs.existsSync(RELEASE_NOTES_PATH)) {
      releaseData = JSON.parse(fs.readFileSync(RELEASE_NOTES_PATH, 'utf-8'));
    } else {
      console.log('release_notes.json not found, creating new one.');
      releaseData = { releases: [], upcoming: [] };
    }

    // 3. Check latest release
    const latestRelease = releaseData.releases.length > 0 ? releaseData.releases[0] : null;

    if (latestRelease && latestRelease.version === currentVersion) {
      console.log('Release notes are up to date.');
      return;
    }

    // 4. Create new release entry
    console.log(`Adding new release entry for version ${currentVersion}...`);
    const today = new Date().toISOString().split('T')[0];
    const newRelease: Release = {
      version: currentVersion,
      date: today,
      changes: ['New release (auto-generated)']
    };

    releaseData.releases.unshift(newRelease);

    // 5. Write back to file
    fs.writeFileSync(RELEASE_NOTES_PATH, JSON.stringify(releaseData, null, 2));
    console.log('Successfully updated release_notes.json');

  } catch (error) {
    console.error('Error syncing release notes:', error);
    process.exit(1);
  }
}

syncReleaseNotes();
