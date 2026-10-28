
import fs from 'node:fs';
import path from 'node:path';

const manifestPath = path.resolve(
  'android/app/src/main/AndroidManifest.xml'
);

if (!fs.existsSync(manifestPath)) {
  throw new Error(`Android manifest not found: ${manifestPath}`);
}

let manifest = fs.readFileSync(manifestPath, 'utf8');

const permissions = [
  'android.permission.POST_NOTIFICATIONS',
  'android.permission.SCHEDULE_EXACT_ALARM',
];

for (const permission of permissions) {
  if (!manifest.includes(`android:name="${permission}"`)) {
    const tag = `    <uses-permission android:name="${permission}" />\n`;
    manifest = manifest.replace('<application', `${tag}<application`);
  }
}

fs.writeFileSync(manifestPath, manifest);

const drawableDir = path.resolve(
  'android/app/src/main/res/drawable'
);

fs.mkdirSync(drawableDir, { recursive: true });

const icon = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FFFFFFFF"
        android:pathData="M3,9h2V7h3v3h8V7h3v2h2v6h-2v2h-3v-3H8v3H5v-2H3z" />
</vector>
`;

fs.writeFileSync(
  path.join(drawableDir, 'ic_stat_for.xml'),
  icon
);

console.log('FOR notification permissions and icon configured.');
