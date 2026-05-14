document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const ROWS = 8, COLS = 8;
    let board = Array(ROWS).fill().map(() => Array(COLS).fill(null));
    let currentPlayer = 'black';

    function initGame() {
        boardElement.innerHTML = '';
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.onclick = () => handleMove(r, c);
                boardElement.appendChild(cell);
            }
        }
        // Standard Othello starting position
        placePiece(3, 3, 'white');
        placePiece(3, 4, 'black');
        placePiece(4, 3, 'black');
        placePiece(4, 4, 'white');
    }

    function placePiece(r, c, color) {
        board[r][c] = color;
        const cell = boardElement.children[r * 8 + c];
        let piece = cell.querySelector('.piece');

        if (!piece) {
            piece = document.createElement('div');
            cell.appendChild(piece);
        }
        // CSS handles the flip animation when this class changes
        piece.className = 'piece ' + color; 
    }

    function handleMove(r, c) {
        if (board[r][c]) return; // Cell occupied

        const flips = getFlips(r, c, currentPlayer);
        if (flips.length === 0) return; // Not a legal move

        placePiece(r, c, currentPlayer);
        flips.forEach(pos => placePiece(pos.r, pos.c, currentPlayer));
        currentPlayer = (currentPlayer === 'black') ? 'white' : 'black';
    }

    function getFlips(row, col, color) {
        const opponent = (color === 'black') ? 'white' : 'black';
        const directions = [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
        let piecesToFlip = [];

        directions.forEach(([dr, dc]) => {
            let r = row + dr, c = col + dc;
            let temp = [];
            while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === opponent) {
                temp.push({r, c});
                r += dr; c += dc;
            }
            if (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === color) {
                piecesToFlip = piecesToFlip.concat(temp);
            }
        });
        return piecesToFlip;
    }

    initGame();
});
