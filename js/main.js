import { state } from "./state.js";
import { loadState, saveState } from "./storage.js";
import { render } from "./render.js";
import { setupevents } from "./event.js";
const saved = loadState();
if(saved) {
    Object.assign(state, saved);
} else {
    saveState(state);
}
render();
setupevents();

export function commit() {
    saveState(state);
    render();
}
