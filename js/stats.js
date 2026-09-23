import { getActiveBoard } from "./state.js";

const canvas = document.getElementById("stats-canvas");
const ctx = canvas.getContext("2d");

export function renderStats() {
    const board = getActiveBoard();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const totalCards = board.columns.reduce((sum, c) => sum + c.cards.length, 0);

    if(!board.columns.length || !totalCards){
        ctx.fillStyle = "#6b6862";
        ctx.font = "13px sans-serif";
        ctx.fillText("No data yet - add some columns and cards", 20, canvas.height / 2);
        return;
    }

    const barWidth = 40;
    const gap = 20;
    const chartHeight = 110;
    const maxCount = Math.max(...board.columns.map(c => c.cards.length), 1);

    board.columns.forEach((column, i) => {
        const barHeight = (column.cards.length / maxCount) * chartHeight;

        const x = i * (barWidth + gap) + gap;
        const y = chartHeight - barHeight + 20;

        ctx.fillStyle = "#c1653d";
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = "#1c1c1a";
        ctx.font = "11px sans-serif";

        ctx.fillText(column.title, x, chartHeight + 35);

        ctx.fillText(
            column.cards.length,
            x + barWidth / 2 - 4,
            y - 6
        );
    });
}