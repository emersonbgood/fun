// --- CONSTANTS AND SETUP ---
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-button');
const nextPieceCanvas = document.getElementById('next-piece');
const nextPieceContext = nextPieceCanvas.getContext('2d');

context.scale(20, 20); // Each block is 20x20 game units
nextPieceContext.scale(20, 20);

const BOARD_WIDTH = 12;
const BOARD_HEIGHT = 20;
const PIECE_SIZE = 4;

let score = 0;
let gameOver = false;
let animationFrameId;

// Colors for the standard 7 Tetrominoes (index 0 is empty)
const colors = [
    null,
    '#FF0D72', // T
    '#0DC2FF', // I
    '#0DFF72', // S
    '#F538FF', // Z
    '#FF8E0D', // L
    '#FFE138', // O
    '#3877FF', // J
];

// Tetromino matrices (FILLED IN)
const tetrominos = {
    'T': [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    'I': [
        [0, 2, 0, 0],
        [0, 2, 0, 0],
        [0, 2, 0, 0],
        [0, 2, 0, 0],
    ],
    'S': [
        [0, 3, 3],
        [3, 3, 0],
        [0, 0, 0],
    ],
    'Z': [
        [4, 4, 0],
        [0, 4, 4],
        [0, 0, 0],
    ],
    'L': [
        [0, 0, 5],
        [5, 5, 5],
        [0, 0, 0],
    ],
    'O': [
        [6, 6],
        [6, 6],
    ],
    'J': [
        [7, 0, 0],
        [7, 7, 7],
        [0, 0, 0],
    ],
};

// Game board matrix
const playfield = createMatrix(BOARD_WIDTH, BOARD_HEIGHT);
const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};
const nextPlayer = {
    matrix: null,
};

// ... in the asset loading section ...
const sounds = {
    rotate: new Audio('assets/sounds/rotate.mp3'),
    move: new Audio('assets/sounds/move.mp3'),
    land: new Audio('assets/sounds/land.mp3'),
    clear: new Audio('assets/sounds/clear.mp3'),
    gameover: new Audio('assets/sounds/gameover.mp3'),
    music: new Audio('assets/sounds/music.mp3') // Add this line
};
sounds.music.loop = true; // Add this line to make the music loop
// --- GAME FUNCTIONS (rest of the code is unchanged) ---

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(playfield, {x: 0, y: 0}, context);
    drawMatrix(player.matrix, player.pos, context);
}

function drawMatrix(matrix, offset, drawContext) {
    if (!matrix) return;
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawContext.fillStyle = colors[value];
                drawContext.fillRect(x + offset.x, y + offset.y, 1, 1);
                drawContext.strokeStyle = '#202028';
                drawContext.lineWidth = 0.05;
                drawContext.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function drawNextPiece() {
    nextPieceContext.fillStyle = '#000';
    nextPieceContext.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    if (nextPlayer.matrix) {
        const offset = {
            x: (PIECE_SIZE - nextPlayer.matrix.length) / 2,
            y: (PIECE_SIZE - nextPlayer.matrix.length) / 2
        };
        drawMatrix(nextPlayer.matrix, offset, nextPieceContext);
    }
}

function merge(playfield, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                playfield[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
    sounds.land.play();
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < y; x++) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
    sounds.rotate.play();
}

function collide(playfield, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[y].length; x++) {
            if (m[y][x] !== 0 &&
                (playfield[y + o.y] && playfield[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function playerMove(offset) {
    player.pos.x += offset;
    if (collide(playfield, player)) {
        player.pos.x -= offset;
    }
    sounds.move.play();
}

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

function playerDrop() {
    player.pos.y++;
    if (collide(playfield, player)) {
        player.pos.y--;
        merge(playfield, player);
        playerReset();
        clearLines();
        if (gameOver) return;
    }
    dropCounter = 0;
}

function clearLines() {
    let linesCleared = 0;
    for (let y = playfield.length - 1; y >= 0; --y) {
        if (playfield[y].every(value => value !== 0)) {
            linesCleared++;
            playfield.splice(y, 1);
            playfield.unshift(new Array(BOARD_WIDTH).fill(0));
            y++;
        }
    }
    if (linesCleared > 0) {
        const points = [, 100, 300, 500, 800];
        score += points[linesCleared] || 0;
        scoreElement.innerText = score;
        sounds.clear.play();
    }
}

function playerReset() {
    player.matrix = nextPlayer.matrix;
    player.pos.y = 0;
    player.pos.x = Math.floor(playfield.length / 2) - Math.floor(player.matrix.length / 2);
    nextPlayer.matrix = createPiece(getRandomPieceName());
    drawNextPiece();

    if (collide(playfield, player)) {
        gameOver = true;
        cancelAnimationFrame(animationFrameId);
        sounds.gameover.play();
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#fff';
        context.font = '1px Arial';
        context.textAlign = 'center';
        context.fillText('GAME OVER', canvas.width / 40, canvas.height / 40 + 5);
    }
}

function getRandomPieceName() {
    const pieces = 'IJLOSTZ';
    return pieces[Math.floor(Math.random() * pieces.length)];
}

function createPiece(type) {
    const matrix = tetrominos[type];
    return matrix.map(row => [...row]);
}

// --- GAME LOOP AND INPUT ---

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    if (!gameOver) {
        animationFrameId = requestAnimationFrame(update);
    }
}

document.addEventListener('keydown', event => {
    if (gameOver) return;

    if (event.keyCode === 37) { // Left arrow
        playerMove(-1);
    } else if (event.keyCode === 39) { // Right arrow
        playerMove(1);
    } else if (event.keyCode === 40) { // Down arrow (soft drop)
        playerDrop();
    } else if (event.keyCode === 38) { // Up arrow (rotate clockwise)
        playerRotate(1);
    } else if (event.keyCode === 90) { // Z key (rotate counter-clockwise)
        playerRotate(-1);
    }
});

startButton.addEventListener('click', () => {
    if (gameOver) {
        playfield.forEach(row => row.fill(0));
        score = 0;
        scoreElement.innerText = score;
        gameOver = false;
        dropInterval = 1000;
    }
    playerReset();
    update();
});

// Initial next piece setup before the first game starts
nextPlayer.matrix = createPiece(getRandomPieceName());
drawNextPiece();
