// app.js — game state, initialization, and combine logic
window.IJ = window.IJ || {};

const STARTERS = [
  { kanji: "水",  readingKana: "みず",   meaning: "water" },
  { kanji: "火",  readingKana: "ひ",     meaning: "fire" },
  { kanji: "木",  readingKana: "き",     meaning: "tree" },
  { kanji: "山",  readingKana: "やま",   meaning: "mountain" },
  { kanji: "川",  readingKana: "かわ",   meaning: "river" },
  { kanji: "人",  readingKana: "ひと",   meaning: "person" },
  { kanji: "空",  readingKana: "そら",   meaning: "sky" },
  { kanji: "土",  readingKana: "つち",   meaning: "earth" },
  { kanji: "風",  readingKana: "かぜ",   meaning: "wind" },
  { kanji: "花",  readingKana: "はな",   meaning: "flower" },
  { kanji: "海",  readingKana: "うみ",   meaning: "sea" },
  { kanji: "石",  readingKana: "いし",   meaning: "stone" },
  { kanji: "金",  readingKana: "きん",   meaning: "gold" },
  { kanji: "日",  readingKana: "ひ",     meaning: "sun / day" },
  { kanji: "月",  readingKana: "つき",   meaning: "moon" },
  { kanji: "草",  readingKana: "くさ",   meaning: "grass" },
  { kanji: "雨",  readingKana: "あめ",   meaning: "rain" },
  { kanji: "雪",  readingKana: "ゆき",   meaning: "snow" },
  { kanji: "光",  readingKana: "ひかり", meaning: "light" },
  { kanji: "夜",  readingKana: "よる",   meaning: "night" },
];

// Game state
let discoveredWords = {}; // wordId → tileData
let canvasInstances = {}; // instanceId → { wordId, x, y }
let saveTimer = null;

function makeTileData(kanji, readingKana, meaning, isStarter) {
  const id = IJ.tiles.makeTileId(kanji, readingKana);
  return { id, kanji, readingKana, meaning, isStarter: !!isStarter, discoveredAt: Date.now() };
}

function scheduleS() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveState, 500);
}

function saveState() {
  const instances = [];
  document.querySelectorAll('#canvas .tile').forEach(el => {
    instances.push({
      instanceId: el.dataset.instanceId,
      wordId: el.dataset.wordId,
      x: parseInt(el.style.left) || 0,
      y: parseInt(el.style.top) || 0
    });
  });
  IJ.storage.save(discoveredWords, instances);
}

function updateDiscoveredCount() {
  const count = Object.keys(discoveredWords).length;
  const el = document.getElementById('discovered-count');
  if (el) el.textContent = count === 1 ? '1 word' : `${count} words`;
}

function setStatus(msg, type) {
  const el = document.getElementById('status-message');
  if (!el) return;
  el.textContent = msg;
  el.className = type || '';
}

// ─── Combine Logic ──────────────────────────────────────────────────────────

// Spread n tiles in a horizontal row centred on (midX, midY), clamped to canvas.
function resultPositions(midX, midY, count, canvasW, canvasH) {
  const tileW = 90, tileH = 100, gap = 10;
  const totalW = count * tileW + (count - 1) * gap;
  return Array.from({ length: count }, (_, i) => ({
    x: Math.max(4, Math.min(midX - totalW / 2 + i * (tileW + gap), canvasW - tileW - 4)),
    y: Math.max(4, Math.min(midY, canvasH - tileH - 4))
  }));
}

