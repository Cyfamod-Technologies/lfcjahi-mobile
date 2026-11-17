# LFC Jahi Media — React Native + TypeScript

A native-component conversion of the LFC Jahi mobile prototype for Android, iOS and web. Expo SDK **58** (`expo ~58.0.23`), React Native **0.88.1**, React **19.3**, strict TypeScript and Node **24**. Exact resolved versions are committed in `package-lock.json`.

## Included

- Home, searchable message library, service filters from the API, saved favourites.
- Audio streaming with `expo-audio`, mini-player, full player, seek slider, pause, rewind, next and native sharing.
- Playback configured for silent mode and background playback, with native lock-screen metadata.
- Dedicated Prayers tab with the five supplied intercessions for **Thursday, 5 November 2026**; expandable scriptures, prayer progress, reset and sharing.
- Persistent light/dark theme, saved messages and prayer progress on each device.
- Local artwork and bundled fonts; no runtime font CDN dependency.
- Production Docker web image, optional Docker Metro server and EAS build profiles.
- Four focused tabs: Home, Messages, Prayers and Saved. Service filters open in a compact selector.

Messages and speaker artwork synchronize with the public backend. Responses are cached on the device for offline browsing; streaming undownloaded audio requires a connection. Pull down to refresh or use Retry after an error. An empty successful response clears older content. Favourites and prayer progress stay on the device without account sync. Download saves audio on the device inside the app for offline playback, with progress and success feedback.

Prayer guides are bundled because the backend has no public prayer endpoint. Their dates are shown explicitly. Shiloh, fellowship directories and external prayer-resource links are excluded from the mobile interface.

## Backend configuration

Copy `.env.example` to `.env`, retaining these public build settings:

```dotenv
EXPO_PUBLIC_API_URL=https://api.lfcjahi.com
EXPO_PUBLIC_SITE_URL=https://lfcjahi.com
```

Use an origin without `/api`. No API key or admin credentials are required for `/api/media`. These variables are embedded in the application bundle and must never contain secrets. Defaults match the frontend production origins. For a local backend, use an HTTPS hostname or LAN IP reachable from the phone; `localhost` on a phone points to that phone. Reload after changing `.env`; installed apps require a new build/update. EAS profiles explicitly supply production origins; change the selected profile to target staging. Docker uses build arguments for web and environment variables for Metro.

## Run locally

Install Node 24.3+ on the Node 24 line. Then:

```bash
npm ci
npm run start
```

Because this project includes `expo-dev-client`, the default workflow uses a development build. To use Expo Go instead, install a version compatible with SDK 58 and run:

```bash
npx expo start --go
```

Your phone must reach the address printed by Metro. For LAN use, connect the computer and phone to the same network. No emulator is required when testing on a real phone.

For web development:

```bash
npm run web
```

## Docker web build

Docker serves the web version. Native apps are installed on phones.

```bash
docker build --build-arg EXPO_PUBLIC_API_URL=https://api.lfcjahi.com --build-arg EXPO_PUBLIC_SITE_URL=https://lfcjahi.com -t lfc-jahi-web .
docker run -d --name lfc-jahi-web -p 127.0.0.1:8080:8080 lfc-jahi-web
curl http://127.0.0.1:8080/health
```

Forward your HTTPS reverse proxy to port 8080. Public URLs are embedded during the build. Published messages and directory edits load without rebuilding; bundled prayer changes require a rebuild.

## Docker Metro testing

```bash
docker build -f Dockerfile.dev -t lfc-jahi-dev .
docker run --rm -it -p 8081:8081 -e REACT_NATIVE_PACKAGER_HOSTNAME=YOUR_SERVER_IP -e EXPO_PUBLIC_API_URL=https://api.lfcjahi.com -e EXPO_PUBLIC_SITE_URL=https://lfcjahi.com lfc-jahi-dev
```

Use an IP reachable from the phone and an SDK 58 compatible Expo Go installation or development build. Source edits require rebuilding the image. Test background audio and lock-screen controls in your native build. Compose files are intentionally omitted.

## Build an installable Android app

EAS uses your Expo account. Review the app name, bundle IDs in `app.json` and icon before registering/building. The package identifier currently uses `com.cyfamod.lfcjahi.media`; change it if you use a different organization identifier.

```bash
npx eas-cli@latest login
npx eas-cli@latest init
# Internal test APK: runs independently without Metro or Expo Go.
npx eas-cli@latest build --platform android --profile preview
```

For a development APK that connects to Metro:

```bash
npx eas-cli@latest build --platform android --profile development
```

For a signed Play Store Android App Bundle (`.aab`):

```bash
npm run build:android:store
```

Download the completed bundle from the Expo build page for a manual upload, or use the [Android CI/CD workflow](docs/android-releases.md). Pull requests run quality checks; a push to `prod` or a manual release from `main`/`prod` queues an EAS build and submission to Google Play closed testing. One-time Expo/Play credentials setup is required. Promote the tested bundle to production in Play Console.

For iOS, use `--platform ios`; EAS cloud builds avoid needing Xcode on your own machine. Apple signing, device registration for internal distribution, and Apple account requirements still apply. The project is linked to `@cyfamod_technologies/lfc-jahi-media` using its real Expo project ID. Production builds create a signed Android App Bundle with the production API origin and increment the Android version code.

