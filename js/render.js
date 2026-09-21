import { getActiveBoard } from "./state.js";
const boardEl = document.getElementById("board");

export function render(){
    const board = getActiveBoard();
    boardEl.innerHTML = "";
    board.columns.forEach(column => {
        boardEl.appendChild(renderColumn(column));
    });
    const addColumnBtn = document.createElement("button");
    addColumnBtn.className = "add-column-btn";
    addColumnBtn.textContent = "+ add column";
    boardEl.appendChild(addColumnBtn);
}
function renderColumn(column){
    const columnEl = document.createElement("div");
    columnEl.className = "column";
    columnEl.dataset.columnId = column.id;

    const header = document.createElement("div");
    header.className = "column-header";

    const titleEl = document.createElement("h2");
    titleEl.textContent = column.title;

    const countEl = document.createElement("span");
    countEl.className = "card-count";
    countEl.textContent = column.cards.length;

    header.appendChild(titleEl);
    header.appendChild(countEl);
    columnEl.appendChild(header);

    const cardList = document.createElement("div");
    cardList.className = "card-list";
    column.cards.forEach(card => cardList.appendChild(renderCard(card)));
    columnEl.appendChild(cardList);
    const addCardBtn = document.createElement("button");

    addCardBtn.className = "add-card-btn";
    addCardBtn.textContent = "+ add card";
    columnEl.appendChild(addCardBtn);

    return columnEl;
}

function renderCard(card){
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    cardEl.dataset.cardId = card.id;
    cardEl.textContent = card.title;
    return cardEl;
}