async function attemptCombine(dragTileData, targetEl) {
  const targetWordId    = targetEl.dataset.wordId;
  const targetInstanceId = targetEl.dataset.instanceId;
  const targetTileData  = discoveredWords[targetWordId];
  if (!targetTileData) return;

  const kanaA  = dragTileData.readingKana;
  const kanaB  = targetTileData.readingKana;
  const kanjiA = dragTileData.kanji;
  const kanjiB = targetTileData.kanji;
  const combined = kanaA + kanaB;

  // Prevent combining a tile with itself
  if (dragTileData.instanceId === targetInstanceId) return;

  // Compute midpoint on canvas
  const canvasEl   = document.getElementById('canvas');
  const canvasRect = canvasEl.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();

  const draggedEl = dragTileData.instanceId
    ? document.querySelector(`[data-instance-id="${dragTileData.instanceId}"]`)
    : null;

  let midX, midY;
  if (draggedEl) {
    const dragRect = draggedEl.getBoundingClientRect();
    midX = ((dragRect.left + dragRect.right) / 2 + (targetRect.left + targetRect.right) / 2) / 2 - canvasRect.left - 40;
    midY = ((dragRect.top  + dragRect.bottom) / 2 + (targetRect.top  + targetRect.bottom) / 2) / 2 - canvasRect.top  - 45;
  } else {
    midX = (targetRect.left + targetRect.right) / 2 - canvasRect.left - 40;
    midY = (targetRect.top  + targetRect.bottom) / 2 - canvasRect.top  - 45;
  }

  // Save positions for restore on failure
  const savedDragPos   = draggedEl ? { left: draggedEl.style.left, top: draggedEl.style.top } : null;
  const savedTargetPos = { left: targetEl.style.left, top: targetEl.style.top };

  // Fade out source tiles
  if (draggedEl) { draggedEl.classList.add('combining'); delete canvasInstances[dragTileData.instanceId]; }
  targetEl.classList.add('combining');
  delete canvasInstances[targetInstanceId];

  const loadingTile = IJ.tiles.createLoadingTile(midX, midY);
  setStatus(`Combining ${kanaA} + ${kanaB}…`, '');

  setTimeout(() => {
    if (draggedEl && draggedEl.parentNode) draggedEl.remove();
    if (targetEl.parentNode) targetEl.remove();
  }, 200);

  // Search: forward kana, reversed kana, forward kanji, reversed kanji — in parallel
  const lookupOpts = { kanaRev: kanaB + kanaA, kanji: kanjiA + kanjiB, kanjiRev: kanjiB + kanjiA };
  const results = await IJ.dictionary.lookup(combined, lookupOpts);
  loadingTile.remove();

  if (!results.length) {
    setStatus(`No word found for ${kanjiA} + ${kanjiB} — try a different pair!`, 'status-fail');
    if (draggedEl) {
      const r = IJ.tiles.placeOnCanvas(dragTileData, parseInt(savedDragPos.left), parseInt(savedDragPos.top), false);
      canvasInstances[r] = { wordId: dragTileData.id, x: parseInt(savedDragPos.left), y: parseInt(savedDragPos.top) };
    }
    const r = IJ.tiles.placeOnCanvas(targetTileData, parseInt(savedTargetPos.left), parseInt(savedTargetPos.top), false);
    canvasInstances[r] = { wordId: targetTileData.id, x: parseInt(savedTargetPos.left), y: parseInt(savedTargetPos.top) };
    scheduleS();
    return;
  }

  // Place all results spread around the midpoint
  const positions = resultPositions(midX, midY, results.length, canvasEl.clientWidth, canvasEl.clientHeight);
  const newWords = [];

  results.forEach((result, i) => {
    const tileData = makeTileData(result.kanji, result.readingKana, result.meaning, false);
    const isNew = !discoveredWords[tileData.id];
    if (isNew) {
      discoveredWords[tileData.id] = tileData;
      IJ.tiles.addToSidebar(tileData, true);
      newWords.push(tileData);
    }
    const { x, y } = positions[i];
    const instanceId = IJ.tiles.placeOnCanvas(tileData, x, y, true);
    canvasInstances[instanceId] = { wordId: tileData.id, x, y };
  });

  if (newWords.length > 0) updateDiscoveredCount();

  // Status message
  if (newWords.length > 0) {
    const names = newWords.map(t => `${t.kanji} (${t.meaning})`).join('、 ');
    setStatus(`✨ ${newWords.length} new word${newWords.length > 1 ? 's' : ''}: ${names}`, 'status-new');
  } else {
    const names = results.map(r => `${r.kanji} (${r.meaning})`).join('、 ');
    setStatus(`${kanjiA} + ${kanjiB} → ${names}`, 'status-ok');
  }

  scheduleS();
}

