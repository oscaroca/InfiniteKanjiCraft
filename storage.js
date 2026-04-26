// storage.js — localStorage save/load
window.IJ = window.IJ || {};

IJ.storage = {
  KEY: 'infiniteJapanese_v1',

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data.version !== 1) return null;
      return data;
    } catch (e) {
      return null;
    }
  },

  save(discoveredWords, canvasInstances) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify({
        version: 1,
        discoveredWords,
        canvasInstances
      }));
    } catch (e) {
      console.warn('Save failed:', e);
    }
  },

  clear() {
    localStorage.removeItem(this.KEY);
  }
};