## Edit content

- Messages and directory: manage published content in the backend/admin. `src/api.ts` validates and maps the public API responses. The older `src/data/messages.json` is retained as reference and is not loaded by the app.
- `src/data/prayers.json`: add another dated guide, each with a unique ID, prayer text, scripture reference and full passage. Progress keys include the guide ID, keeping days separate.
- `src/data/resources.json`: church, Shiloh, home-cell and supplementary prayer links.
- `src/theme.ts`: colours and typography.
- `assets/`: local artwork. `artwork` in `src/components/MessageRow.tsx` maps each image index.

No backend credentials are embedded. `EXPO_PUBLIC_*` variables are public build-time configuration.

## Project structure

```text
App.tsx                     shared shell, state and audio lifecycle
src/app/                    Expo Router tab routes
src/api.ts                  public API configuration and response mapping
src/components/             shared controls, message rows and full player
src/screens/                home, library and prayer views
src/hooks/                  validated persistent state
src/data/                   bundled content
Dockerfile                  production web export + unprivileged Nginx
Dockerfile.dev              Metro development image
app.json / eas.json          native configuration and build profiles
```

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run check:sdk
npm run build:web
npx expo export --platform android --platform ios --output-dir native-bundles
```

Automated checks cover TypeScript, ESLint, API contract tests, SDK dependency compatibility (using the local SDK map), web compilation and Android/iOS JavaScript bundle export. Live API checks returned 234 audio messages, 30 districts, 65 zones and 358 home cells, and confirmed public CORS access. Browser automation was unavailable during this update, so rendering and interaction checks remain manual. Bundle export does not produce a signed installable binary. Verify audio streaming, background playback, lock-screen controls, phone/map links and native sharing on a physical device.

Manual acceptance checks:

1. Toggle light/dark, close/reopen: the choice remains.
2. Search by title/pastor and filter by service.
3. Play a message, seek, pause/resume, close the player and reopen from mini-player.
4. Save a message, reopen app and check Saved; remove it.
5. Open Prayers, expand a scripture, mark prayed, reopen guide and reset.
6. Share a prayer guide/message on a real device; verify external collection links.
7. Test background audio/lock screen and headphone disconnection with a native build.
8. After Docker deployment, check `/health`, page refresh, asset loading and playback over HTTPS.

## Reference

- Expo SDK 58: https://expo.dev/changelog/sdk-58
- Expo Audio: https://docs.expo.dev/versions/latest/sdk/audio/
- Expo web export: https://docs.expo.dev/guides/publishing-websites/
- EAS Build: https://docs.expo.dev/build/introduction/

# lfcjahi-mobile

Live API acceptance checks:

1. Confirm the Home card matches the latest published backend message and artwork.
2. Search all messages; verify service filters use backend service names.
3. Open the service selector, choose a service and confirm matching messages appear.
4. Refresh online, restart offline and confirm cached content plus a retry message. Restore connectivity and retry.
5. Confirm shared links open the exact message in the app after domain verification. Download a message, confirm success without leaving the app, then find it in Saved.

## Launch experience

A dark native launch screen transitions into a warm, animated introduction with the church identity, a sound wave and Romans 10:17. The introduction fades into the app after approximately 3.7 seconds, or sooner with “Enter the Word.” Reduced-motion settings bypass the animation. Startup waits for fonts and local preferences, independently of API connectivity. No audio plays automatically.

The animated introduction also appears on web. Native launch artwork/background changes require a new Android/iOS build; Expo Go does not reproduce the final system splash screen. Verify the full launch transition in a release build.

## Downloads and message links

The player fits on one screen without scrolling. Download saves audio inside the native app, reports progress and confirms success; downloaded messages appear in Saved and play from the local file without a network connection. Failed transfers remove partial files. Clearing app storage or uninstalling removes downloads.

Android HTTPS App Links cover `https://lfcjahi.com/messages/*` and `https://www.lfcjahi.com/messages/*`. Each opens the matching message without autoplay. Website source includes `homepage/public/.well-known/assetlinks.json`; deploy it to both hosts with HTTP 200, JSON content type and no redirects. Its certificate fingerprint matches the Expo-signed APK. If Google Play App Signing uses a different certificate, add its SHA-256 fingerprint from Play Console → App integrity before publishing the store release. Do not replace it with a SHA-1 fingerprint.

Verify after deployment with `adb shell pm verify-app-links --re-verify com.cyfamod.lfcjahi.media` and `adb shell pm get-app-links com.cyfamod.lfcjahi.media`. Custom `lfcjahi://messages/247` links also open individual messages. The website has an explicit Android app button for browsers that keep links inside their own window.

## Tablet layouts

The shell expands to 1120 points on larger displays. Home, Messages and Saved use two message columns at widths of 768 points and above, returning to one column in narrow split-screen windows or with larger accessibility text. Prayer guides retain a readable 760-point column. The player supports scrolling in short landscape windows. Native orientation follows the device; this configuration requires a new native build.

The home feature uses the same bundled Bishop David Oyedepo photograph as the website, with ministry-focused wording and an overseer credit. The latest-message title and actual speaker remain visible beside its listening action.
