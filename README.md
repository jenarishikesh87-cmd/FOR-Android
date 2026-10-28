# FOR v0.5 — Android App Build Kit

FOR v0.5 wraps the current FOR v0.4 web app in a Capacitor Android shell and adds OS-scheduled Android local notifications for supplement reminders. It is designed as a separate build so the already-working Cloudflare Pages website is not modified.

## What this phase adds

- Native Android app shell with app name **FOR** and package ID `com.jenarishikesh.forapp`.
- Android notification permission flow, a notification channel and a small monochrome status-bar icon.
- Scheduling for the next 14 days of enabled supplements on their selected weekdays.
- Native 30-minute snooze reminder scheduling, plus removal/rescheduling when supplements are added, disabled, deleted or marked taken/skipped.
- A GitHub Actions workflow that builds a debug APK and publishes it as a downloadable build artifact.
- Existing FOR workouts, routine, progress, body tracking, library, supplements, static friend snapshots and backup/restore carried over from v0.4.

## Important limitations

- **This ZIP is the Android project source/build kit, not a compiled APK.** The current build environment has no Android SDK/Gradle installation and cannot complete an APK build here. The included GitHub Actions workflow can compile it in a hosted build runner after the project is put into a GitHub repository.
- No signing key is included. The workflow creates a debug APK suitable for personal testing; it is not a Play Store release APK.
- Notification delivery is more robust than browser timers because Android schedules the events locally, but Android notification permission, exact-alarm permission, battery restrictions, force-stop behaviour and OEM settings can still affect delivery. No app can promise exact delivery in every state.
- The native app uses its own WebView storage, separate from Chrome's storage for `pages.dev`. **Export a FOR v0.4 backup from the website and import it into the Android app after installing it** to copy your current records.
- Friend data remains exported/imported snapshots, not live syncing. Cloud sync, authentication, Health Connect and server-backed friendships are separate future phases.

## Build steps

1. Create a GitHub repository for this project and upload the extracted contents of this ZIP to the repository root. Preserve the `.github/workflows/build-android.yml` path.
2. Open the repository's **Actions** tab and choose **Build FOR Android APK**. Run workflow, or push a commit after enabling Actions.
3. Wait for the workflow run to finish successfully.
4. Open that run's **Artifacts** section and download `FOR-Android-debug-APK`. Extract the artifact ZIP to obtain `app-debug.apk`.
5. On your Android phone, open the APK and allow installation from the browser/file manager when Android prompts you. Only install builds from your own repository and inspect workflow results before installing.
6. First launch: open the app, go to More → Backup & settings in the existing website and export a backup; then import that JSON backup in the native app using More → Backup & settings → Restore. Do not delete the old PWA until the import is verified.

## Local build prerequisites

Node.js 22, npm, Java 21 and Android SDK/platform tools are required. Then run:

```sh
npm install
npm run build
npx cap add android
node scripts/patch-android.mjs
npx cap sync android
cd android && ./gradlew assembleDebug
```

The APK is produced at `android/app/build/outputs/apk/debug/app-debug.apk`.
