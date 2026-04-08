// --- CONSTANTS AND SETUP ---
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-button');
const nextPieceCanvas = document.getElementById('next-piece');
const nextPieceContext = nextPieceCanvas.getContext('2d');

context.scale(20, 20); 
nextPieceContext.scale(20, 20);

const BOARD_WIDTH = 12;
const BOARD_HEIGHT = 20;
const PIECE_SIZE = 4;

let score = 0;
let gameOver = false;
let animationFrameId;
let holdPiece = null; // New: Hold Piece storage
let canHold = true;   // New: Prevents holding twice in one turn

const colors = [
    null,
    '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF',
];

const tetrominos = {
    'T': [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    'I': [[0, 0, 0, 0], [2, 2, 2, 2], [0, 0, 0, 0], [0, 0, 0, 0]],
    'S': [[0, 3, 3], [3, 3, 0], [0, 0, 0]],
    'Z': [[4, 4, 0], [0, 4, 4], [0, 0, 0]],
    'L': [[0, 0, 5], [5, 5, 5], [0, 0, 0]],
    'O': [[6, 6], [6, 6]],
    'J': [[7, 0, 0], [7, 7, 7], [0, 0, 0]],
};

const playfield = createMatrix(BOARD_WIDTH, BOARD_HEIGHT);
const player = { pos: {x: 0, y: 0}, matrix: null, type: null };
const nextPlayer = { matrix: null, type: null };

const sounds = {
    rotate: new Audio('assets/sounds/rotate.mp3'),
    move: new Audio('assets/sounds/move.mp3'),
    land: new Audio('assets/sounds/land.mp3'),
    clear: new Audio('assets/sounds/clear.mp3'),
    gameover: new Audio('assets/sounds/gameover.mp3'),
    music: new Audio('assets/sounds/music.mp3')
};
sounds.music.loop = true;

function createMatrix(w, h) {
    const matrix = [];
    while (h--) { matrix.push(new Array(w).fill(0)); }
    return matrix;
}

// --- UPGRADE: GHOST PIECE ---
function drawGhost() {
    let ghostY = player.pos.y;
    while (!collide(playfield, {pos: {x: player.pos.x, y: ghostY + 1}, matrix: player.matrix})) {
        ghostY++;
    }
    drawMatrix(player.matrix, {x: player.pos.x, y: ghostY}, context, 'rgba(255, 255, 255, 0.2)');
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(playfield, {x: 0, y: 0}, context);
    drawGhost(); 
    drawMatrix(player.matrix, player.pos, context);
}

function drawMatrix(matrix, offset, drawContext, colorOverride = null) {
    if (!matrix) return;
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawContext.fillStyle = colorOverride || colors[value];
                drawContext.fillRect(x + offset.x, y + offset.y, 1, 1);
                if (!colorOverride) {
                    drawContext.strokeStyle = '#202028';
                    drawContext.lineWidth = 0.05;
                    drawContext.strokeRect(x + offset.x, y + offset.y, 1, 1);
                }
            }
        });
    });
}

function drawNextPiece() {
    nextPieceContext.fillStyle = '#000';
    nextPieceContext.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    if (nextPlayer.matrix) {
        const offset = { x: 1, y: 1 };
        drawMatrix(nextPlayer.matrix, offset, nextPieceContext);
    }
}

// --- UPGRADE: HOLD PIECE ---
function playerHold() {
    if (!canHold) return;
    if (!holdPiece) {
        holdPiece = { matrix: player.matrix, type: player.type };
        playerReset();
    } else {
        const temp = { matrix: player.matrix, type: player.type };
        player.matrix = holdPiece.matrix;
        player.type = holdPiece.type;
        holdPiece = temp;
        player.pos.y = 0;
        player.pos.x = Math.floor(BOARD_WIDTH / 2) - Math.floor(player.matrix.length / 2);
    }
    canHold = false;
}

// --- UPGRADE: SRS (Wall Kicks) ---
function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(playfield, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix.length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

// --- UPGRADE: HARD DROP ---
function playerHardDrop() {
    while (!collide(playfield, player)) {
        player.pos.y++;
    }
    player.pos.y--;
    merge(playfield, player);
    playerReset();
    clearLines();
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < y; x++) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    dir > 0 ? matrix.forEach(row => row.reverse()) : matrix.reverse();
    sounds.rotate.play();
}

function collide(playfield, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[y].length; x++) {
            if (m[y][x] !== 0 && (playfield[y + o.y] && playfield[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function playerMove(offset) {
    player.pos.x += offset;
    if (collide(playfield, player)) player.pos.x -= offset;
    else sounds.move.play();
}

function playerDrop() {
    player.pos.y++;
    if (collide(playfield, player)) {
        player.pos.y--;
        merge(playfield, player);
        playerReset();
        clearLines();
    }
    dropCounter = 0;
}

function merge(playfield, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) playfield[y + player.pos.y][x + player.pos.x] = value;
        });
    });
    sounds.land.play();
}

function clearLines() {
    let linesCleared = 0;
    for (let y = playfield.length - 1; y >= 0; --y) {
        if (playfield[y].every(v => v !== 0)) {
            linesCleared++;
            playfield.splice(y, 1);
            playfield.unshift(new Array(BOARD_WIDTH).fill(0));
            y++;
        }
    }
    if (linesCleared > 0) {
        const points = [0, 100, 300, 500, 800];
        score += points[linesCleared];
        scoreElement.innerText = score;
        sounds.clear.play();
    }
}

function playerReset() {
    if (!nextPlayer.type) {
        nextPlayer.type = getRandomPieceName();
        nextPlayer.matrix = createPiece(nextPlayer.type);
    }
    
    player.type = nextPlayer.type;
    player.matrix = nextPlayer.matrix;
    player.pos.y = 0;
    player.pos.x = Math.floor(BOARD_WIDTH / 2) - Math.floor(player.matrix.length / 2);
    
    nextPlayer.type = getRandomPieceName();
    nextPlayer.matrix = createPiece(nextPlayer.type);
    drawNextPiece();
    canHold = true;

    if (collide(playfield, player)) {
        gameOver = true;
        sounds.music.pause();
        sounds.gameover.play();
        drawGameOver();
    }
}

function drawGameOver() {
    context.fillStyle = 'rgba(0, 0, 0, 0.75)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#fff';
    context.font = '1px Arial';
    context.textAlign = 'center';
    context.fillText('GAME OVER', BOARD_WIDTH / 2, BOARD_HEIGHT / 2);
}

function getRandomPieceName() {
    return 'IJLOSTZ'[Math.floor(Math.random() * 7)];
}

function createPiece(type) {
    return tetrominos[type].map(row => [...row]);
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    if (gameOver) return;
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) playerDrop();
    draw();
    animationFrameId = requestAnimationFrame(update);
}

document.addEventListener('keydown', event => {
    if (gameOver) return;
    if (event.keyCode === 37) playerMove(-1); // Left
    if (event.keyCode === 39) playerMove(1);  // Right
    if (event.keyCode === 40) playerDrop();    // Down
    if (event.keyCode === 38) playerRotate(1); // Up (Rotate)
    if (event.keyCode === 32) playerHardDrop(); // Space
    if (event.keyCode === 67) playerHold();     // C (Hold)
});

startButton.addEventListener('click', () => {
    cancelAnimationFrame(animationFrameId);
    playfield.forEach(row => row.fill(0));
    score = 0;
    scoreElement.innerText = score;
    gameOver = false;
    sounds.music.currentTime = 0;
    sounds.music.play();
    playerReset();
    update();
});
