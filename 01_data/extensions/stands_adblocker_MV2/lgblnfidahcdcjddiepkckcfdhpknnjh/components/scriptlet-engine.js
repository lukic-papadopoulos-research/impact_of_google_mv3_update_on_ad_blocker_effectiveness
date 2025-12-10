"use strict";

const extToMimeMap = new Map([['css', 'text/css'], ['fn', 'fn/javascript'], ['gif', 'image/gif'], ['html', 'text/html'], ['js', 'text/javascript'], ['json', 'application/json'], ['mp3', 'audio/mp3'], ['mp4', 'video/mp4'], ['png', 'image/png'], ['txt', 'text/plain'], ['xml', 'text/xml']]);
const mimeFromName = name => {
  const match = /\.([^.]+)$/.exec(name);
  return match ? extToMimeMap.get(match[1]) || '' : '';
};
const createScriptletEntry = details => {
  const entry = {
    mime: '',
    data: '',
    world: 'MAIN',
    dependencies: [],
    ...details
  };
  if (entry.data.startsWith('data:')) {
    const [header, content] = entry.data.split(',', 2);
    const isBase64 = header.endsWith(';base64');
    entry.data = isBase64 ? atob(content) : content;
  }
  return entry;
};
class ScriptletEngine extends InitializableComponent {
  resources = new Map();
  modifyTime = Date.now();
  contentFromName(name, mime = '') {
    const entry = this.resources.get(name);
    if (entry && entry.mime.startsWith(mime)) {
      return {
        js: entry.data,
        world: entry.world,
        dependencies: [...entry.dependencies]
      };
    }
  }
  async initInternal() {
    this.resources.clear();
    for (const scriptlet of backgroundScriptlets) {
      const details = {
        mime: mimeFromName(scriptlet.name),
        data: scriptlet.fn.toString()
      };
      for (const [key, value] of Object.entries(scriptlet)) {
        if (key !== 'fn') {
          details[key] = value;
        }
      }
      const entry = createScriptletEntry(details);
      this.resources.set(details.name, entry);
    }
    this.modifyTime = Date.now();
  }
}
const scriptletEngine = new ScriptletEngine();