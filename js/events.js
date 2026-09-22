import { getActiveBoard, addColumn } from "./state.js";
import { commit } from "./main.js";

const boardEl = document.getElementById("board");

export function setupEvents() {
  boardEl.addEventListener("click", handleBoardClick);
}

function handleBoardClick(e) {
  if (e.target.matches(".add-column-btn")) {
    const title = prompt("Column name:");
    if (title && title.trim()) {
      addColumn(getActiveBoard(), title.trim());
      commit();
    }
  }
}