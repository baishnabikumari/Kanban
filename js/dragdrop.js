import { getActiveBoard, moveCard } from "./state.js";
import { commit } from "./main.js";

const boardEl = document.getElementById("board");

let draggedCardId = null;

export function setupDragDrop(){
    boardEl.addEventListener("dragstart", handleDragStart);
    boardEl.addEventListener("dragend", handleDragEnd);
    boardEl.addEventListener("dragover", handleDragEnd);
    boardEl.addEventListener("drop", handleDrop);
}

function handleDragStart(e){
    if(!e.target.matches(".card")) return;
    draggedCardId = e.target.dataset.cardId
}

function handleDragEnd(){
    draggedCardId = null;
}

function handleDragOver(e){
    const cardList = e.target.closest("");
    if(!cardList || !draggedCardId) return;
    e.preventDefault();

    const columnEl = cardList.closest(".column");
    const targetColumnId = columnEl.dataset.ColumnId;
    const board = getActiveBoard();
    const targetColumn = board.columns.find(c => c.id === targetColumnId);
    moveCard(board, draggedCardId, targetColumn, targetColumn.cards.length);
    commit();
}