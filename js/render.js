import { getActiveBoard } from "./state.js";

const boardEl = document.getElementById("board");

export function render() {
    const board = getActiveBoard();

    boardEl.innerHTML = "";

    board.columns.forEach(column => {
        boardEl.appendChild(renderColumn(column, board.labels));
    });

    const addColumnBtn = document.createElement("button");
    addColumnBtn.className = "add-column-btn";
    addColumnBtn.textContent = "+ add column";

    boardEl.appendChild(addColumnBtn);
}

function renderColumn(column) {
function renderColumn(column, labels){
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

    const headerLeft = document.createElement("div");
    headerLeft.className = "column-header-left";

    headerLeft.appendChild(titleEl);
    headerLeft.appendChild(countEl);

    const deleteColumnBtn = document.createElement("button");
    deleteColumnBtn.className = "delete-column-btn";
    deleteColumnBtn.textContent = "×";
    deleteColumnBtn.title = "Delete column";

    header.appendChild(headerLeft);
    header.appendChild(deleteColumnBtn);

    columnEl.appendChild(header);

    const cardList = document.createElement("div");
    cardList.className = "card-list";
    column.cards.forEach(card => cardList.appendChild(renderCard(card, labels)));
    columnEl.appendChild(cardList);
    const addCardBtn = document.createElement("button");

    column.cards.forEach(card => {
        cardList.appendChild(renderCard(card));
    });

    columnEl.appendChild(cardList);
    addCardBtn.className = "add-card-btn";
    addCardBtn.textContent = "+ add card";

    columnEl.appendChild(addCardBtn);

    return columnEl;
}

function renderCard(card) {
    const cardEl = document.createElement("div");

    cardEl.className = "card";
    cardEl.dataset.cardId = card.id;
    cardEl.textContent = card.title;

    cardEl.draggable = true;

    const cardLabels = (card.labelIds || [])
        .map(id => labels.find(l => l.id === id))
        .filter(Boolean);

    if (cardLabels.length){
        const labelRow = document.createElement("div");
        labelRow.className = "card-labels";
        cardLabels.forEach(label => {
            const chip = document.createElement("span");
            chip.className = "label-chip";
            chip.style.background = label.color;
            chip.title = label.name;
            labelRow.appendChild(chip);
        });
        cardEl.appendChild(labelRow);
    }
    const titleEl = document.createElement("div");
    titleEl.textContent = card.title;
    cardEl.appendChild(titleEl);
    return cardEl;
}