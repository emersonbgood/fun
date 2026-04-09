<layout>
# domains_identified: [no_match]
</layout>

const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-piece');
const nextContext = nextCanvas.getContext('2d');
const holdCanvas = document.getElementById('hold-piece');
const holdContext = holdCanvas.getContext('2d');

const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startButton = document.getElementById('start-button');

// Adjusted scaling for voxel look (isometric height requires more vertical space)
const BLOCK_SIZE = 22;
context.scale(BLOCK_SIZE, BLOCK_SIZE);
nextContext.scale(BLOCK_SIZE, BLOCK_SIZE);
holdContext.scale(BLOCK_SIZE, BLOCK_SIZE);

let score = 0;
let highScore = localStorage.getItem('tetrisHighScore') || 0;
highScoreElement.innerText = highScore;

let dropInterval = 1000;
let dropCounter = 0;
let lastTime = 0;
let gameOver = true;
let canSwap = true;

const colors = [
    null,
    { base: '#FF0D72', top: '#ff4d94', side: '#b30950' }, // I
    { base: '#0DC2FF', top: '#4dd4ff', side: '#0988b3' }, // L
    { base: '#0DFF72', top: '#4dff94', side: '#09b350' }, // J
    { base: '#F538FF', top: '#f875ff', side: '#ac27b3' }, // O
    { base: '#FF8E0D', top: '#ffa54d', side: '#b36309' }, // Z
    { base: '#FFE138', top: '#ffea70', side: '#b39e27' }, // S
    { base: '#3877FF', top: '#709dff', side: '#2753b3' }, // T
];

const tetrominos = {
    'I': [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
    'L': [[0, 2, 0], [0, 2, 0], [0, 2, 2]],
    'J': [[0, 3, 0], [0, 3, 0], [3, 3, 0]],
    'O': [[4, 4], [4, 4]],
    'Z': [[5, 5, 0], [0, 5, 5], [0, 0, 0]],
    'S': [[0, 6, 6], [6, 6, 0], [0, 0, 0]],
    'T': [[0, 7, 0], [7, 7, 7], [0, 0, 0]],
};

const playfield = Array.from({ length: 20 }, () => Array(12).fill(0));
const player = { pos: { x: 0, y: 0 }, matrix: null };
const nextPiece = { matrix: null };
const holdPiece = { matrix: null };

function createPiece(type) { return tetrominos[type]; }

/**
 * VOXEL STYLE DRAWING
 * Draws a block with Front, Top, and Side faces to mimic Drive Mad/Fancade style.
 */
function drawVoxel(x, y, colorData, ctx, isGhost = false) {
    const ox = x;
    const oy = y;
    const depth = 0.25; // How "thick" the block looks

    if (isGhost) {
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(ox, oy, 0.9, 0.9);
        ctx.globalAlpha = 1.0;
        return;
    }

    // 1. Right/Side Face (Darker)
    ctx.fillStyle = colorData.side;
    ctx.beginPath();
    ctx.moveTo(ox + 0.9, oy + 0.1);
    ctx.lineTo(ox + 0.9 + depth, oy + 0.1 - depth);
    ctx.lineTo(ox + 0.9 + depth, oy + 0.9 - depth);
    ctx.lineTo(ox + 0.9, oy + 0.9);
    ctx.closePath();
    ctx.fill();

    // 2. Top Face (Lighter)
    ctx.fillStyle = colorData.top;
    ctx.beginPath();
    ctx.moveTo(ox + 0.1, oy + 0.1);
    ctx.lineTo(ox + 0.1 + depth, oy + 0.1 - depth);
    ctx.lineTo(ox + 0.9 + depth, oy + 0.1 - depth);
    ctx.lineTo(ox + 0.9, oy + 0.1);
    ctx.closePath();
    ctx.fill();

    // 3. Front Face (Base)
    ctx.fillStyle = colorData.base;
    ctx.fillRect(ox + 0.1, oy + 0.1, 0.8, 0.8);
    
    // Slight edge highlight for the voxel crispness
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 0.02;
    ctx.strokeRect(ox + 0.1, oy + 0.1, 0.8, 0.8);
}

function drawMatrix(matrix, offset, ctx, isGhost = false) {
    if (!matrix) return;
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawVoxel(x + offset.x, y + offset.y, colors[value], ctx, isGhost);
            }
        });
    });
}

