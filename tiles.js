// tiles.js — tile DOM creation and pointer-event drag-and-drop
window.IJ = window.IJ || {};

let canvasEl = null;
let sidebarTilesEl = null;
let onCombineRequest = null; // callback(dragData, targetEl)
let onDropOnCanvas = null;   // callback(dragData, x, y)
let onRemoveTile = null;     // callback(instanceId)

// Active drag state
let drag = null;
let currentTarget = null;

function makeTileId(kanji, readingKana) {
  return `word_${kanji}_${readingKana}`;
}

function makeInstanceId() {
  return `inst_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function createTileElement(tileData) {
  const el = document.createElement('div');
  el.className = 'tile';
  if (tileData.isStarter) el.classList.add('starter');

  el.dataset.wordId = tileData.id;
  el.dataset.readingKana = tileData.readingKana;

  const furigana = document.createElement('div');
  furigana.className = 'tile-furigana';
  furigana.textContent = tileData.readingKana;

  const kanji = document.createElement('div');
  kanji.className = 'tile-kanji';
  kanji.textContent = tileData.kanji;

  const meaning = document.createElement('div');
  meaning.className = 'tile-meaning';
  meaning.textContent = tileData.meaning;

  el.appendChild(furigana);
  el.appendChild(kanji);
  el.appendChild(meaning);

  return el;
}

function createLoadingTile(x, y) {
  const el = document.createElement('div');
  el.className = 'tile loading';
  el.style.left = x + 'px';
  el.style.top = y + 'px';

  const furigana = document.createElement('div');
  furigana.className = 'tile-furigana';
  furigana.textContent = '...';

  const kanji = document.createElement('div');
  kanji.className = 'tile-kanji';
  // spinner added via CSS

  const meaning = document.createElement('div');
  meaning.className = 'tile-meaning';
  meaning.textContent = 'searching';

  el.appendChild(furigana);
  el.appendChild(kanji);
  el.appendChild(meaning);

  canvasEl.appendChild(el);
  return el;
}

function placeOnCanvas(tileData, x, y, isNew) {
  const el = createTileElement(tileData);
  const instanceId = makeInstanceId();
  el.dataset.instanceId = instanceId;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.position = 'absolute';

  if (isNew) {
    el.classList.add('tile-new');
    setTimeout(() => el.classList.remove('tile-new'), 600);
  }

  attachCanvasDrag(el, tileData);
  canvasEl.appendChild(el);
  return instanceId;
}

function addToSidebar(tileData, isNew) {
  // Remove existing entry for this word if present (avoid duplicates)
  const existing = sidebarTilesEl.querySelector(`[data-word-id="${CSS.escape(tileData.id)}"]`);
  if (existing) return;

  const el = createTileElement(tileData);
  el.dataset.instanceId = ''; // sidebar tiles don't have instanceId
  if (isNew) {
    el.classList.add('tile-new');
    setTimeout(() => el.classList.remove('tile-new'), 600);
  }
  attachSidebarDrag(el, tileData);
  sidebarTilesEl.prepend(el); // newest at top
}

// ─── Drag-and-drop ─────────────────────────────────────────────────────────

function clientToCanvas(clientX, clientY) {
  const rect = canvasEl.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function getTileUnder(clientX, clientY, excludeEl) {
  const els = document.elementsFromPoint(clientX, clientY);
  for (const el of els) {
    const tile = el.closest('.tile');
    if (tile && tile !== excludeEl && canvasEl.contains(tile)) return tile;
  }
  return null;
}

function highlightTarget(el) {
  if (currentTarget === el) return;
  if (currentTarget) currentTarget.classList.remove('highlight');
  currentTarget = el;
  if (el) el.classList.add('highlight');
}

function clearHighlight() {
  if (currentTarget) currentTarget.classList.remove('highlight');
  currentTarget = null;
}

function attachCanvasDrag(el, tileData) {
  el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    el.classList.add('dragging');
    el.style.zIndex = '1000';
    el.setPointerCapture(e.pointerId);

    const rect = el.getBoundingClientRect();
    drag = {
      el,
      tileData: { ...tileData, instanceId: el.dataset.instanceId },
      fromSidebar: false,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      origLeft: parseInt(el.style.left) || 0,
      origTop: parseInt(el.style.top) || 0
    };
  });

  el.addEventListener('pointermove', onPointerMove);
  el.addEventListener('pointerup', onPointerUp);
}

function attachSidebarDrag(el, tileData) {
  el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    // Create a floating canvas clone
    const clone = createTileElement(tileData);
    clone.dataset.instanceId = '';
    clone.style.position = 'absolute';
    clone.classList.add('dragging');
    clone.style.zIndex = '1000';
    clone.style.pointerEvents = 'none'; // let events pass through to canvas

    const pos = clientToCanvas(e.clientX, e.clientY);
    const w = 80, h = 90; // approx tile dimensions
    clone.style.left = (pos.x - w / 2) + 'px';
    clone.style.top = (pos.y - h / 2) + 'px';
    canvasEl.appendChild(clone);

    // Capture pointer on the sidebar tile
    el.setPointerCapture(e.pointerId);

    drag = {
      el: clone,
      pointerEl: el,
      tileData,
      fromSidebar: true,
      offsetX: w / 2,
      offsetY: h / 2
    };
  });

  el.addEventListener('pointermove', (e) => {
    if (!drag || drag.pointerEl !== el) return;
    onPointerMoveRaw(e);
  });

  el.addEventListener('pointerup', (e) => {
    if (!drag || drag.pointerEl !== el) return;
    onPointerUpRaw(e);
  });
}

function onPointerMove(e) {
  if (!drag || drag.el !== e.currentTarget) return;
  onPointerMoveRaw(e);
}

function onPointerMoveRaw(e) {
  if (!drag) return;
  const pos = clientToCanvas(e.clientX, e.clientY);
  drag.el.style.left = (pos.x - drag.offsetX) + 'px';
  drag.el.style.top = (pos.y - drag.offsetY) + 'px';

  const target = getTileUnder(e.clientX, e.clientY, drag.el);
  highlightTarget(target);
}

function onPointerUp(e) {
  if (!drag || drag.el !== e.currentTarget) return;
  onPointerUpRaw(e);
}

function onPointerUpRaw(e) {
  if (!drag) return;
  clearHighlight();

  const target = getTileUnder(e.clientX, e.clientY, drag.el);

  if (target) {
    // Attempt combination
    if (drag.fromSidebar) {
      drag.el.remove(); // remove the temp canvas clone
    }
    if (onCombineRequest) {
      onCombineRequest(drag.tileData, target);
    }
  } else {
    // Drop on canvas
    const canvasRect = canvasEl.getBoundingClientRect();
    const sidebarEl = document.getElementById('sidebar');
    const sidebarRect = sidebarEl.getBoundingClientRect();
    const overSidebar = e.clientX >= sidebarRect.left - 10;

    if (overSidebar && !drag.fromSidebar) {
      // Drag canvas tile back to sidebar — remove it from canvas
      drag.el.classList.remove('dragging');
      drag.el.style.zIndex = '';
      if (onRemoveTile) {
        onRemoveTile(drag.tileData.instanceId);
      }
      drag.el.remove();
    } else if (drag.fromSidebar && overSidebar) {
      // Drag from sidebar back to sidebar — cancel
      drag.el.remove();
    } else {
      // Finalize position on canvas
      const x = Math.max(0, Math.min(parseInt(drag.el.style.left), canvasRect.width - 90));
      const y = Math.max(0, Math.min(parseInt(drag.el.style.top), canvasRect.height - 100));
      drag.el.style.left = x + 'px';
      drag.el.style.top = y + 'px';
      drag.el.classList.remove('dragging');
      drag.el.style.zIndex = '';

      if (drag.fromSidebar) {
        // Register as a new canvas instance
        const instanceId = makeInstanceId();
        drag.el.dataset.instanceId = instanceId;
        drag.el.style.pointerEvents = '';
        attachCanvasDrag(drag.el, drag.tileData);
        if (onDropOnCanvas) {
          onDropOnCanvas(drag.tileData, instanceId, x, y);
        }
      } else {
        // Update position
        if (onDropOnCanvas) {
          onDropOnCanvas(drag.tileData, drag.tileData.instanceId, x, y);
        }
      }
    }
  }

  drag = null;
}

// ─── Public API ────────────────────────────────────────────────────────────

IJ.tiles = {
  init(canvas, sidebarTiles, callbacks) {
    canvasEl = canvas;
    sidebarTilesEl = sidebarTiles;
    onCombineRequest = callbacks.onCombine;
    onDropOnCanvas = callbacks.onDrop;
    onRemoveTile = callbacks.onRemove;
  },

  createTileElement,
  createLoadingTile,
  placeOnCanvas,
  addToSidebar,
  makeTileId,
  makeInstanceId,

  clearCanvas() {
    canvasEl.querySelectorAll('.tile').forEach(el => el.remove());
  },

  clearSidebar() {
    sidebarTilesEl.innerHTML = '';
  }
};
