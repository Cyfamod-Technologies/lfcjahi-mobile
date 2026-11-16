const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function setup(mode = 'success') {
  const files = new Map();
  const moves = [];
  class Directory {
    constructor(...parts) {
      this.uri = parts.map((p) => p.uri || p).join('/');
    }
    create() {}
  }
  class File {
    constructor(...parts) {
      this.uri = parts.map((p) => p.uri || p).join('/');
    }
    get exists() {
      return files.has(this.uri);
    }
    get size() {
      return files.get(this.uri) || 0;
    }
    delete() {
      files.delete(this.uri);
    }
    move(dest) {
      files.set(dest.uri, this.size);
      files.delete(this.uri);
      moves.push(dest.uri);
      this.uri = dest.uri;
    }
    static async downloadFileAsync(url, target, options) {
      assert.equal(url, 'https://api.example/media/247/download');
      options.onProgress({ bytesWritten: 50, totalBytes: 100 });
      files.set(target.uri, mode === 'empty' ? 0 : 100);
      if (mode === 'failure') throw Error('network error');
      return target; // The returned file may mutate its URI when moved.
    }
  }
  const exports = {};
  const source = fs.readFileSync(require.resolve('../src/downloads/storage.ts'), 'utf8');
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText,
    {
      exports,
      URL,
      require: () => ({ Directory, File, Paths: { document: 'file:///documents' } }),
    },
  );
  return { api: exports, files, moves };
}
const message = {
  id: '247',
  audioUrl: 'https://cdn.example/audio.mp3',
  downloadUrl: 'https://api.example/media/247/download',
};
test('downloads via backend, reports progress, and retains the final offline audio', async () => {
  const { api, files, moves } = setup();
  const progress = [];
  const filename = await api.downloadAudio(
    message,
    (p) => progress.push(p),
    new AbortController().signal,
  );
  assert.equal(filename, 'message-247.mp3');
  assert.deepEqual(progress, [50]);
  assert.equal(files.size, 1);
  assert.equal(moves.length, 1);
  assert.equal(api.localAudio(filename), 'file:///documents/messages/message-247.mp3');
});
test('network errors clean up incomplete files and never create an offline entry', async () => {
  const { api, files } = setup('failure');
  await assert.rejects(
    api.downloadAudio(message, () => {}, new AbortController().signal),
    /network error/,
  );
  assert.equal(files.size, 0);
  assert.equal(api.localAudio('message-247.mp3'), undefined);
});
test('empty downloads are rejected and removed', async () => {
  const { api, files } = setup('empty');
  await assert.rejects(
    api.downloadAudio(message, () => {}, new AbortController().signal),
    /Empty audio/,
  );
  assert.equal(files.size, 0);
});
