const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { mkdtempSync, openSync, closeSync, readFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');

// Inspect the manifest after Expo config plugins, not just app.json.
const cli = path.join(path.dirname(require.resolve('expo/package.json')), 'bin/cli');
function check() {
  const directory = mkdtempSync(path.join(tmpdir(), 'lfc-android-config-'));
  let config;
  try {
    const file = path.join(directory, 'config.json');
    const output = openSync(file, 'w');
    try {
      execFileSync(process.execPath, [cli, 'config', '--type', 'introspect', '--json'], {
        stdio: ['ignore', output, 'inherit'],
      });
    } finally {
      closeSync(output);
    }
    config = JSON.parse(readFileSync(file, 'utf8'));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
  const manifest = config._internal.modResults.android.manifest.manifest;
  const application = manifest.application[0];
  const activity = application.activity.find((item) => item.$['android:name'] === '.MainActivity');
  assert.ok(activity, 'Generated manifest must contain MainActivity');
  const orientation = activity.$['android:screenOrientation'];
  assert.ok(
    !orientation || orientation === 'unspecified',
    `MainActivity must allow device orientation; received ${orientation}`,
  );
  for (const item of [application, activity]) {
    assert.notEqual(
      item.$['android:resizeableActivity'],
      'false',
      'The application and MainActivity must allow window resizing',
    );
  }
  console.log('Generated Android manifest: orientation unrestricted; resizing not disabled.');
}
check();
