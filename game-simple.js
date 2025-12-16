// Упрощенная версия без маркера - размещение по клику
class TicTacToeGameSimple {
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
        this.showMessage('Коснитесь экрана, чтобы разместить игровое поле');
        this.setupClickToPlace();
    }

    setupEventListeners() {
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        document.getElementById('restart-game-btn').addEventListener('click', () => this.restart());
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
    }

    setupClickToPlace() {
        const scene = document.getElementById('scene');
        let placed = false;

        const placeBoard = () => {
            if (placed || this.boardPlaced) return;
            
            const camera = document.querySelector('a-camera');
            const boardEntity = document.getElementById('game-board');
            
            if (camera && boardEntity) {
                // Размещаем доску перед камерой на фиксированном расстоянии
                // Позиция: 0 по X, немного ниже уровня глаз по Y, на расстоянии 1.5 по Z
                boardEntity.setAttribute('position', '0 -0.6 -1.5');
                boardEntity.setAttribute('rotation', '0 0 0');
                
                this.boardPlaced = true;
                placed = true;
                document.getElementById('start-btn').style.display = 'block';
                this.showMessage('Игровое поле размещено! Нажмите "Начать игру"');
            }
        };

        // Размещение по клику или тапу
        scene.addEventListener('click', placeBoard);
        scene.addEventListener('touchstart', (e) => {
            e.preventDefault();
            placeBoard();
        });
        
        // Также размещаем автоматически через небольшую задержку для удобства
        setTimeout(() => {
            if (!this.boardPlaced) {
                placeBoard();
            }
        }, 500);
    }

    createBoard() {
        const boardEntity = document.getElementById('game-board');
        boardEntity.innerHTML = '';

        // Создаем игровое поле
        const board = document.createElement('a-box');
        board.setAttribute('id', 'board-base');
        board.setAttribute('position', '0 0 0');
        board.setAttribute('width', '2');
        board.setAttribute('height', '0.1');
        board.setAttribute('depth', '2');
        board.setAttribute('color', '#8B4513');
        board.setAttribute('material', 'roughness: 0.8; metalness: 0.2');
        boardEntity.appendChild(board);

        // Создаем линии сетки
        const lineColor = '#654321';
        const lineThickness = 0.05;
        const cellSize = 0.6;
        const offset = cellSize + 0.1;

        // Вертикальные линии
        for (let i = -1; i <= 1; i += 2) {
            const line = document.createElement('a-box');
            line.setAttribute('position', `${i * offset} 0.06 0`);
            line.setAttribute('width', lineThickness);
            line.setAttribute('height', lineThickness);
            line.setAttribute('depth', '2');
            line.setAttribute('color', lineColor);
            boardEntity.appendChild(line);
        }

        // Горизонтальные линии
        for (let i = -1; i <= 1; i += 2) {
            const line = document.createElement('a-box');
            line.setAttribute('position', `0 0.06 ${i * offset}`);
            line.setAttribute('width', '2');
            line.setAttribute('height', lineThickness);
            line.setAttribute('depth', lineThickness);
            line.setAttribute('color', lineColor);
            boardEntity.appendChild(line);
        }

        // Создаем кликабельные ячейки
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
            cell.setAttribute('height', 0.1');
            cell.setAttribute('depth', cellSize);
            cell.setAttribute('color', 'rgba(255, 255, 255, 0)');
            cell.setAttribute('opacity', '0');
            cell.setAttribute('material', 'transparent: true; opacity: 0');
            cell.setAttribute('cursor', 'rayOrigin: mouse; fuse: false');
            cell.setAttribute('raycaster', 'objects: .game-cell');
            
            // Обработка кликов и касаний
            const handleInteraction = () => this.handleCellClick(index);
            cell.addEventListener('click', handleInteraction);
            cell.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleInteraction();
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
        this.showMessage(`Ход игрока: ${this.currentPlayer}`);
    }

    renderMove(index) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        if (!cell) return;

        const pos = cell.getAttribute('position');
        const posX = typeof pos === 'object' ? pos.x : pos.split(' ')[0];
        const posY = typeof pos === 'object' ? pos.y : pos.split(' ')[1];
        const posZ = typeof pos === 'object' ? pos.z : pos.split(' ')[2];
        
        const symbol = document.createElement('a-text');
        symbol.setAttribute('value', this.currentPlayer);
        symbol.setAttribute('align', 'center');
        symbol.setAttribute('position', `${posX} ${parseFloat(posY) + 0.15} ${posZ}`);
        symbol.setAttribute('rotation', '-90 0 0');
        symbol.setAttribute('width', '8');
        symbol.setAttribute('height', '8');
        symbol.setAttribute('color', this.currentPlayer === 'X' ? '#FF4444' : '#4444FF');
        symbol.setAttribute('geometry', 'primitive: plane');
        symbol.setAttribute('material', 'side: double');
        
        // Анимация появления
        symbol.setAttribute('animation', `property: scale; from: 0 0 0; to: 1 1 1; dur: 300; easing: easeOutQuad`);
        
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
                this.highlightWinner(pattern);
                return true;
            }
        }

        return false;
    }

    highlightWinner(pattern) {
        pattern.forEach(index => {
            const cell = document.querySelector(`[data-index="${index}"]`);
            if (cell) {
                const text = cell.querySelector('a-text');
                if (text) {
                    text.setAttribute('animation', `property: rotation; 
                        from: -90 0 0; 
                        to: -90 0 360; 
                        dur: 1000; 
                        loop: true; 
                        easing: linear`);
                }
            }
        });
    }

    endGame(winner) {
        this.gameOver = true;
        const gameOverEl = document.getElementById('game-over');
        const message = winner 
            ? `Игрок ${winner} победил!` 
            : 'Ничья!';
        
        gameOverEl.innerHTML = `
            <div>${message}</div>
            <button class="button" id="restart-game-btn" style="margin-top: 15px;">Играть снова</button>
        `;
        gameOverEl.classList.add('show');
        
        document.getElementById('restart-game-btn').addEventListener('click', () => this.restart());
    }

    startGame() {
        this.gameStarted = true;
        document.getElementById('start-btn').style.display = 'none';
        document.getElementById('restart-btn').style.display = 'block';
        this.showMessage(`Игра началась! Ход игрока: ${this.currentPlayer}`);
        
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
            if (text) {
                text.remove();
            }
        });

        document.getElementById('game-over').classList.remove('show');
        document.getElementById('start-btn').style.display = 'none';
        document.getElementById('restart-btn').style.display = 'none';
        this.showMessage('Коснитесь экрана, чтобы разместить игровое поле');
        
        // Пересоздаем доску
        this.createBoard();
        this.setupClickToPlace();
    }

    showMessage(text) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.classList.remove('hidden');
        messageEl.classList.add('show');
        
        setTimeout(() => {
            messageEl.classList.remove('show');
            messageEl.classList.add('hidden');
        }, 3000);
    }
}

// Инициализация
let game;

// Ждем полной загрузки A-Frame
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    // Если A-Frame еще не загружен, ждем события 'loaded'
    if (typeof AFRAME !== 'undefined') {
        initGame();
    } else {
        window.addEventListener('load', () => {
            setTimeout(initGame, 500);
        });
    }
}

function initGame() {
    // Дополнительная задержка для инициализации A-Frame сцены
    setTimeout(() => {
        game = new TicTacToeGameSimple();
    }, 300);
}

