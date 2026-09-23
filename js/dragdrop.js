import { getActiveBoard, moveCard } from "./state.js";
import { commit } from "./main.js";

const boardEl = document.getElementById("board");

let draggedCardId = null;
let draggedEl = null;

export function setupDragDrop(){
    boardEl.addEventListener("dragstart", handleDragStart);
    boardEl.addEventListener("dragend", handleDragEnd);
    boardEl.addEventListener("dragover", handleDragOver);
    boardEl.addEventListener("drop", handleDrop);
}

function handleDragStart(e){
    if(!e.target.matches(".card")) return;

    draggedCardId = e.target.dataset.cardId;
    draggedEl = e.target;

    draggedEl.classList.add("dragging");
}

function handleDragEnd(){
    if(draggedEl) draggedEl.classList.remove("dragging");

    draggedCardId = null;
    draggedEl = null;

    clearPlaceholders();
}

function handleDragOver(e){
    const cardList = e.target.closest(".card-list");

    if(!cardList) return;

    e.preventDefault();

    showPlaceholder(cardList, e.clientY);
}

function handleDrop(e){
    const cardList = e.target.closest(".card-list");

    if(!cardList || !draggedCardId) return;

    e.preventDefault();

    const columnEl = cardList.closest(".column");
    const targetColumnId = columnEl.dataset.columnId;

    const siblingCards = [...cardList.querySelectorAll(".card:not(.dragging)")];

    const afterEl = getDragAfterElement(cardList, e.clientY);

    const targetIndex = afterEl
        ? siblingCards.indexOf(afterEl)
        : siblingCards.length;

    moveCard(getActiveBoard(), draggedCardId, targetColumnId, targetIndex);

    clearPlaceholders();

    commit();
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