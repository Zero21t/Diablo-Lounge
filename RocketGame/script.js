const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameContainer = document.getElementById("gameContainer");
const balanceSection = document.getElementById("balance-section");
const controlsSection = document.getElementById("controls");

/* Load the rocket image */
const rocketImg = new Image();
rocketImg.src = 'Rocket.png'; // Ensure 'Rocket.png' is in the correct folder/path

const multiplierDisplay = document.getElementById("multiplier");
const accountBalanceDisplay = document.getElementById("accountBalance");
const totalEarningsDisplay = document.getElementById("totalEarnings");

let gameRunning = false;
let multiplier = 1;
let crashPoint;
let playerBet = 0;
let accountBalance = 0;
let totalEarnings = 0;
let cashedOut = false;
let animationId;

/* Adds funds, hides the add-funds panel, shows the controls below, 
   and switches container background to Stars.gif for the game */
function setBalance() {
  let inputBalance = parseFloat(document.getElementById("initialBalance").value);
  if (inputBalance > 0) {
    accountBalance += inputBalance;
    accountBalanceDisplay.textContent = accountBalance.toFixed(2);

    balanceSection.style.display = "none";
    controlsSection.style.display = "block";
    // Switch container background to Stars.gif for the game
    gameContainer.style.background = "url('Stars.gif') no-repeat center center";
    gameContainer.style.backgroundSize = "cover";
  } else {
    alert("Enter a valid starting balance!");
  }
}

// Resets the game logic/UI, reverts container background to Background.png
function resetFundsUI() {
  resetGame();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  controlsSection.style.display = "none";
  balanceSection.style.display = "block";
  document.getElementById("initialBalance").value = "";
  multiplierDisplay.textContent = "1.00x";

  // Revert container background to the original background
  gameContainer.style.background = "url('Background.png') no-repeat center center";
  gameContainer.style.backgroundSize = "cover";
}

function startGame() {
  gameRunning = true;
  multiplier = 1;
  cashedOut = false;
  crashPoint = determineCrashPoint();
  updateGame();
}

// 55% chance to crash between 1x and 3x, 50% chance between 3x and 50x
function determineCrashPoint() {
  if (Math.random() < 0.55) {
    return Math.random() * (3 - 1) + 1;
  } else {
    return Math.random() * (50 - 3) + 3;
  }
}

function placeBet() {
  if (!gameRunning) {
    playerBet = parseFloat(document.getElementById("betAmount").value);
    if (playerBet > 0 && playerBet <= accountBalance) {
      accountBalance -= playerBet;
      accountBalanceDisplay.textContent = accountBalance.toFixed(2);
      startGame();
    } else {
      alert("Insufficient funds, please add funds to continue");
    }
  }
}

function cashOut() {
  if (gameRunning && !cashedOut) {
    let payout = playerBet * multiplier;
    let netProfit = payout - playerBet;
    totalEarnings += netProfit;
    accountBalance += payout;
    cashedOut = true;
    updateEarnings();
    alert("Cashed out at " + multiplier.toFixed(2) + "x! Net profit: $" + netProfit.toFixed(2));
  }
}

function updateGame() {
  if (!gameRunning) return;

  // Speed factor: base increment scaled by 1.35 every 5x
  const baseIncrement = 0.002;
  const speedFactor = Math.pow(1.35, Math.floor(multiplier / 5));
  multiplier += baseIncrement * speedFactor;

  multiplierDisplay.textContent = multiplier.toFixed(2) + "x";
  drawGame();

  if (multiplier >= crashPoint) {
    if (!cashedOut) {
      totalEarnings -= playerBet;
      updateEarnings();
    }
    alert("CRASH! The rocket exploded at " + multiplier.toFixed(2) + "x");
    resetGame();
  } else {
    animationId = requestAnimationFrame(updateGame);
  }
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let x = (multiplier / 50) * canvas.width;
  let y = canvas.height - (multiplier / 50) * canvas.height;

  // Base rocket size is 95; decrease size by 5% every 5x multiplier increase
  const baseRocketSize = 95;
  let scaleFactor = Math.pow(0.95, Math.floor(multiplier / 5));
  let rocketWidth = baseRocketSize * scaleFactor;
  let rocketHeight = baseRocketSize * scaleFactor;

  ctx.drawImage(rocketImg, x - rocketWidth / 2, y - rocketHeight / 2, rocketWidth, rocketHeight);
}

function resetGame() {
  gameRunning = false;
  playerBet = 0;
  cancelAnimationFrame(animationId);
}

function updateEarnings() {
  totalEarningsDisplay.textContent = totalEarnings.toFixed(2);
  accountBalanceDisplay.textContent = accountBalance.toFixed(2);
}
