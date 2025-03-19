// Get references to HTML elements
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameContainer = document.getElementById("gameContainer");
const balanceSection = document.getElementById("balance-section");
const controlsSection = document.getElementById("controls");

// Load images for the rocket and explosion
const rocketImg = new Image();
rocketImg.src = '/src/Images/Rocket.png'; // Rocket image

const explodeImg = new Image();
explodeImg.src = '/src/Images/Explode.png'; // Explosion image

// Get references for displaying game information
const multiplierDisplay = document.getElementById("multiplier");
const accountBalanceDisplay = document.getElementById("accountBalance");
const totalEarningsDisplay = document.getElementById("totalEarnings");

// Initialize game variables
let gameRunning = false;    // Is the game running?
let multiplier = 1;         // Current multiplier value
let crashPoint;             // Multiplier value at which the rocket crashes
let playerBet = 0;          // Amount bet by the player
let accountBalance = 0;     // Player's account balance
let totalEarnings = 0;      // Total winnings (net)
let cashedOut = false;      // Has the player cashed out?
let animationId;            // ID for the animation frame

// *******************************
// Function: setBalance
// Purpose: Adds funds and starts the game UI.
// *******************************
function setBalance() {
  // Read and convert the input balance to a number
  let inputBalance = parseFloat(document.getElementById("initialBalance").value);
  if (inputBalance > 0) {
    // Update account balance
    accountBalance += inputBalance;
    accountBalanceDisplay.textContent = accountBalance.toFixed(2);

    // Hide the add funds panel and show the game controls
    balanceSection.style.display = "none";
    controlsSection.style.display = "block";
    
    // Change the background to a stars image for the game view
    gameContainer.style.background = "url('/src/Images/Stars.gif') no-repeat center center";
    gameContainer.style.backgroundSize = "cover";
  } else {
    alert("Enter a valid starting balance!");
  }
}

// *******************************
// Function: resetFundsUI
// Purpose: Resets the game and returns UI to add funds view.
// *******************************
function resetFundsUI() {
  resetGame(); // Reset game variables and stop animation
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

  // Hide game controls and show add funds panel
  controlsSection.style.display = "none";
  balanceSection.style.display = "block";
  document.getElementById("initialBalance").value = "";
  multiplierDisplay.textContent = "1.00x";

  // Revert background to the default image
  gameContainer.style.background = "url('/src/Images/Background.png') no-repeat center center";
  gameContainer.style.backgroundSize = "cover";
}

// *******************************
// Function: startGame
// Purpose: Begins the game by setting game variables and starting the update loop.
// *******************************
function startGame() {
  gameRunning = true;
  multiplier = 1;
  cashedOut = false;
  crashPoint = determineCrashPoint(); // Set a random crash point
  updateGame(); // Start the game loop
}

// *******************************
// Function: determineCrashPoint
// Purpose: Returns a random multiplier value when the rocket will crash.
// *******************************
function determineCrashPoint() {
  // 55% chance for crash between 1x and 3x, 45% for 3x to 50x
  if (Math.random() < 0.55) {
    return Math.random() * (3 - 1) + 1;
  } else {
    return Math.random() * (50 - 3) + 3;
  }
}

// *******************************
// Function: placeBet
// Purpose: Handles the bet placement and starts the game if funds are sufficient.
// *******************************
function placeBet() {
  // Only allow placing a bet if game is not already running
  if (!gameRunning) {
    playerBet = parseFloat(document.getElementById("betAmount").value);
    if (playerBet > 0 && playerBet <= accountBalance) {
      // Deduct bet amount from account balance
      accountBalance -= playerBet;
      accountBalanceDisplay.textContent = accountBalance.toFixed(2);
      startGame(); // Start the game
    } else {
      alert("Insufficient funds, please add funds to continue");
    }
  }
}

// *******************************
// Function: cashOut
// Purpose: Allows the player to cash out, calculates winnings, and stops the game.
// *******************************
function cashOut() {
  if (gameRunning && !cashedOut) {
    let payout = playerBet * multiplier; // Total payout
    let netProfit = payout - playerBet;    // Net winnings
    totalEarnings += netProfit;
    accountBalance += payout;
    cashedOut = true;
    updateEarnings(); // Update displayed balances
    alert("Cashed out at " + multiplier.toFixed(2) + "x! Net profit: $" + netProfit.toFixed(2));
  }
}

// *******************************
// Function: updateGame
// Purpose: Main game loop that increases multiplier and redraws the rocket.
// *******************************
function updateGame() {
  if (!gameRunning) return; // Stop loop if game is not running

  // Increase the multiplier gradually
  const baseIncrement = 0.002;
  const speedFactor = Math.pow(1.35, Math.floor(multiplier / 5));
  multiplier += baseIncrement * speedFactor;
  multiplierDisplay.textContent = multiplier.toFixed(2) + "x";

  // Draw the rocket on the canvas
  drawGame();

  // Check if the rocket has reached the crash point
  if (multiplier >= crashPoint) {
    if (!cashedOut) {
      // If the player did not cash out, subtract the bet from earnings
      totalEarnings -= playerBet;
      updateEarnings();
    }
    // Stop the game loop and show explosion
    cancelAnimationFrame(animationId);
    drawExplosion();

    // After 1 second, alert the crash and reset the game
    setTimeout(function() {
      alert("CRASH! The rocket exploded at " + multiplier.toFixed(2) + "x");
      resetGame();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 1000);
  } else {
    // Continue the game loop
    animationId = requestAnimationFrame(updateGame);
  }
}

// *******************************
// Function: drawGame
// Purpose: Clears the canvas and draws the rocket with updated position and size.
// *******************************
function drawGame() {
  // Clear previous drawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Calculate rocket position based on multiplier
  let x = (multiplier / 50) * canvas.width;
  let y = canvas.height - (multiplier / 50) * canvas.height;

  // Calculate the rocket size (decreases by 5% every 5x multiplier)
  const baseRocketSize = 95;
  let scaleFactor = Math.pow(0.95, Math.floor(multiplier / 5));
  let rocketWidth = baseRocketSize * scaleFactor;
  let rocketHeight = baseRocketSize * scaleFactor;

  // Draw the rocket image on the canvas
  ctx.drawImage(rocketImg, x - rocketWidth / 2, y - rocketHeight / 2, rocketWidth, rocketHeight);
}

// *******************************
// Function: drawExplosion
// Purpose: Clears the canvas and draws the explosion image with the same size as the rocket.
// *******************************
function drawExplosion() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Calculate the same position and size as the rocket
  let x = (multiplier / 50) * canvas.width;
  let y = canvas.height - (multiplier / 50) * canvas.height;
  const baseRocketSize = 95;
  let scaleFactor = Math.pow(0.95, Math.floor(multiplier / 5));
  let imgWidth = baseRocketSize * scaleFactor;
  let imgHeight = baseRocketSize * scaleFactor;

  // Draw the explosion image
  ctx.drawImage(explodeImg, x - imgWidth / 2, y - imgHeight / 2, imgWidth, imgHeight);
}

// *******************************
// Function: resetGame
// Purpose: Resets game variables and stops any ongoing animation.
// *******************************
function resetGame() {
  gameRunning = false;
  playerBet = 0;
  cancelAnimationFrame(animationId);
}

// *******************************
// Function: updateEarnings
// Purpose: Updates the displayed earnings and account balance.
// *******************************
function updateEarnings() {
  totalEarningsDisplay.textContent = totalEarnings.toFixed(2);
  accountBalanceDisplay.textContent = accountBalance.toFixed(2);
}
