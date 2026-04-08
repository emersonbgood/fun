const NGROK_URL = "https://YOUR_NGROK_ID.ngrok-free.app/highscore";
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-piece');
const nextContext = nextCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-button');

context.scale(20, 20);
nextContext.scale(20, 20);

const BOARD_WIDTH = 12;
const BOARD_HEIGHT = 20;

let score = 0;
let level = 1;
let linesTotal = 0;
let dropInterval = 1000;
let dropCounter = 0;
let lastTime = 0;
let gameOver = false;
let holdPiece = null;
let canHold = true;
let animationFrameId;

const colors = [null, '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'];
const tetrominos = {
    'T': [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    'I': [[0, 2, 0, 0], [0, 2, 0, 0], [0, 2, 0, 0], [0, 2, 0, 0]],
    'S': [[0, 3, 3], [3, 3, 0], [0, 0, 0]],
    'Z': [[4, 4, 0], [4, 4, 0], [0, 0, 0]],
    'L': [[0, 0, 5], [5, 5, 5], [0, 0, 0]],
    'O': [[6, 6], [6, 6]],
    'J': [[7, 0, 0], [7, 7, 7], [0, 0, 0]],
};

const sounds = {
    rotate: new Audio('assets/sounds/rotate.mp3'),
    move: new Audio('assets/sounds/move.mp3'),
    land: new Audio('assets/sounds/land.mp3'),
    clear: new Audio('assets/sounds/clear.mp3'),
    gameover: new Audio('assets/sounds/gameover.mp3'),
    music: new Audio('assets/sounds/music.mp3')
};
sounds.music.loop = true;

const playfield = Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));
const player = { pos: { x: 0, y: 0 }, matrix: null, type: null };
const nextPiece = { matrix: null, type: null };

function createPiece(type) { return tetrominos[type].map(row => [...row]); }

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(playfield, { x: 0, y: 0 }, context);
    drawGhost();
    drawMatrix(player.matrix, player.pos, context);
}

function drawMatrix(matrix, offset, ctx, colorOverride = null) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = colorOverride || colors[value];
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function drawGhost() {
    let ghostY = player.pos.y;
    while (!collide(playfield, { pos: { x: player.pos.x, y: ghostY + 1 }, matrix: player.matrix })) { ghostY++; }
    drawMatrix(player.matrix, { x: player.pos.x, y: ghostY }, context, 'rgba(255, 255, 255, 0.2)');
}

function drawNext() {
    nextContext.fillStyle = '#000';
    nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    drawMatrix(nextPiece.matrix, { x: 1, y: 1 }, nextContext);
}

function collide(field, p) {
    for (let y = 0; y < p.matrix.length; ++y) {
        for (let x = 0; x < p.matrix[y].length; ++x) {
            if (p.matrix[y][x] !== 0 && (field[y + p.pos.y] && field[y + p.pos.y][x + p.pos.x]) !== 0) return true;
        }
    }
    return false;
}

function playerDrop() {
    player.pos.y++;
    if (collide(playfield, player)) {
        player.pos.y--;
        merge();
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}

function playerHardDrop() {
    while (!collide(playfield, player)) { player.pos.y++; }
    player.pos.y--;
    merge();
    playerReset();
    arenaSweep();
}

function playerHold() {
    if (!canHold) return;
    if (!holdPiece) {
        holdPiece = { matrix: createPiece(player.type), type: player.type };
        playerReset();
    } else {
        const temp = { matrix: createPiece(player.type), type: player.type };
        player.matrix = holdPiece.matrix;
        player.type = holdPiece.type;
        holdPiece = temp;
        player.pos.y = 0;
        player.pos.x = 5;
    }
    canHold = false;
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    const matrix = player.matrix;
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) { [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]]; }
    }
    dir > 0 ? matrix.forEach(row => row.reverse()) : matrix.reverse();
    while (collide(playfield, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > matrix[0].length) {
            playerRotate(-dir); // Undo
            player.pos.x = pos;
            return;
        }
    }
    sounds.rotate.play();
}

function merge() {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) playfield[y + player.pos.y][x + player.pos.x] = value;
        });
    });
    sounds.land.play();
}

function arenaSweep() {
    let rowCount = 1;
    for (let y = playfield.length - 1; y > 0; --y) {
        if (playfield[y].every(v => v !== 0)) {
            const row = playfield.splice(y, 1)[0].fill(0);
            playfield.unshift(row);
            y++;
            score += rowCount * 100 * level;
            rowCount *= 2;
            linesTotal++;
            sounds.clear.play();
            if (linesTotal % 10 === 0) {
                level++;
                dropInterval = Math.max(100, 1000 - (level * 100));
            }
        }
    }
    scoreElement.innerText = score;
}

function playerReset() {
    const pieces = 'ILJOTSZ';
    if (!nextPiece.type) {
        nextPiece.type = pieces[Math.random() * pieces.length | 0];
        nextPiece.matrix = createPiece(nextPiece.type);
    }
    player.type = nextPiece.type;
    player.matrix = nextPiece.matrix;
    player.pos.y = 0;
    player.pos.x = 5;
    nextPiece.type = pieces[Math.random() * pieces.length | 0];
    nextPiece.matrix = createPiece(nextPiece.type);
    drawNext();
    canHold = true;
    if (collide(playfield, player)) {
        gameOver = true;
        sounds.music.pause();
        sounds.gameover.play();
        submitScore();
    }
}

async function submitScore() {
    const name = prompt("Enter name (max 16):", "Player") || "Anon";
    try {
        await fetch(NGROK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.substring(0, 16), score: score })
        });
    } catch (e) { console.error("Upload failed"); }
}

function update(time = 0) {
    if (gameOver) return;
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) playerDrop();
    draw();
    animationFrameId = requestAnimationFrame(update);
}

document.addEventListener('keydown', e => {
    if (gameOver) return;
    if (e.keyCode === 37) { player.pos.x--; if (collide(playfield, player)) player.pos.x++; else sounds.move.play(); }
    if (e.keyCode === 39) { player.pos.x++; if (collide(playfield, player)) player.pos.x--; else sounds.move.play(); }
    if (e.keyCode === 40) playerDrop();
    if (e.keyCode === 38) playerRotate(1);
    if (e.keyCode === 32) playerHardDrop();
    if (e.keyCode === 67) playerHold();
});

startButton.addEventListener('click', () => {
    playfield.forEach(row => row.fill(0));
    score = 0; scoreElement.innerText = 0;
    level = 1; linesTotal = 0; dropInterval = 1000;
    gameOver = false;
    sounds.music.play();
    playerReset();
    update();
});
