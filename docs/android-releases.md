# Android CI/CD

This repository uses two GitHub Actions workflows and EAS cloud builds. Unlike the school app, it has one app, one submission profile, no build matrix, no local Gradle/signing scripts, and no release-record parser.

## Everyday workflow

- Pull requests and pushes to `main`: install from the lockfile, lint, typecheck, run tests, and export the Android JavaScript/assets bundle. These checks do not compile native code.
- Release: merge the tested changes into `prod`, or select **Actions → Release Android to Google Play → Run workflow** on `main` or `prod`. Other branches cannot release.
- The release workflow reruns checks, then queues a signed production AAB on EAS with automatic submission of that exact build to Google Play **internal testing**.
- Install through the Play internal tester link and verify startup, streaming, background audio, downloads, offline playback and message links. Promote the tested release to production in Play Console when ready.

A green release workflow means EAS accepted the request, not that the build or submission finished. Follow the build/submission URLs in the Actions log or use the Expo dashboard. Native build failures and Google Play errors appear there. Do not retry blindly after a workflow timeout: check whether a build was already queued. Cloud builds consume your Expo build quota or credits.

## One-time setup

1. Push this app as its own GitHub repository, with `.github` at the repository root. These workflows assume the same layout as `package.json`. Configure branch protection on `main` and `prod`; require the CI checks for PRs. The workflows do not create branches or protection rules.
2. Use an Expo account with access to `@cyfamod_technologies/lfc-jahi-media` (project `4bc7da12-b340-4e21-9a9a-6d4fbdb21d60`). Create an Expo access token and add it as the GitHub repository Actions secret **EXPO_TOKEN**. This is the only GitHub secret required.
3. Authenticate locally and configure the Android signing credentials:

   ```bash
   npx eas-cli@latest login
   npx eas-cli@latest credentials --platform android
   ```

   Select `production`. Reuse the existing upload keystore for `com.cyfamod.lfcjahi.media`; if the app already exists on Play, it must match the registered upload key. Keep a secure backup. Never commit the keystore or passwords.
4. Before the first automated release, initialize/synchronize the remote Android version with the highest version code already built or uploaded to any Play track:

   ```bash
   npx eas-cli@latest build:version:set --platform android --profile production
   ```

   The local config currently contains version code **3**; check Play and EAS for any higher codes. EAS now owns the version code and increments it for each production build. `expo.version` in `app.json` remains the user-facing version and should be changed intentionally.
5. Create/select the Play Console app with package `com.cyfamod.lfcjahi.media`. Create a Google service account, enable the Google Play Android Developer API and grant that account release access to this app. Upload its JSON key to **Expo project → Credentials → Android → application identifier → Google service account key for Expo Submit**, or configure it using `eas credentials` above. Store it in Expo; no JSON key belongs in this repository or GitHub.
6. Complete Play listing/setup requirements and configure the internal tester list and opt-in link. If Google requires the app to remain a draft during initial setup, temporarily use `releaseStatus: "draft"` in `eas.json` and complete the release in Play Console. Check the Play App Signing certificate against the website's `assetlinks.json` before testing HTTPS app links.
7. Complete one interactive production build to resolve any credential/configuration prompts before relying on non-interactive CI:

   ```bash
   npm run build:android:store
   ```

   This builds an AAB without submitting. The automated workflow builds its own new version; it does not select an arbitrary latest build.

No EAS GitHub build trigger is needed in addition to these workflows. Enabling a second trigger for the same branch can duplicate builds. Keep `track: "internal"` for this pipeline; production rollout is a Play Console promotion of the tested bundle.

## References

- [Expo CI setup and authentication](https://docs.expo.dev/build/building-on-ci/)
- [Google Play credentials and submission](https://docs.expo.dev/submit/android/)
- [Remote version management](https://docs.expo.dev/build-reference/app-versions/)
- [Automatic submission behavior](https://docs.expo.dev/build/automate-submissions/)
