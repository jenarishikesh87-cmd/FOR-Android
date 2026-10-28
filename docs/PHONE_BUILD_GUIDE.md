# Build the FOR Android test APK from a phone

This guide uses a hosted GitHub Actions runner so Android Studio/SDK do not need to be installed on your phone.

1. In your phone browser, open GitHub and create a new **private** repository named `FOR-Android` (recommended because source includes your project branding).
2. Extract `FOR-v0.5-android-kit.zip` with your file manager. Use GitHub's **Add file → Upload files** to upload all project files, keeping folder paths. The workflow must be at `.github/workflows/build-android.yml`; `package.json` must be at the root. If GitHub's phone upload flow cannot preserve folders, use a Git client or a cloud development environment that can import a ZIP/repository.
3. Open the repository's **Actions** tab, allow Actions if asked, and choose **Build FOR Android APK** from the workflow list.
4. Tap **Run workflow**. If the workflow is not listed yet, commit the workflow file to the default branch first.
5. Open the run after it completes. Under **Artifacts**, download `FOR-Android-debug-APK`.
6. Extract `app-debug.apk` from the downloaded artifact ZIP. Install it for personal testing; Android may ask to allow APK installation from your browser/file manager.

## If the workflow fails

Open the failed job, inspect the first red step and its logs, and use those logs to diagnose. Do not delete your working Cloudflare Pages site. Your PWA remains the fallback.

## Moving existing records

The Android WebView and Chrome do not share local storage. Export a JSON backup from the existing FOR PWA and use Restore in the native app. Verify workout history and body records before relying on the native build as your main copy.