// ─── Initialization ─────────────────────────────────────────────────────────

function initStarters() {
  discoveredWords = {};
  canvasInstances = {};

  STARTERS.forEach(s => {
    const td = makeTileData(s.kanji, s.readingKana, s.meaning, true);
    discoveredWords[td.id] = td;
  });

  // Place starters on canvas in a neat grid
  const cols = 4;
  const tileW = 88, tileH = 100;
  const startX = 20, startY = 20;
  STARTERS.forEach((s, i) => {
    const td = discoveredWords[IJ.tiles.makeTileId(s.kanji, s.readingKana)];
    const x = startX + (i % cols) * (tileW + 10);
    const y = startY + Math.floor(i / cols) * (tileH + 10);
    const instanceId = IJ.tiles.placeOnCanvas(td, x, y, false);
    canvasInstances[instanceId] = { wordId: td.id, x, y };
  });

  // Populate sidebar with all starters
  STARTERS.slice().reverse().forEach(s => {
    const td = discoveredWords[IJ.tiles.makeTileId(s.kanji, s.readingKana)];
    IJ.tiles.addToSidebar(td, false);
  });
}

function restoreState(saved) {
  discoveredWords = saved.discoveredWords || {};
  canvasInstances = {};

  IJ.tiles.clearCanvas();
  IJ.tiles.clearSidebar();

  // Re-add missing starters to discoveredWords (in case of state version mismatch)
  STARTERS.forEach(s => {
    const id = IJ.tiles.makeTileId(s.kanji, s.readingKana);
    if (!discoveredWords[id]) {
      discoveredWords[id] = makeTileData(s.kanji, s.readingKana, s.meaning, true);
    } else {
      discoveredWords[id].isStarter = true;
    }
  });

  // Populate sidebar: starters first (at bottom since we prepend), then discovered
  const starters = STARTERS.map(s => discoveredWords[IJ.tiles.makeTileId(s.kanji, s.readingKana)]);
  const discovered = Object.values(discoveredWords)
    .filter(t => !t.isStarter)
    .sort((a, b) => (a.discoveredAt || 0) - (b.discoveredAt || 0));

  // Add starters in reverse so they end up in order at bottom
  [...starters].reverse().forEach(t => IJ.tiles.addToSidebar(t, false));
  // Add discovered words (prepended, so latest appears at top above starters)
  discovered.forEach(t => IJ.tiles.addToSidebar(t, false));

  // Restore canvas
  (saved.canvasInstances || []).forEach(inst => {
    const tileData = discoveredWords[inst.wordId];
    if (!tileData) return;
    const instanceId = IJ.tiles.placeOnCanvas(tileData, inst.x, inst.y, false);
    canvasInstances[instanceId] = { wordId: inst.wordId, x: inst.x, y: inst.y };
  });
}

// ─── Create Kanji modal ──────────────────────────────────────────────────────

