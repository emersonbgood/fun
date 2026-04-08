const NGROK_URL = "https://tobie-uncontemning-marissa.ngrok-free.dev/highscore";
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-piece');
const nextContext = nextCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-button');

context.scale(20, 20);
nextContext.scale(20, 20);

let score = 0, level = 1, linesTotal = 0, dropInterval = 1000, dropCounter = 0, lastTime = 0;
let gameOver = false, holdPiece = null, canHold = true;
const colors = [null, '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'];
const tetrominos = { 'T': [,,], 'I': [,,,], 'S': [,,], 'Z': [,,], 'L': [,,], 'O': [,], 'J': [,,] };
const playfield = Array.from({ length: 20 }, () => Array(12).fill(0));
const player = { pos: { x: 0, y: 0 }, matrix: null, type: null };
const nextPiece = { matrix: null, type: null };

// --- LEADERBOARD SYNC ---
async function updateWorldHighScore() {
    try {
        const res = await fetch(NGROK_URL.replace('/highscore', '/get_high_score'));
        const data = await res.json();
        document.getElementById('best-player').innerText = data.name;
        document.getElementById('best-score').innerText = data.score;
    } catch (e) { console.warn("Record sync failed."); }
}
setInterval(updateWorldHighScore, 10000); // Check every 10s

// --- GAME LOGIC ---
function createPiece(type) { return tetrominos[type].map(row => [...row]); }
function draw() {
    context.fillStyle = '#000'; context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(playfield, { x: 0, y: 0 }, context);
    drawGhost(); drawMatrix(player.matrix, player.pos, context);
}
function drawMatrix(matrix, offset, ctx, colorOverride = null) {
    matrix.forEach((row, y) => row.forEach((v, x) => {
        if (v !== 0) { ctx.fillStyle = colorOverride || colors[v]; ctx.fillRect(x + offset.x, y + offset.y, 1, 1); }
    }));
}
function drawGhost() {
    let gy = player.pos.y;
    while (!collide(playfield, { pos: { x: player.pos.x, y: gy + 1 }, matrix: player.matrix })) gy++;
    drawMatrix(player.matrix, { x: player.pos.x, y: gy }, context, 'rgba(255,255,255,0.2)');
}
function collide(field, p) {
    for (let y = 0; y < p.matrix.length; ++y) for (let x = 0; x < p.matrix[y].length; ++x)
        if (p.matrix[y][x] !== 0 && (field[y + p.pos.y] && field[y + p.pos.y][x + p.pos.x]) !== 0) return true;
    return false;
}
function playerDrop() {
    player.pos.y++;
    if (collide(playfield, player)) { player.pos.y--; merge(); playerReset(); arenaSweep(); }
    dropCounter = 0;
}
function merge() { player.matrix.forEach((row, y) => row.forEach((v, x) => {
    if (v !== 0) playfield[y + player.pos.y][x + player.pos.x] = v;
})); }
function arenaSweep() {
    let rows = 0;
    for (let y = 19; y > 0; --y) if (playfield[y].every(v => v !== 0)) {
        playfield.splice(y, 1); playfield.unshift(Array(12).fill(0));
        y++; rows++; linesTotal++;
    }
    if (rows) { score += rows * 100 * level; scoreElement.innerText = score; }
    if (linesTotal >= level * 10) { level++; dropInterval = Math.max(100, 1000 - (level * 100)); }
}
function playerReset() {
    const pieces = 'ILJOTSZ';
    if (!nextPiece.type) { nextPiece.type = pieces[Math.random() * 7 | 0]; nextPiece.matrix = createPiece(nextPiece.type); }
    player.type = nextPiece.type; player.matrix = nextPiece.matrix; player.pos = { x: 5, y: 0 };
    nextPiece.type = pieces[Math.random() * 7 | 0]; nextPiece.matrix = createPiece(nextPiece.type);
    canHold = true; drawNext();
    if (collide(playfield, player)) { gameOver = true; submitScore(); }
}
function drawNext() {
    nextContext.fillStyle = '#000'; nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    drawMatrix(nextPiece.matrix, { x: 1, y: 1 }, nextContext);
}
async function submitScore() {
    const name = prompt("Game Over! Name (max 16):") || "Anon";
    await fetch(NGROK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.substring(0, 16), score: score }) });
    updateWorldHighScore();
}
function update(time = 0) {
    if (gameOver) return;
    const dt = time - lastTime; lastTime = time;
    dropCounter += dt; if (dropCounter > dropInterval) playerDrop();
    draw(); requestAnimationFrame(update);
}
document.addEventListener('keydown', e => {
    if (gameOver) return;
    if (e.keyCode === 37) { player.pos.x--; if (collide(playfield, player)) player.pos.x++; }
    if (e.keyCode === 39) { player.pos.x++; if (collide(playfield, player)) player.pos.x--; }
    if (e.keyCode === 40) playerDrop();
    if (e.keyCode === 32) { while (!collide(playfield, player)) player.pos.y++; player.pos.y--; merge(); playerReset(); arenaSweep(); }
    if (e.keyCode === 67 && canHold) { /* Hold logic similar to previous swap */ playerHold(); }
});
startButton.onclick = () => { gameOver = false; score = 0; playerReset(); update(); };
updateWorldHighScore(); // Initial sync
