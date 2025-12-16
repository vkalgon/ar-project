// Простая версия игры крестики-нолики для мобильных
class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.winner = null;
        this.moves = 0;
        this.boardPlaced = false;
        this.gameStarted = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createBoard();
        this.showMessage('Коснитесь экрана для размещения доски');
        this.setupClickToPlace();
    }

    setupEventListeners() {
        const restartBtn = document.getElementById('restart-btn');
        const startBtn = document.getElementById('start-btn');
        const restartGameBtn = document.getElementById('restart-game-btn');
        
        if (restartBtn) restartBtn.addEventListener('click', () => this.restart());
        if (startBtn) startBtn.addEventListener('click', () => this.startGame());
        if (restartGameBtn) restartGameBtn.addEventListener('click', () => this.restart());
    }

    setupClickToPlace() {
        const scene = document.getElementById('scene');
        if (!scene) return;
        
        let placed = false;

        const placeBoard = () => {
            if (placed || this.boardPlaced) return;
            
            const boardEntity = document.getElementById('game-board');
            if (!boardEntity) return;
            
            boardEntity.setAttribute('position', '0 -0.6 -1.5');
            boardEntity.setAttribute('rotation', '0 0 0');
            
            this.boardPlaced = true;
            placed = true;
            
            const startBtn = document.getElementById('start-btn');
            if (startBtn) startBtn.style.display = 'block';
            
            this.showMessage('Доска размещена! Нажмите ▶️');
        };

        scene.addEventListener('click', placeBoard);
        scene.addEventListener('touchstart', (e) => {
            e.preventDefault();
            placeBoard();
        });
        
        setTimeout(placeBoard, 1000);
    }

    createBoard() {
        const boardEntity = document.getElementById('game-board');
        if (!boardEntity) {
            setTimeout(() => this.createBoard(), 100);
            return;
        }
        
        boardEntity.innerHTML = '';

        // Игровое поле
        const board = document.createElement('a-box');
        board.setAttribute('position', '0 0 0');
        board.setAttribute('width', '2');
        board.setAttribute('height', '0.1');
        board.setAttribute('depth', '2');
        board.setAttribute('color', '#8B4513');
        boardEntity.appendChild(board);

        // Линии сетки
        const lineColor = '#654321';
        const cellSize = 0.6;
        const offset = cellSize + 0.1;

        // Вертикальные линии
        for (let i = -1; i <= 1; i += 2) {
            const line = document.createElement('a-box');
            line.setAttribute('position', `${i * offset} 0.06 0`);
            line.setAttribute('width', '0.05');
            line.setAttribute('height', '0.05');
            line.setAttribute('depth', '2');
            line.setAttribute('color', lineColor);
            boardEntity.appendChild(line);
        }

        // Горизонтальные линии
        for (let i = -1; i <= 1; i += 2) {
            const line = document.createElement('a-box');
            line.setAttribute('position', `0 0.06 ${i * offset}`);
            line.setAttribute('width', '2');
            line.setAttribute('height', '0.05');
            line.setAttribute('depth', '0.05');
            line.setAttribute('color', lineColor);
            boardEntity.appendChild(line);
        }

        // Ячейки для клика
        const positions = [
            [-offset, 0.15, -offset], [0, 0.15, -offset], [offset, 0.15, -offset],
            [-offset, 0.15, 0], [0, 0.15, 0], [offset, 0.15, 0],
            [-offset, 0.15, offset], [0, 0.15, offset], [offset, 0.15, offset]
        ];

        positions.forEach((pos, index) => {
            const cell = document.createElement('a-box');
            cell.setAttribute('class', 'game-cell');
            cell.setAttribute('data-index', index);
            cell.setAttribute('position', `${pos[0]} ${pos[1]} ${pos[2]}`);
            cell.setAttribute('width', cellSize);
            cell.setAttribute('height', '0.1');
            cell.setAttribute('depth', cellSize);
            cell.setAttribute('color', 'rgba(255, 255, 255, 0)');
            cell.setAttribute('opacity', '0');
            cell.setAttribute('material', 'transparent: true; opacity: 0');
            cell.setAttribute('cursor', 'rayOrigin: mouse');
            
            const handleClick = () => this.handleCellClick(index);
            cell.addEventListener('click', handleClick);
            cell.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleClick();
            });
            
            boardEntity.appendChild(cell);
        });
    }

    handleCellClick(index) {
        if (!this.gameStarted || this.gameOver) return;
        if (this.board[index] !== null) return;
        this.makeMove(index);
    }

    makeMove(index) {
        this.board[index] = this.currentPlayer;
        this.moves++;
        this.renderMove(index);
        
        if (this.checkWinner()) {
            this.endGame(this.winner);
            return;
        }

        if (this.moves === 9) {
            this.endGame(null);
            return;
        }

        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.showMessage(`Ход: ${this.currentPlayer}`);
    }

    renderMove(index) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        if (!cell) return;

        const pos = cell.getAttribute('position');
        const posArray = typeof pos === 'object' ? [pos.x, pos.y, pos.z] : pos.split(' ');
        
        const symbol = document.createElement('a-text');
        symbol.setAttribute('value', this.currentPlayer);
        symbol.setAttribute('align', 'center');
        symbol.setAttribute('position', `${posArray[0]} ${parseFloat(posArray[1]) + 0.15} ${posArray[2]}`);
        symbol.setAttribute('rotation', '-90 0 0');
        symbol.setAttribute('width', '8');
        symbol.setAttribute('height', '8');
        symbol.setAttribute('color', this.currentPlayer === 'X' ? '#FF4444' : '#4444FF');
        
        cell.appendChild(symbol);
    }

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                this.winner = this.board[a];
                return true;
            }
        }

        return false;
    }

    endGame(winner) {
        this.gameOver = true;
        const gameOverEl = document.getElementById('game-over');
        const gameOverText = document.getElementById('game-over-text');
        
        if (gameOverText) {
            gameOverText.textContent = winner ? `Игрок ${winner} победил!` : 'Ничья!';
        }
        
        if (gameOverEl) {
            gameOverEl.classList.add('show');
        }
    }

    startGame() {
        this.gameStarted = true;
        const startBtn = document.getElementById('start-btn');
        const restartBtn = document.getElementById('restart-btn');
        
        if (startBtn) startBtn.style.display = 'none';
        if (restartBtn) restartBtn.style.display = 'block';
        
        this.showMessage(`Ход: ${this.currentPlayer}`);
        
        document.querySelectorAll('.game-cell').forEach(cell => {
            cell.setAttribute('opacity', '0.3');
            cell.setAttribute('material', 'transparent: false; opacity: 0.3');
        });
    }

    restart() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.winner = null;
        this.moves = 0;
        this.gameStarted = false;
        this.boardPlaced = false;

        document.querySelectorAll('.game-cell').forEach(cell => {
            const text = cell.querySelector('a-text');
            if (text) text.remove();
        });

        const gameOverEl = document.getElementById('game-over');
        const startBtn = document.getElementById('start-btn');
        const restartBtn = document.getElementById('restart-btn');
        
        if (gameOverEl) gameOverEl.classList.remove('show');
        if (startBtn) startBtn.style.display = 'none';
        if (restartBtn) restartBtn.style.display = 'none';
        
        this.showMessage('Коснитесь экрана для размещения доски');
        this.createBoard();
        this.setupClickToPlace();
    }

    showMessage(text) {
        const messageEl = document.getElementById('message');
        if (messageEl) {
            messageEl.textContent = text;
        }
    }
}

// Инициализация
let game;

function initGame() {
    try {
        if (typeof AFRAME === 'undefined') {
            setTimeout(initGame, 200);
            return;
        }
        
        const scene = document.getElementById('scene');
        if (!scene) {
            setTimeout(initGame, 200);
            return;
        }
        
        const onLoaded = () => {
            setTimeout(() => {
                if (!game) {
                    game = new TicTacToeGame();
                }
            }, 500);
        };
        
        if (scene.hasLoaded) {
            onLoaded();
        } else {
            scene.addEventListener('loaded', onLoaded);
            setTimeout(onLoaded, 2000);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        const errorMsg = document.getElementById('error-message');
        if (errorMsg) {
            errorMsg.textContent = 'Ошибка: ' + error.message;
            errorMsg.style.display = 'block';
        }
    }
}

// Запуск
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initGame, 500);
    });
} else {
    setTimeout(initGame, 500);
}
