document.addEventListener("DOMContentLoaded", function () {
    const board = document.getElementById("game-board");
    const resetButton = document.getElementById("resetButton");
    const playerXWinsDisplay = document.getElementById("playerXWins");
    const playerOWinsDisplay = document.getElementById("playerOWins");
    const rows = 5;
    const cols = 6;

    let currentPlayer = "X";
    let gameBoard = Array.from({ length: rows }, () => Array(cols).fill(""));
    let playerXTally = 0;
    let playerOTally = 0;
    let player1Name, player2Name; // Declare variables for player names

    // Initialize the game board
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener("click", handleCellClick);
            board.appendChild(cell);
        }
    }

    // Event listener for the "START GAME" button
    const playButton = document.getElementById("play");
    playButton.addEventListener("click", function () {
        player1Name = document.getElementById('player1Name').value || "Player 1";
        player2Name = document.getElementById('player2Name').value || "Player 2";

        // Sets the initial player names
        playerXWinsDisplay.textContent = `${player1Name} Wins: 0`;
        playerOWinsDisplay.textContent = `${player2Name} Wins: 0`;
        document.getElementById('currentTurn').textContent = `${player1Name}'s Turn`;

        document.getElementById('hiddenElements').style.display = 'block';

        // Enables human player after showing elements
        enableHumanPlayer();
    });

    function enableHumanPlayer() {
        document.querySelectorAll(".cell").forEach((cell) => {
            cell.addEventListener("click", handleCellClick);
        });
    }

    function handleCellClick(event) {
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
    
        if (gameBoard[row][col] === "") {
            gameBoard[row][col] = currentPlayer;
            event.target.textContent = currentPlayer;
    
            // Apply color to the text based on the player
            event.target.style.color = currentPlayer === "X" ? "red" : "blue"; 
    
            // Check for a win or a tie 
            if (checkForWin(row, col)) {
                announceWinner();
                setTimeout(() => {
                    updateWinTally(currentPlayer);
                    resetGame();
                }, 1000); // Delay before resetting 
            } else if (checkForTie()) {
                alert("It's a draw! No points awarded.");
                resetGame();
            } else {
                // Switch player
                currentPlayer = currentPlayer === "X" ? "O" : "X";
                document.getElementById('currentTurn').textContent = `${currentPlayer === "X" ? player1Name : player2Name}'s Turn`;
            }
        }
    }
    
    function announceWinner() {
        alert(`${currentPlayer} wins!`);
        
        // Change background color of winning cells to goldenrod
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                if (checkForWin(i, j)) {
                    cell.style.backgroundColor = "goldenrod";
                }
            }
        }
    }
    
    
    function checkForWin(row, col) {
        // Check horizontally
        if (gameBoard[row].every((cell) => cell === currentPlayer)) {
            return true;
        }

        // Check vertically
        if (gameBoard.every((r) => r[col] === currentPlayer)) {
            return true;
        }

        // Check diagonally from top-left to bottom-right
        if (row === col && gameBoard.every((r, i) => r[i] === currentPlayer)) {
            return true;
        }

        // Check diagonally from top-right to bottom-left
        if (row + col === rows - 1 && gameBoard.every((r, i) => r[cols - 1 - i] === currentPlayer)) {
            return true;
        }

        // Check other diagonals
        let diagonal1 = [];
        let diagonal2 = [];

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (i + j === row + col) {
                    diagonal1.push(gameBoard[i][j]);
                }
                if (i - j === row - col) {
                    diagonal2.push(gameBoard[i][j]);
                }
            }
        }

        if (diagonal1.length > 1 && diagonal1.every((cell) => cell === currentPlayer)) {
            return true;
        }

        if (diagonal2.length > 1 && diagonal2.every((cell) => cell === currentPlayer)) {
            return true;
        }

        return false;
    }

    function checkForTie() {
        return gameBoard.every((row) => row.every((cell) => cell !== ""));
    }

    function updateWinTally(player) {
        if (player === "X") {
            playerXTally++;
            playerXWinsDisplay.textContent = `${player1Name} Wins: ${playerXTally}`;
        } else if (player === "O") {
            playerOTally++;
            playerOWinsDisplay.textContent = `${player2Name} Wins: ${playerOTally}`;
        }
    
        // Check if the game is over
        if (playerXTally === 5 || playerOTally === 5) {
            alert(`${player === "X" ? player1Name : player2Name} is the overall winner! Game Over!`);
            resetGame();
    
            // Redirect to index.html
            window.location.href = "index.html";
        }
    }
    

    function resetGame() {
        // Clear the board
        gameBoard = Array.from({ length: rows }, () => Array(cols).fill(""));
        document.querySelectorAll(".cell").forEach((cell) => {
            cell.textContent = "";
            cell.style.backgroundColor = ""; // Reset background color
        });

        // Reset player turn
        currentPlayer = "X";
    }

    // Add event listener for the reset button
    resetButton.addEventListener("click", function () {
        playerXTally = 0;
        playerOTally = 0;
    
        playerXWinsDisplay.textContent = "Player X Wins: 0";
        playerOWinsDisplay.textContent = "Player O Wins: 0";
        currentTurn.textContent = "";
        resetGame();
    
        // Clear input fields
        document.getElementById('player1Name').value = '';
        document.getElementById('player2Name').value = '';
    });
    
});
