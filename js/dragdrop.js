
import { getActiveBoard, moveCard, reorderColumn } from "./state.js";
import { commit } from "./main.js";

const boardEl = document.getElementById("board");

let draggedCardId = null;
let draggedCardEl = null;

let draggedColumnId = null;
let draggedColumnEl = null;

export function setupDragDrop(){
    boardEl.addEventListener("dragstart", handleDragStart);
    boardEl.addEventListener("dragend", handleDragEnd);
    boardEl.addEventListener("dragover", handleDragOver);
    boardEl.addEventListener("drop", handleDrop);
}

function handleDragStart(e){
    if (e.target.matches(".card")) {
        draggedCardId = e.target.dataset.cardId;
        draggedCardEl = e.target;
        draggedCardEl.classList.add("dragging");
        return;
    }

    if (e.target.matches(".column")) {
        draggedColumnId = e.target.dataset.columnId;
        draggedColumnEl = e.target;
        draggedColumnEl.classList.add("dragging-column");
    }
}

function handleDragEnd(){
    if (draggedCardEl) draggedCardEl.classList.remove("dragging");
    draggedCardId = null;
    draggedCardEl = null;

    if (draggedColumnEl) draggedColumnEl.classList.remove("dragging-column");
    draggedColumnId = null;
    draggedColumnEl = null;

    clearPlaceholders();
}

function handleDragOver(e){
    if (draggedCardId) {
        const cardList = e.target.closest(".card-list");
        if (!cardList) return;
        e.preventDefault();
        showPlaceholder(cardList, e.clientY);
        return;
    }

    if (draggedColumnId) {
        if (!e.target.closest(".board")) return;
        e.preventDefault();
    }
}

function handleDrop(e){
    if (draggedCardId) {
        const cardList = e.target.closest(".card-list");
        if (!cardList) return;
        e.preventDefault();

        const columnEl = cardList.closest(".column");
        const targetColumnId = columnEl.dataset.columnId;

        const siblingCards = [...cardList.querySelectorAll(".card:not(.dragging)")];
        const afterEl = getDragAfterElement(cardList, e.clientY);
        const targetIndex = afterEl ? siblingCards.indexOf(afterEl) : siblingCards.length;

        moveCard(getActiveBoard(), draggedCardId, targetColumnId, targetIndex);
        clearPlaceholders();
        commit();
        return;
    }

    if (draggedColumnId) {
        if (!e.target.closest(".board")) return;
        e.preventDefault();

        const board = getActiveBoard();
        const afterEl = getColumnAfterElement(e.clientX);
        const siblingColumns = [...boardEl.querySelectorAll(".column:not(.dragging-column)")];
        const targetIndex = afterEl ? siblingColumns.indexOf(afterEl) : siblingColumns.length;

        reorderColumn(board, draggedColumnId, targetIndex);
        commit();
    }
}

function showPlaceholder(cardList, y){
    let placeholder = cardList.querySelector(".drop-placeholder");
    if(!placeholder){
        clearPlaceholders();
        placeholder = document.createElement("div");
        placeholder.className = "drop-placeholder";
    }

    const afterEl = getDragAfterElement(cardList, y);
    if(afterEl){
        cardList.insertBefore(placeholder, afterEl);
    } else {
        cardList.appendChild(placeholder);
    }
}

function clearPlaceholders(){
    document.querySelectorAll(".drop-placeholder").forEach(el => el.remove());
}

function getDragAfterElement(cardList, y) {
    const cards = [...cardList.querySelectorAll(".card:not(.dragging)")];

    return cards.reduce((closest, card) => {
        const box = card.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset, element: card };
        }
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}

function getColumnAfterElement(x) {
    const columns = [...boardEl.querySelectorAll(".column:not(.dragging-column)")];

    return columns.reduce((closest, col) => {
        const box = col.getBoundingClientRect();
        const offset = x - box.left - box.width / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset, element: col };
        }
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}
