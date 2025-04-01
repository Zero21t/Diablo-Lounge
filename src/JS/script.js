let isSpinning = false;
let currentRotation = 0;
let userBet = null;
let userChips = 5000;

const totalNumbers = 37;// NUmbers 0 to 36
const angleStepDeg = 360 / totalNumbers;   
const angleStepRad = angleStepDeg * (Math.PI / 180);

window.onload = function () {
  wheel();
};

function wheel() {
  const canvas = document.getElementById("rouletteWheel");
  const ctx = canvas.getContext("2d");
  const radius = canvas.width / 2;
  const centerX = radius;
  const centerY = radius;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (let i = 0; i < totalNumbers; i++) {
    const centerAngleDeg = -90 + i * angleStepDeg;
    const centerAngleRad = centerAngleDeg * (Math.PI / 180);
    const startAngle = centerAngleRad - angleStepRad / 2;
    const endAngle = centerAngleRad + angleStepRad / 2;
    
    let fillColor = "#008000"; // green for 0
    if (i !== 0) {
      fillColor = (i % 2 === 0) ? "#000000" : "#FF0000";
    }
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
}

function chooseBet(color) {
  userBet = color;
  document.getElementById("bet").textContent = `Your Bet: ${color.charAt(0).toUpperCase() + color.slice(1)}`;
}

// Spin the wheel and evaluate the bet
function spinWheel() {
  if (isSpinning) return;
  if (userBet === null) {
    alert("Please choose Red or Black before spinning!");
    return;
  }
  
  const betAmountInput = document.getElementById("bet-amount");
  const betAmount = parseInt(betAmountInput.value);
  if (!betAmount || betAmount < 1 || betAmount > userChips) {
    alert("Enter a valid bet amount!");
    return;
  }
  
  // Deducts wager amount
  userChips -= betAmount;
  document.getElementById("chips").textContent = `Chips: ${userChips}`;
  isSpinning = true;
  
  const randomIndex = Math.floor(Math.random() * totalNumbers);
  
  const fullSpins = 6;
  const extraRotation = fullSpins * 360 - (randomIndex * angleStepDeg);
  currentRotation += extraRotation;
  
  const wheel = document.getElementById("rouletteWheel");
  
  wheel.classList.add("spinning");
  
  wheel.style.transition = "transform 3s ease-out";
  wheel.style.transform = `rotate(${currentRotation}deg)`;
  
  setTimeout(() => {
    // Removes the spinning effect after the spin is done
    wheel.classList.remove("spinning");
    
    // Determines the winning color.
    let winningColor = null;
    if (randomIndex === 0) {
      winningColor = 'green';
    } else if (randomIndex % 2 === 0) {
      winningColor = 'black';
    } else {
      winningColor = 'red';
    }
    
    let resultText = "";
    if (winningColor === userBet) {
      if (winningColor === 'green') {
        resultText = `You won! The wheel landed on GREEN. You win ${betAmount * 5} chips!`;
        userChips += betAmount * 5; // 5x multiplier for green
      } else {
        resultText = `You won! The wheel landed on ${winningColor.toUpperCase()}. You win ${betAmount * 2} chips!`;
        userChips += betAmount * 2; // 2x multiplier for red or black
      }
    } else {
      resultText = `You lost! The wheel landed on ${winningColor.toUpperCase()}. You lose ${betAmount} chips.`;
    }
    
    document.getElementById("result").textContent = resultText;
    document.getElementById("chips").textContent = `Chips: ${userChips}`;
    userBet = null;
    document.getElementById("bet").textContent = "Your Bet: None";
    betAmountInput.value = "";
    isSpinning = false;
  }, 3000);
}
