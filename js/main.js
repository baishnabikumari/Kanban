import { state } from "./state.js";
import { loadState, saveState } from "./storage.js";
import { render } from "./render.js";

const saved = loadState();
if(saved) {
    Object.assign(state, saved);
} else {
    saveState(state);
}
render();