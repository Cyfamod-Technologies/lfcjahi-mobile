# LFC Jahi Media — React Native + TypeScript

A native-component conversion of the LFC Jahi mobile prototype for Android, iOS and web. Expo SDK **58** (`expo ~58.0.23`), React Native **0.88.1**, React **19.3**, strict TypeScript and Node **24**. Exact resolved versions are committed in `package-lock.json`.

## Included

- Home, searchable message library, Sunday/Midweek filters, saved favourites and Connect.
- Audio streaming with `expo-audio`, mini-player, full player, seek slider, pause, rewind, next and native sharing.
- Playback configured for silent mode and background playback, with native lock-screen metadata.
- Dedicated Prayers tab with the five supplied intercessions for **Thursday, 5 November 2026**; expandable scriptures, prayer progress, reset and sharing.
- Persistent light/dark theme, saved messages and prayer progress on each device.
- Local artwork and bundled fonts; no runtime font CDN dependency.
- Production Docker web image, optional Docker Metro server and EAS build profiles.
- Winning Care, Follow-up and District sections are excluded. Home cells open the existing website directory.

This is a self-contained frontend prototype. Five selected sermons and one prayer guide are bundled; it does not automatically synchronize all website messages. Audio streams from the existing public LFC Jahi media URLs. Favourites and prayer progress are local to a device, without account sync. “Audio file” opens the original MP3 using the device/browser; it is not an offline-download manager. Shiloh and supplementary prayer collections open their existing links.

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

## Deploy to your server with Docker (production web)

Docker hosts the **web version** of the same React Native code. Native Android/iOS apps are installed on phones; they are not served from Docker. A web URL is opened in a browser, not pasted into Expo Go.

On a server with Docker Engine and the Docker Compose plugin:

```bash
cp .env.example .env
# Edit WEB_PORT if needed; keep WEB_BIND_ADDRESS=127.0.0.1 with a host reverse proxy.
docker compose up -d --build
curl http://127.0.0.1:8080/health
```

The web build runs in an unprivileged Nginx container on internal port 8080. Dependencies install with `npm ci`; the image build runs TypeScript and the Expo web export. The container includes an HTTP health check and restarts automatically.

Point your domain's DNS to the server. Configure your existing HTTPS reverse proxy to forward to `127.0.0.1:8080`. A host Caddy example is in `docker/Caddyfile.example`; replace `app.example.com` with your real domain. If your reverse proxy runs in a separate container, put both services on a shared Docker network and proxy to `web:8080` instead of host loopback.

For direct LAN testing without a reverse proxy, set `WEB_BIND_ADDRESS=0.0.0.0` and open `http://SERVER_IP:8080` in your phone's browser. Sharing and other browser APIs work best over HTTPS.

Update after changing code or prayer content:

```bash
docker compose up -d --build
```

No server files or environment secrets are needed for this prototype. Content changes are included during the build; rebuilding is required.

## Run Metro in Docker (native development testing)

Use this option when you want a phone to load the native app from your server while testing. It serves a development JavaScript bundle, not the production web app.

1. Install a matching SDK 58 development build on the phone (see EAS below), or use compatible Expo Go.
2. Copy `.env.example` to `.env` and set `METRO_HOST` to an IP/hostname reachable from the phone. Do not use `localhost` or the Docker container IP.
3. Start the separate development Compose file:

```bash
docker compose -f compose.dev.yaml up --build
```

Metro listens on TCP 8081 and prints the launch link. For LAN testing, the phone must be able to reach `http://METRO_HOST:8081`. Restrict development access to your testers or VPN. WebSockets must be forwarded if you use a reverse proxy.

For an HTTPS development hostname, set `METRO_PROXY_URL=https://metro.yourdomain.com`, set `METRO_HOST=metro.yourdomain.com`, and reverse proxy that separate hostname to port 8081. Use the launch URL emitted by Expo CLI, rather than the production web URL.

To explicitly use Expo Go with the development container:

```bash
docker compose -f compose.dev.yaml run --rm --service-ports metro npx expo start --go --lan --port 8081
```

Stop an already-running `metro` service before using this alternate command, so the port is free. Expo Go must support SDK 58. Background playback and lock-screen behaviour must be verified in your own native build.

### Metro startup troubleshooting

After changing the development Dockerfile or Metro configuration, rebuild and recreate the service:

```bash
docker compose -f compose.dev.yaml up -d --build --force-recreate metro
docker compose -f compose.dev.yaml logs -f metro
```

The development image does not set `CI`: CI mode disables Metro's file watching and reloads. Source files are copied into this image, so host edits still require a rebuild.

`invalid asset file path: .env` means an HTTP request reached Metro's asset handler for an environment file. It does not mean the app needs an `.env` asset. Such requests can come from automated probes; check your reverse proxy access logs to identify the caller. `metro.config.js` returns 404 for these requests before asset parsing. Keep `.env` excluded by `.dockerignore`.

The React Native DevTools download warning is separate: Expo uses its fallback when the container cannot download the latest tools. Check the server/container's outbound connectivity, DNS and proxy settings if you need the latest DevTools.

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

For Play Store production AAB:

```bash
npx eas-cli@latest build --platform android --profile production
```

For iOS, use `--platform ios`; EAS cloud builds avoid needing Xcode on your own machine. Apple signing, device registration for internal distribution, and Apple account requirements still apply. `eas init` adds your real project ID; none is fabricated or preconfigured here.

## Edit content

- `src/data/messages.json`: title, pastor, date, service, source MP3, original message link and local artwork index.
- `src/data/prayers.json`: add another dated guide, each with a unique ID, prayer text, scripture reference and full passage. Progress keys include the guide ID, keeping days separate.
- `src/data/resources.json`: church, Shiloh, home-cell and supplementary prayer links.
- `src/theme.ts`: colours and typography.
- `assets/`: local artwork. `artwork` in `src/components/MessageRow.tsx` maps each image index.

A future CMS/API can replace these JSON imports; no backend credentials are embedded. Any `EXPO_PUBLIC_*` variables added in future are public build-time configuration, never a place for secrets.

## Project structure

```text
App.tsx                     app shell, tabs, state and audio lifecycle
src/components/             shared controls, message rows and full player
src/screens/                home, library and prayer views
src/hooks/                  validated persistent state
src/data/                   bundled content
Dockerfile                  production web export + unprivileged Nginx
Dockerfile.dev              Metro development image
compose.yaml                production service
compose.dev.yaml            native development service
app.json / eas.json          native configuration and build profiles
```

## Verification

```bash
npm run typecheck
npm run check:sdk
npm run build:web
npx expo export --platform android --platform ios --output-dir native-bundles
```

The delivery passed TypeScript and production web compilation, plus Android and iOS JavaScript/Hermes bundle export. The SDK compatibility check passed using the installed SDK’s local dependency map (`EXPO_OFFLINE=1`); the online compatibility endpoint timed out in this environment. Browser checks passed for theme persistence, saved messages, prayer progress, scripture expansion, audio loading and play/pause. Bundle export is not the same as an Android/iOS binary build. Docker Engine and native device/emulator runtimes are unavailable in the authoring environment, so Docker execution, native signing/builds, background playback, lock-screen controls and physical-device behaviour must be checked on your server/phone.

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
