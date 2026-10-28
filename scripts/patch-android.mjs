
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
    manifest = manifest.replace(
      '<application',
      `    <uses-permission android:name="${permission}" />\n    <application`
    );
  }
}

fs.writeFileSync(manifestPath, manifest);

// Keep the small monochrome notification icon.
const drawableDir = path.resolve(
  'android/app/src/main/res/drawable'
);
fs.mkdirSync(drawableDir, { recursive: true });

const notificationIcon = `<?xml version="1.0" encoding="utf-8"?>
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
  notificationIcon
);

// Use the supplied FOR logo for the Android launcher icon.
const logoSource = path.resolve('web/icons/for-logo.png');

if (!fs.existsSync(logoSource)) {
  throw new Error(`FOR logo not found: ${logoSource}`);
}

const resourcesDir = path.resolve('android/app/src/main/res');
const foregroundDir = path.join(resourcesDir, 'drawable-nodpi');
fs.mkdirSync(foregroundDir, { recursive: true });

fs.copyFileSync(
  logoSource,
  path.join(foregroundDir, 'for_launcher_foreground.png')
);

// Provide the logo to legacy launcher icon references too.
for (const density of [
  'mipmap-mdpi',
  'mipmap-hdpi',
  'mipmap-xhdpi',
  'mipmap-xxhdpi',
  'mipmap-xxxhdpi',
]) {
  const dir = path.join(resourcesDir, density);
  if (!fs.existsSync(dir)) continue;

  for (const filename of ['ic_launcher.png', 'ic_launcher_round.png']) {
    const target = path.join(dir, filename);
    if (fs.existsSync(target)) {
      fs.copyFileSync(logoSource, target);
    }
  }
}

// Android 8+ adaptive launcher icons.
const adaptiveDir = path.join(resourcesDir, 'mipmap-anydpi-v26');

if (fs.existsSync(adaptiveDir)) {
  const adaptiveIcon = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/for_launcher_background" />
    <foreground android:drawable="@drawable/for_launcher_foreground" />
</adaptive-icon>
`;

  for (const filename of ['ic_launcher.xml', 'ic_launcher_round.xml']) {
    const target = path.join(adaptiveDir, filename);
    if (fs.existsSync(target)) {
      fs.writeFileSync(target, adaptiveIcon);
    }
  }
}

const valuesDir = path.join(resourcesDir, 'values');
fs.mkdirSync(valuesDir, { recursive: true });

const colorsPath = path.join(valuesDir, 'colors.xml');
let colors = fs.existsSync(colorsPath)
  ? fs.readFileSync(colorsPath, 'utf8')
  : '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n</resources>\n';

if (!colors.includes('name="for_launcher_background"')) {
  colors = colors.replace(
    '</resources>',
    '    <color name="for_launcher_background">#09090B</color>\n</resources>'
  );
}

fs.writeFileSync(colorsPath, colors);

console.log('FOR notification icon and launcher branding configured.');
