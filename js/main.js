import { state } from "./state.js";
import { loadState, saveState } from "./storage.js";
import { render } from "./render.js";
import { setupEvents } from "./events.js";
import { setupDragDrop } from "./dragdrop.js";

const saved = loadState();
if (saved) {
    Object.assign(state, saved);
} else {
    saveState(state);
}

let history = [structuredClone(state)];
let historyIndex = 0;
let restoring = false;

applytheme();
render();
render();
setupEvents();

export function commit() {
    saveState(state);
    applytheme();
    render();

    if (!restoring) {
        history = history.slice(0, historyIndex + 1);
        history.push(structuredClone(state));
        historyIndex = history.length - 1;
    }
}

export function undo() {
    if (historyIndex <= 0) return;
    historyIndex--;
    restoring = true;
    Object.assign(state, structuredClone(history[historyIndex]));
    commit();
    restoring = false;
}

export function redo() {
    if (historyIndex >= history.length - 1) return;
    historyIndex++;
    restoring = true;
    Object.assign(state, structuredClone(history[historyIndex]));
    commit();
    restoring = false;
}

export function commit() {
    saveState(state);
    applytheme();
    render();
}
setupDragDrop();

function applytheme() {
    document.documentElement.dataset.theme = state.theme || "Light";
}
