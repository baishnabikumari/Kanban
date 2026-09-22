import { state } from "./state.js";
import { loadState, saveState } from "./storage.js";
import { render } from "./render.js";
import { setupEvents } from "./events.js";
import { setupDragDrop } from "./dragdrop.js";

const saved = loadState();
if(saved) {
    Object.assign(state, saved);
} else {
    saveState(state);
}
render();
setupEvents();

export function commit() {
    saveState(state);
    render();
}
setupDragDrop();
