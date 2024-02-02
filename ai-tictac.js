document.addEventListener("DOMContentLoaded", function () {
    const board = document.getElementById("game-board");
    const resetButton = document.getElementById("resetButton");
    const playerXWinsDisplay = document.getElementById("playerXWins");
    const playerOWinsDisplay = document.getElementById("playerOWins");
    const difficultySelect = document.getElementById("difficulty");
    const rows = 5;
    const cols = 6;

    let currentPlayer = "X";
    let gameBoard = Array.from({ length: rows }, () => Array(cols).fill(""));
    let playerXTally = 0;
    let playerOTally = 0;
    let player1Name, player2Name; // Declare variables for player names
    let aiDifficulty;

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

    // Adds event listener for the "START GAME" button
    const playButton = document.getElementById("play");
    playButton.addEventListener("click", function () {
        player1Name = document.getElementById('player1Name').value || "Player 1";
        player2Name = "AI";

        // Sets the initial player names
        playerXWinsDisplay.textContent = `${player1Name} Wins: 0`;
        playerOWinsDisplay.textContent = `${player2Name} Wins: 0`;
        document.getElementById('currentTurn').textContent = `${player1Name}'s Turn`;

        document.getElementById('hiddenElements').style.display = 'block';

        // Enables human player after showing elements
        enableHumanPlayer();

        // Gets the selected AI difficulty
        aiDifficulty = difficultySelect.value;
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
                    if (currentPlayer === "X") {
                        alert(`${player1Name} wins!`);
                        updateWinTally(currentPlayer);
                    } else {
                        alert(`${player2Name} wins!`);
                        updateWinTally(currentPlayer);
                    }
                    resetGame();
                }, 1000); // Delay before resetting 
            } else if (checkForTie()) {
                alert("It's a draw! No points awarded.");
                resetGame();
            } else {
                // Switch player
                currentPlayer = currentPlayer === "X" ? "O" : "X";
                document.getElementById('currentTurn').textContent = `${currentPlayer === "X" ? player1Name : player2Name}'s Turn`;
    
                // If the current player is AI, let the AI make a move
                if (currentPlayer === "O") {
                    setTimeout(makeAIMove, 500); // Delay
                }
            }
        }
    }
    
    function announceWinner() {
        // Change background color to goldenrod for the winning cells
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                if (checkForWin(i, j)) {
                    cell.style.backgroundColor = "goldenrod";
                }
            }
        }
    }
    
    function makeAIMove() {
        // Implements AI logic based on the selected difficulty
        const availableCells = [];
    
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (gameBoard[i][j] === "") {
                    availableCells.push({ row: i, col: j });
                }
            }
        }
    
        if (availableCells.length > 0) {
            let aiMove;
    
            if (aiDifficulty === "easy") {
                // Easy: Random move
                aiMove = getRandomMove(availableCells);
            } else if (aiDifficulty === "difficult") {
                // Difficult: Random move for 60%, Winning move for 40%
                aiMove = getSmartMove(availableCells, 60);
            } else if (aiDifficulty === "extreme") {
                // Extreme: Winning move for 60%, Blocking move for 30%, Random move for 10%
                aiMove = getSmartMove(availableCells, 90);
            }
    
            gameBoard[aiMove.row][aiMove.col] = "O";
            const cell = document.querySelector(`.cell[data-row="${aiMove.row}"][data-col="${aiMove.col}"]`);
            cell.textContent = "O";
            cell.style.color = "blue"; // Set the text color to blue
    
            if (checkForWin(aiMove.row, aiMove.col) || checkForTie()) {
                announceWinner(); // Highlight the winning cells
                setTimeout(() => {
                    alert(`${player2Name} wins!`);
                    updateWinTally(player2Name);
                    resetGame();
                }, 1000); // Delay before resetting
            } else {
                // Switch player
                currentPlayer = "X";
                document.getElementById('currentTurn').textContent = `${player1Name}'s Turn`;
            }
        }
    }
    
    

    function getRandomMove(availableCells) {
        const randomIndex = Math.floor(Math.random() * availableCells.length);
        return availableCells[randomIndex];
    }

    function getSmartMove(availableCells, winningPercentage) {
        const randomPercentage = Math.random() * 100;
    
        if (randomPercentage < winningPercentage) {
            // Winning move or block opponent's winning move
            for (const cell of availableCells) {
                const tempBoard = JSON.parse(JSON.stringify(gameBoard));
    
                // Check for winning move for AI
                tempBoard[cell.row][cell.col] = "O";
                if (checkForWin(cell.row, cell.col)) {
                    return cell;
                }
    
                // Check for potential winning move for the opponent (block)
                tempBoard[cell.row][cell.col] = "X";
                if (checkForWin(cell.row, cell.col)) {
                    return cell;
                }
    
                // Check for player's potential win with 4 cells horizontally
                if (checkPotentialWin(tempBoard, cell.row, cell.col, "X", 4)) {
                    return cell;
                }
    
                // Check for player's potential win with 5 cells vertically
                if (checkPotentialWin(tempBoard, cell.row, cell.col, "X", 5, true)) {
                    return cell;
                }
            }
        }
    
        // Advanced moves for "difficult" and "extreme" levels
        if (aiDifficulty === "difficult" || aiDifficulty === "extreme") {
            // Prioritize center move if available
            const centerMove = availableCells.find(cell => cell.row === Math.floor(rows / 2) && cell.col === Math.floor(cols / 2));
            if (centerMove) {
                return centerMove;
            }
    
            // Prioritize corners if center is not available
            const cornerMoves = availableCells.filter(cell => (cell.row === 0 || cell.row === rows - 1) && (cell.col === 0 || cell.col === cols - 1));
            if (cornerMoves.length > 0) {
                return getRandomMove(cornerMoves);
            }
        }
    
        // Random move: If not a winning move or an advanced move, choose randomly
        return getRandomMove(availableCells);
    }
    
    function checkPotentialWin(board, row, col, player, count, vertical = false) {
        const checkDirection = (r, c, rChange, cChange) => {
            let consecutiveCount = 0;
    
            while (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === player) {
                consecutiveCount++;
                r += rChange;
                c += cChange;
            }
    
            return consecutiveCount;
        };
    
        const horizontalCount = checkDirection(row, col, 0, 1) + checkDirection(row, col, 0, -1) - 1;
        const verticalCount = checkDirection(row, col, 1, 0) + checkDirection(row, col, -1, 0) - 1;
        const diagonal1Count = checkDirection(row, col, 1, 1) + checkDirection(row, col, -1, -1) - 1;
        const diagonal2Count = checkDirection(row, col, 1, -1) + checkDirection(row, col, -1, 1) - 1;
    
        return (horizontalCount >= count) || (vertical && verticalCount >= count) ||
            (diagonal1Count >= count) || (diagonal2Count >= count);
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
        } else {
            playerOTally++;  // increment for player 2 (AI)
        }
    
        // Updates the tally display with the correct player names
        playerXWinsDisplay.textContent = `${player1Name} Wins: ${playerXTally}`;
        playerOWinsDisplay.textContent = `${player2Name} Wins: ${playerOTally}`;


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

    resetButton.addEventListener("click", function () {
        playerXTally = 0;
        playerOTally = 0;
        playerXWinsDisplay.textContent = `${player1Name} Wins: 0`;
        playerOWinsDisplay.textContent = `${player2Name} Wins: 0`;
        document.getElementById('currentTurn').textContent = '';

        resetGame();
        // Clear input field for Player 1
        document.getElementById('player1Name').value = '';
    });

});