function initCreateModal() {
  const modal    = document.getElementById('create-modal');
  const input    = document.getElementById('create-input');
  const preview  = document.getElementById('create-kana-preview');
  const errorEl  = document.getElementById('create-error');
  const confirm  = document.getElementById('create-confirm');
  const cancel   = document.getElementById('create-cancel');

  function openModal() {
    input.value = '';
    preview.textContent = '';
    errorEl.classList.add('hidden');
    confirm.disabled = false;
    modal.classList.remove('hidden');
    setTimeout(() => input.focus(), 60);
  }

  function closeModal() {
    modal.classList.add('hidden');
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
    confirm.disabled = false;
  }

  // Live kana preview as user types
  input.addEventListener('input', () => {
    const kana = IJ.dictionary.romajiToHiragana(input.value);
    preview.textContent = kana || '';
    errorEl.classList.add('hidden');
  });

  // Submit on Enter
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmCreate();
    if (e.key === 'Escape') closeModal();
  });

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  cancel.addEventListener('click', closeModal);
  confirm.addEventListener('click', confirmCreate);

  async function confirmCreate() {
    const romaji = input.value.trim();
    if (!romaji) { showError('Please enter a romaji reading.'); return; }

    const kana = IJ.dictionary.romajiToHiragana(romaji);
    if (!kana || kana === romaji) {
      showError(`Could not convert "${romaji}" to hiragana. Check your spelling.`);
      return;
    }

    confirm.disabled = true;
    errorEl.classList.add('hidden');
    preview.textContent = kana;

    const allResults = await IJ.dictionary.lookup(kana);

    if (!allResults.length) {
      showError(`No kanji found for "${kana}" (${romaji}). Try a different reading.`);
      return;
    }

    // Pick one at random so re-creating the same reading can yield different kanji
    const result = allResults[Math.floor(Math.random() * allResults.length)];

    closeModal();

    const tileData = makeTileData(result.kanji, result.readingKana, result.meaning, false);
    const isNew = !discoveredWords[tileData.id];

    if (isNew) {
      discoveredWords[tileData.id] = tileData;
      IJ.tiles.addToSidebar(tileData, true);
      updateDiscoveredCount();
    }

    // Place on canvas near centre with a slight random offset
    const canvas = document.getElementById('canvas');
    const cx = Math.max(20, (canvas.clientWidth  / 2 - 40) + (Math.random() - 0.5) * 120);
    const cy = Math.max(20, (canvas.clientHeight / 2 - 45) + (Math.random() - 0.5) * 80);
    const instanceId = IJ.tiles.placeOnCanvas(tileData, cx, cy, true);
    canvasInstances[instanceId] = { wordId: tileData.id, x: cx, y: cy };

    if (isNew) {
      setStatus(`✨ Created: ${result.kanji} (${result.readingKana}) — ${result.meaning}`, 'status-new');
    } else {
      setStatus(`${result.kanji} (${result.readingKana}) placed on canvas — ${result.meaning}`, 'status-ok');
    }

    scheduleS();
  }

  document.getElementById('btn-create').addEventListener('click', openModal);
}

// ─── Sidebar search ─────────────────────────────────────────────────────────

function initSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll('#sidebar-tiles .tile').forEach(el => {
      const kanji = el.querySelector('.tile-kanji')?.textContent || '';
      const reading = el.querySelector('.tile-furigana')?.textContent || '';
      const meaning = el.querySelector('.tile-meaning')?.textContent || '';
      const match = !q
        || kanji.includes(q)
        || reading.includes(q)
        || meaning.toLowerCase().includes(q);
      el.style.display = match ? '' : 'none';
    });
  });
}

// ─── Bootstrap ──────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas');
  const sidebarTiles = document.getElementById('sidebar-tiles');

  IJ.tiles.init(canvas, sidebarTiles, {
    onCombine(dragTileData, targetEl) {
      attemptCombine(dragTileData, targetEl);
    },
    onDrop(tileData, instanceId, x, y) {
      canvasInstances[instanceId] = { wordId: tileData.id, x, y };
      scheduleS();
    },
    onRemove(instanceId) {
      delete canvasInstances[instanceId];
      scheduleS();
    }
  });

  const saved = IJ.storage.load();
  if (saved) {
    restoreState(saved);
  } else {
    initStarters();
    saveState();
  }

  updateDiscoveredCount();
  initSearch();
  initCreateModal();

  document.getElementById('btn-clear').addEventListener('click', () => {
    IJ.tiles.clearCanvas();
    canvasInstances = {};
    saveState();
    setStatus('Canvas cleared. Drag tiles from the sidebar to start again!', '');
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    if (!confirm('Reset everything? All discovered words will be lost.')) return;
    IJ.storage.clear();
    IJ.tiles.clearCanvas();
    IJ.tiles.clearSidebar();
    initStarters();
    saveState();
    updateDiscoveredCount();
    setStatus('Reset! Start combining from scratch.', '');
  });
});
