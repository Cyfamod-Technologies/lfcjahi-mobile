const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(fetchImpl = fetch, env = {}) {
  const source = fs.readFileSync(require.resolve('../src/api.ts'), 'utf8');
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText,
    { exports, process: { env }, URL, AbortController, setTimeout, clearTimeout, fetch: fetchImpl },
  );
  return exports;
}
const plain = (value) => JSON.parse(JSON.stringify(value));
test('uses public production defaults and accepts an API suffix', () => {
  assert.equal(load().apiBaseUrl, 'https://api.lfcjahi.com');
  assert.equal(
    load(fetch, { EXPO_PUBLIC_API_URL: 'https://example.com/api/' }).apiBaseUrl,
    'https://example.com',
  );
});
test('normalizes published audio contracts, images, download and website sharing', () => {
  const api = load();
  const result = plain(
    api.normalizeMessages([
      {
        id: '1',
        category: 'Audio',
        title: 'Older',
        mediaDate: '2026-01-01',
        mediaUrl: '/storage/a.mp3',
        speakerImageUrl: '/storage/a.png',
      },
      {
        id: '2',
        category: 'Audio',
        title: 'Latest',
        mediaDate: '2026-02-01',
        mediaUrl: 'https://cdn.example/b.mp3',
        subcategory: 'Midweek Service',
      },
      { id: '3', category: 'Video', mediaUrl: 'https://cdn.example/a.mp4' },
      null,
      { id: '4', category: 'Audio' },
      { id: '5', category: 'Audio', mediaUrl: 'javascript:alert(1)' },
    ]),
  );
  assert.deepEqual(
    result.map((m) => m.id),
    ['2', '1'],
  );
  assert.equal(result[0].service, 'Midweek Service');
  assert.equal(result[0].downloadUrl, 'https://api.lfcjahi.com/api/media/2/download');
  assert.equal(result[0].url, 'https://lfcjahi.com/messages/2');
  assert.equal(result[1].imageUrl, 'https://api.lfcjahi.com/storage/a.png');
});
test('empty collections remain empty', () => {
  assert.deepEqual(plain(load().normalizeMessages([])), []);
  assert.deepEqual(plain(load().normalizeDistricts([])), []);
});
test('maps district hierarchy and tolerates missing optional fields', () => {
  const [d] = plain(
    load().normalizeDistricts([
      { id: '1', name: 'Jahi', zones: [{ id: '2', cells: [{ id: '3', phone: '+234123' }] }] },
    ]),
  );
  assert.equal(d.zones[0].cells[0].phone, '+234123');
  assert.equal(d.zones[0].cells[0].address, '');
  assert.deepEqual(d.homeCellPastors, []);
});
test('requests only public collections and validates the envelope', async () => {
  const api = load(async (url, options) => {
    assert.equal(url, 'https://api.lfcjahi.com/api/media');
    assert.equal(options.headers.Accept, 'application/json');
    return { ok: true, json: async () => ({ data: [] }) };
  });
  assert.deepEqual(plain(await api.fetchCollection('media')), []);
  await assert.rejects(
    load(async () => ({ ok: true, json: async () => ({ invalid: [] }) })).fetchCollection('media'),
    /Unexpected server response/,
  );
  await assert.rejects(
    load(async () => ({ ok: false, status: 503 })).fetchCollection('media'),
    /503/,
  );
});