function draw() {
    context.fillStyle = '#202028'; // Matches Drive Mad background
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Grid (Optional for that Fancade feel)
    context.strokeStyle = '#32323e';
    context.lineWidth = 0.02;
    for(let i=0; i<12; i++) {
        for(let j=0; j<20; j++) {
            context.strokeRect(i, j, 1, 1);
        }
    }

    drawMatrix(playfield, { x: 0, y: 0 }, context);
    drawGhost();
    drawMatrix(player.matrix, player.pos, context);
}

function drawGhost() {
    let ghostY = player.pos.y;
    while (!collide(playfield, { pos: { x: player.pos.x, y: ghostY + 1 }, matrix: player.matrix })) {
        ghostY++;
    }
    drawMatrix(player.matrix, { x: player.pos.x, y: ghostY }, context, true);
}

// ... (Rest of logic: collide, merge, rotate, arenaSweep remain the same as your core) ...
function collide(field, p) {
    const [m, o] = [p.matrix, p.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (field[y + o.y] && field[y + o.y][x + o.x]) !== 0) return true;
        }
    }
    return false;
}

function merge() {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) playfield[y + player.pos.y][x + player.pos.x] = value;
        });
    });
}

function rotate(matrix) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
    matrix.forEach(row => row.reverse());
}

function arenaSweep() {
    let rowCount = 1;
    for (let y = playfield.length - 1; y > 0; --y) {
        if (playfield[y].every(value => value !== 0)) {
            const row = playfield.splice(y, 1)[0].fill(0);
            playfield.unshift(row);
            y++;
            score += rowCount * 10;
            rowCount *= 2;
        }
    }
    scoreElement.innerText = score;
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

function playerReset() {
    const pieces = 'ILJOTSZ';
    if (!nextPiece.matrix) nextPiece.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.matrix = nextPiece.matrix;
    player.pos.y = 0;
    player.pos.x = (playfield[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    nextPiece.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    canSwap = true;
    drawNext();
    if (collide(playfield, player)) {
        gameOver = true;
        alert("Game Over!");
        playfield.forEach(row => row.fill(0));
    }
}

function playerHold() {
    if (!canSwap) return;
    if (!holdPiece.matrix) {
        holdPiece.matrix = player.matrix;
        playerReset();
    } else {
        const temp = player.matrix;
        player.matrix = holdPiece.matrix;
        holdPiece.matrix = temp;
        player.pos.y = 0;
        player.pos.x = (playfield[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    }
    canSwap = false;
    drawHold();
}

function drawNext() {
    nextContext.fillStyle = '#202028';
    nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    drawMatrix(nextPiece.matrix, { x: 0, y: 1 }, nextContext);
}

function drawHold() {
    holdContext.fillStyle = '#202028';
    holdContext.fillRect(0, 0, holdCanvas.width, holdCanvas.height);
    drawMatrix(holdPiece.matrix, { x: 0, y: 1 }, holdContext);
}

function update(time = 0) {
    if (gameOver) return;
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) playerDrop();
    draw();
    requestAnimationFrame(update);
}

document.addEventListener('keydown', event => {
    if (gameOver) return;
    if (event.keyCode === 37) { player.pos.x--; if (collide(playfield, player)) player.pos.x++; }
    else if (event.keyCode === 39) { player.pos.x++; if (collide(playfield, player)) player.pos.x--; }
    else if (event.keyCode === 40) playerDrop();
    else if (event.keyCode === 38) {
        rotate(player.matrix);
        if (collide(playfield, player)) rotate(player.matrix), rotate(player.matrix), rotate(player.matrix);
    }
    else if (event.keyCode === 32) { // Hard Drop
        while (!collide(playfield, player)) player.pos.y++;
        player.pos.y--; merge(); playerReset(); arenaSweep();
    }
    else if (event.keyCode === 67) playerHold();
});

startButton.onclick = () => {
    gameOver = false;
    score = 0;
    scoreElement.innerText = score;
    holdPiece.matrix = null;
    drawHold();
    playerReset();
    update();
};
