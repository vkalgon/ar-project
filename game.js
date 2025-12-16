// Логика игры крестики-нолики
class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill(null); // 3x3 доска
        this.currentPlayer = 'X'; // X начинает
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
        this.showMessage('Наведите камеру на AR маркер для размещения игрового поля');
    }

    setupEventListeners() {
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        document.getElementById('restart-game-btn').addEventListener('click', () => this.restart());
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
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
            cell.setAttribute('height', 0.1);
            cell.setAttribute('depth', cellSize);
            cell.setAttribute('color', 'rgba(255, 255, 255, 0)');
            cell.setAttribute('opacity', '0');
            cell.setAttribute('material', 'transparent: true; opacity: 0');
            cell.setAttribute('cursor', 'rayOrigin: mouse');
            cell.addEventListener('click', () => this.handleCellClick(index));
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
            this.endGame(null); // Ничья
            return;
        }

        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.showMessage(`Ход игрока: ${this.currentPlayer}`);
    }

    renderMove(index) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        if (!cell) return;

        const pos = cell.getAttribute('position');
        const symbol = document.createElement('a-text');
        symbol.setAttribute('value', this.currentPlayer);
        symbol.setAttribute('align', 'center');
        symbol.setAttribute('position', `${pos.x} ${pos.y + 0.1} ${pos.z}`);
        symbol.setAttribute('rotation', '-90 0 0');
        symbol.setAttribute('width', '10');
        symbol.setAttribute('height', '10');
        symbol.setAttribute('color', this.currentPlayer === 'X' ? '#FF4444' : '#4444FF');
        symbol.setAttribute('geometry', 'primitive: plane');
        symbol.setAttribute('material', 'side: double');
        
        // Анимация появления
        symbol.setAttribute('animation', `property: scale; from: 0 0 0; to: 1 1 1; dur: 300; easing: easeOutQuad`);
        
        cell.appendChild(symbol);
    }

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Горизонтальные
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Вертикальные
            [0, 4, 8], [2, 4, 6] // Диагональные
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
        
        // Делаем ячейки видимыми для клика
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

        // Очищаем доску
        document.querySelectorAll('.game-cell').forEach(cell => {
            const text = cell.querySelector('a-text');
            if (text) {
                text.remove();
            }
        });

        document.getElementById('game-over').classList.remove('show');
        document.getElementById('start-btn').style.display = 'block';
        document.getElementById('restart-btn').style.display = 'none';
        this.showMessage('Нажмите "Начать игру" чтобы начать');
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

    onMarkerFound() {
        if (!this.boardPlaced) {
            this.boardPlaced = true;
            document.getElementById('start-btn').style.display = 'block';
            this.showMessage('Маркер найден! Нажмите "Начать игру"');
        }
    }
}

// Инициализация игры
let game;

window.addEventListener('load', () => {
    game = new TicTacToeGame();
    
    // Слушаем события маркера
    const scene = document.getElementById('scene');
    const boardEntity = document.getElementById('game-board');
    
    // Создаем маркер для AR.js
    const marker = document.createElement('a-marker');
    marker.setAttribute('type', 'pattern');
    marker.setAttribute('url', 'marker.patt');
    marker.setAttribute('id', 'marker');
    marker.setAttribute('smooth', 'true');
    marker.setAttribute('smoothCount', '10');
    marker.setAttribute('smoothTolerance', '0.01');
    marker.setAttribute('smoothThreshold', '5');
    
    // Привязываем игровое поле к маркеру
    boardEntity.setAttribute('position', '0 0 0');
    boardEntity.setAttribute('rotation', '0 0 0');
    marker.appendChild(boardEntity);
    scene.appendChild(marker);
    
    // Слушаем события обнаружения маркера
    marker.addEventListener('markerFound', () => {
        game.onMarkerFound();
    });
    
    marker.addEventListener('markerLost', () => {
        // Можно добавить обработку потери маркера
    });
});

