const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-piece');
const nextContext = nextCanvas.getContext('2d');
const holdCanvas = document.getElementById('hold-piece');
const holdContext = holdCanvas.getContext('2d');

const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startButton = document.getElementById('start-button');

// Scale contexts by 20 to use 1x1 units for blocks
context.scale(20, 20);
nextContext.scale(20, 20);
holdContext.scale(20, 20);

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
    '#FF0D72', '#0DC2FF', '#0DFF72', 
    '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'
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

const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
};

const nextPiece = { matrix: null };
const holdPiece = { matrix: null };

function createPiece(type) {
    return tetrominos[type];
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(playfield, { x: 0, y: 0 }, context);
    drawGhost();
    drawMatrix(player.matrix, player.pos, context);
}

function drawMatrix(matrix, offset, ctx, colorOverride = null) {
    if (!matrix) return;
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const posX = x + offset.x;
                const posY = y + offset.y;
                const color = colorOverride || colors[value];

                // 1. Base block color
                ctx.fillStyle = color;
                ctx.fillRect(posX, posY, 1, 1);

                // 2. Add 3D Bevel effect (Skip lighting for the ghost piece)
                if (!colorOverride) {
                    ctx.lineWidth = 0.08; // Adjust for thicker/thinner bevels

                    // Light Highlight (Top and Left edges)
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.beginPath();
                    ctx.moveTo(posX, posY + 1);
                    ctx.lineTo(posX, posY);
                    ctx.lineTo(posX + 1, posY);
                    ctx.stroke();

                    // Dark Shadow (Bottom and Right edges)
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                    ctx.beginPath();
                    ctx.moveTo(posX + 1, posY);
                    ctx.lineTo(posX + 1, posY + 1);
                    ctx.lineTo(posX, posY + 1);
                    ctx.stroke();
                }
            }
        });
    });
}

function drawGhost() {
    let ghostY = player.pos.y;
    while (!collide(playfield, { pos: { x: player.pos.x, y: ghostY + 1 }, matrix: player.matrix })) {
        ghostY++;
    }
    // Ghost is drawn with a semi-transparent white override, skipping the 3D effect
    drawMatrix(player.matrix, { x: player.pos.x, y: ghostY }, context, 'rgba(255, 255, 255, 0.15)');
}

function collide(field, p) {
    const [m, o] = [p.matrix, p.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (field[y + o.y] && field[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge() {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                playfield[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
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
            score += rowCount * 100;
            rowCount *= 2;
        }
    }
    scoreElement.innerText = score;
    updateHighScore();
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        highScoreElement.innerText = highScore;
        localStorage.setItem('tetrisHighScore', highScore);
    }
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
    if (!nextPiece.matrix) {
        nextPiece.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    }
    
    player.matrix = nextPiece.matrix;
    player.pos.y = 0;
    player.pos.x = (playfield[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    
    nextPiece.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    canSwap = true;
    drawNext();

    if (collide(playfield, player)) {
        gameOver = true;
        alert("Game Over! Final Score: " + score);
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
    nextContext.fillStyle = '#000';
    nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    drawMatrix(nextPiece.matrix, { x: 1, y: 1 }, nextContext);
}

function drawHold() {
    holdContext.fillStyle = '#000';
    holdContext.fillRect(0, 0, holdCanvas.width, holdCanvas.height);
    drawMatrix(holdPiece.matrix, { x: 1, y: 1 }, holdContext);
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

    if (event.keyCode === 37) { // Left
        player.pos.x--;
        if (collide(playfield, player)) player.pos.x++;
    } else if (event.keyCode === 39) { // Right
        player.pos.x++;
        if (collide(playfield, player)) player.pos.x--;
    } else if (event.keyCode === 40) { // Down
        playerDrop();
    } else if (event.keyCode === 38) { // Up (Rotate)
        const pos = player.pos.x;
        let offset = 1;
        rotate(player.matrix);
        while (collide(playfield, player)) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.matrix[0].length) {
                rotate(player.matrix); rotate(player.matrix); rotate(player.matrix);
                player.pos.x = pos;
                return;
            }
        }
    } else if (event.keyCode === 32) { // Space (Hard Drop)
        while (!collide(playfield, player)) player.pos.y++;
        player.pos.y--;
        merge();
        playerReset();
        arenaSweep();
    } else if (event.keyCode === 67) { // C (Swap/Hold)
        playerHold();
    }
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
