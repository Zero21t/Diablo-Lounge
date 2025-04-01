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
let gameRunning = false;    
let multiplier = 1;         
let crashPoint;             
let playerBet = 0;          
let accountBalance = 0;     
let totalEarnings = 0;      
let cashedOut = false;      
let animationId;            


//setBalance Function that adds funds and starts the game
async function setBalance() {
    const walletAddress = window.getWalletAddress();
    if (!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }

    // Retrieve wallet balance from localStorage (set during wallet connection)
    const walletBalance = parseFloat(localStorage.getItem("tokenBalance") || "0");
    if (walletBalance > 0) {
      accountBalance += walletBalance;
      accountBalanceDisplay.textContent = accountBalance.toFixed(2);

      // Hide the add funds panel and show the game controls
      balanceSection.style.display = "none";
      controlsSection.style.display = "block";
     
      // Change the background to a stars image for the game view
      gameContainer.style.background = "url('/src/Images/Stars.gif') no-repeat center center";
      gameContainer.style.backgroundSize = "cover";
    } else {
      alert("Wallet balance is zero or not available!");
    }
  }
  

// resetFunds Function Resets the game and returns UI to add funds view.
function resetFundsUI() {
  resetGame(); // Reset game variables and stop animation
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

  // Hide game controls and show add funds panel
  controlsSection.style.display = "none";
  balanceSection.style.display = "block";
  document.getElementById("initialBalance").value = "";
  multiplierDisplay.textContent = "1.00x";

  // Revert background to the default image
  gameContainer.style.background = "url('/src/Images/Background.png') no-repeat center center";
  gameContainer.style.backgroundSize = "cover";
}

// starts the game by setting game variables and starting the update loop.
function startGame() {
  gameRunning = true;
  multiplier = 1;
  cashedOut = false;
  crashPoint = determineCrashPoint(); // Set a random crash point
  updateGame(); // Start the game loop
}

// Returns a random multiplier value when the rocket will crash.
function determineCrashPoint() {
  // 55% chance for crash between 1x and 3x, 45% for 3x to 50x
  if (Math.random() < 0.55) {
    return Math.random() * (3 - 1) + 1;
  } else {
    return Math.random() * (50 - 3) + 3;
  }
}

// Handles the bet placement and starts the game if funds are sufficient.
function placeBet() {
  // Only allow placing a bet if game is not already running
  if (!gameRunning) {
    playerBet = parseFloat(document.getElementById("betAmount").value);
    if (playerBet > 0 && playerBet <= accountBalance) {
      // Deduct bet amount from account balance
      accountBalance -= playerBet;
      accountBalanceDisplay.textContent = accountBalance.toFixed(2);
      startGame(); 
    } else {
      alert("Insufficient funds, please add funds to continue");
    }
  }
}

// Allows the player to cash out, calculates winnings, and stops the game.
function cashOut() {
  if (gameRunning && !cashedOut) {
    let payout = playerBet * multiplier; 
    let netProfit = payout - playerBet;   
    totalEarnings += netProfit;
    accountBalance += payout;
    cashedOut = true;
    updateEarnings(); // Update displayed balances
    alert("Cashed out at " + multiplier.toFixed(2) + "x! Net profit: $" + netProfit.toFixed(2));
    localStorage.setItem("tokenBalance", accountBalance.toFixed(2));

    gameRunning = false;
    cancelAnimationFrame(animationId);
    setTimeout(function() {
     resetGame();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 1000);
  }
}

// Purpose: updateGame function that increases multiplier and redraws the rocket.
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
      // If the player did not cash out subtract the bet from earnings
      totalEarnings -= playerBet;
      updateEarnings();
    }
    // Stop the game loop and show explosion
    cancelAnimationFrame(animationId);
    drawExplosion();

    // alert the crash and reset the game
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

//Clear the canvas and draws the rocket at original position with updated position and size.
function drawGame() {
  // Clear previous drawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Calculate rocket position based on multiplier
  let x = (multiplier / 50) * canvas.width;
  let y = canvas.height - (multiplier / 50) * canvas.height;

  // Calculate and decrease rocket size by 5% every 5x multiplier
  const baseRocketSize = 95;
  let scaleFactor = Math.pow(0.95, Math.floor(multiplier / 5));
  let rocketWidth = baseRocketSize * scaleFactor;
  let rocketHeight = baseRocketSize * scaleFactor;

  // Draw the rocket image on the canvas
  ctx.drawImage(rocketImg, x - rocketWidth / 2, y - rocketHeight / 2, rocketWidth, rocketHeight);
}


//At crash position Clear the canvas and draw the explosion image with the same size as the rocket.
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

//Resets game variables and stops any ongoing animation.
function resetGame() {
  gameRunning = false;
  playerBet = 0;
  cancelAnimationFrame(animationId);
}

// Update the displayed earnings and account balance.
function updateEarnings() {
  totalEarningsDisplay.textContent = totalEarnings.toFixed(2);
  accountBalanceDisplay.textContent = accountBalance.toFixed(2);
  localStorage.setItem("tokenBalance", accountBalance.toFixed(2));
}
