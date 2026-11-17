# Android CI/CD

This repository uses two GitHub Actions workflows and EAS cloud builds. Unlike the school app, it has one app, one submission profile, no build matrix, no local Gradle/signing scripts, and no release-record parser.

## Everyday workflow

- Pull requests and pushes to `main`: install from the lockfile, lint, typecheck, run tests, and export the Android JavaScript/assets bundle. These checks do not compile native code.
- Release: merge the tested changes into `prod`, or select **Actions → Release Android to Google Play → Run workflow** on `main` or `prod`. Other branches cannot release.
- The release workflow reruns checks, then queues a signed production AAB on EAS with automatic submission of that exact build to Google Play **closed testing**.
- Install through the Play closed-testing opt-in link and verify startup, streaming, background audio, downloads, offline playback and message links. Promote the tested release to production in Play Console when ready.

A green release workflow means EAS accepted the request, not that the build or submission finished. Follow the build/submission URLs in the Actions log or use the Expo dashboard. Native build failures and Google Play errors appear there. Do not retry blindly after a workflow timeout: check whether a build was already queued. Cloud builds consume your Expo build quota or credits.

The submission profile targets the standard closed-testing track ID `alpha`. If your existing closed test uses a custom track ID, replace `submit.production.android.track` in `eas.json` with that exact ID before submitting. A track's display name may differ from its API ID. Check **Play Console → Testing → Closed testing → your track → Releases** and Expo's Submissions page for results.

To submit an already completed build without rebuilding, run this from the project directory and select the intended build:

```bash
npx eas-cli@latest submit --platform android --profile production
```

Changing this configuration does not move an existing release or submission to another track.

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
6. Complete Play listing/setup requirements and configure the closed-testing tester list and opt-in link. If Google requires the app to remain a draft during initial setup, temporarily use `releaseStatus: "draft"` in `eas.json` and complete the release in Play Console. Check the Play App Signing certificate against the website's `assetlinks.json` before testing HTTPS app links.
7. Complete one interactive production build to resolve any credential/configuration prompts before relying on non-interactive CI:

   ```bash
   npm run build:android:store
   ```

   This builds an AAB without submitting. The automated workflow builds its own new version; it does not select an arbitrary latest build.

No EAS GitHub build trigger is needed in addition to these workflows. Enabling a second trigger for the same branch can duplicate builds. Keep `track: "alpha"` for this pipeline; production rollout is a Play Console promotion of the tested bundle.

## Expo access errors

`Entity Not Authorized: AppEntity[4bc7da12-b340-4e21-9a9a-6d4fbdb21d60]` means the identity supplied by `EXPO_TOKEN` cannot read the linked project. npm deprecation warnings are unrelated. No build is queued when this access check fails.

If the error names `RobotViewerContext`, the request is authenticated as a robot user. Verify that robot belongs to the account owning this project and has the Developer role or higher. A robot for the school app's account does not automatically have access to LFC Jahi's account.

To resolve:

1. Open the existing [LFC Jahi Expo project](https://expo.dev/accounts/cyfamod_technologies/projects/lfc-jahi-media) using an account that can access it. Verify its project ID matches `extra.eas.projectId` in `app.json`.
2. Use a token from a user with access to that owning account, or configure a robot in that account with Developer access. For a limited personal token, include the owning account with Developer access as well. Create tokens in [Expo Access tokens](https://expo.dev/settings/access-tokens).
3. Replace **GitHub repository → Settings → Secrets and variables → Actions → EXPO_TOKEN** with that token, then rerun the failed release. Do not paste it into source code or logs.
4. The workflow prints `eas whoami` and checks `eas project:info` before queueing. Confirm these identify the intended identity and project. If a local login works but CI fails, they may be using different identities: `EXPO_TOKEN` overrides a saved CLI login, so `eas login` does not override the CI token.

Keep the existing project ID and upload keystore. Relinking to a new project does not repair the old project's access permissions. Repository code cannot grant an Expo identity access or replace the GitHub secret.

## References

- [Expo CI setup and authentication](https://docs.expo.dev/build/building-on-ci/)
- [Google Play credentials and submission](https://docs.expo.dev/submit/android/)
- [Remote version management](https://docs.expo.dev/build-reference/app-versions/)
- [Automatic submission behavior](https://docs.expo.dev/build/automate-submissions/)

## Play Console display warnings

The current source uses `orientation: "default"`. Expo manifest introspection produces `android:screenOrientation="unspecified"` for MainActivity, with no explicit application/activity resizability restriction. `npm run check:android-config` verifies this after config plugins run, and CI enforces it. It checks the generated configuration, not a previously uploaded AAB.

If Play reports `screenOrientation="PORTRAIT"`, compare the affected Play version code and build commit with this configuration. Build and upload a new AAB containing the tablet/orientation changes; a JavaScript update cannot change the Android manifest. Test rotation, split-screen, prayer reading and the audio player on Android 15/16 tablets and foldables before promotion.

The installed React Native 0.88.1 source includes status/navigation bar color assignments in `ReactAndroid/src/main/java/com/facebook/react/views/view/WindowUtil.kt` (`enableEdgeToEdge`) and legacy cutout constants in its window helpers. These match part of the Play warning. App StatusBar components set icon brightness only; no deprecated bar-color parameters are configured by application code. Other obfuscated callers cannot be identified without the affected build's mapping file.

The generated manifest check does not remove deprecated bytecode from framework dependencies or guarantee a warning-free Play report. Recheck the report on the new AAB. Resolving remaining library calls requires a compatible upstream fix; avoid editing generated Android files or disabling edge-to-edge. See [Android 16 adaptive display changes](https://developer.android.com/about/versions/16/behavior-changes-16) and [Expo status bar documentation](https://docs.expo.dev/versions/v58.0.0/sdk/status-bar/).
