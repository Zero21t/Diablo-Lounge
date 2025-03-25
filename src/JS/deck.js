const suits = ["hearts", "diamonds", "clubs", "spades"];
const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

let deck = [];
let playerHand = [];
let dealerHand = [];
let playerBalance = window.getTokenBalance(); 
let currentBet = 0;
let gameOver = false;

function initializeDeck() {
  deck = suits.flatMap(suit =>
    values.map(value => ({
      value,
      image: `images/${value}_of_${suit}.png`
    }))
  );
}

function drawCard() {
  return deck.length ? deck.splice(Math.floor(Math.random() * deck.length), 1)[0] : null;
}

function shuffle() {
  initializeDeck();
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function updatePlayerHandValue() {
  const playerTotal = getHandValue(playerHand);
  document.getElementById("player-hand-value").innerText = `Hand Value: ${playerTotal}`;
}

function displayHand(hand, elementId, hideFirst = false) {
  const element = document.getElementById(elementId);
  element.innerHTML = "";
  hand.forEach((card, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    const imgSrc = hideFirst && index === 0 ? "images/back_of_card.png" : card.image;
    cardDiv.innerHTML = `<img src="${imgSrc}" alt="${card.value}" width="100" height="150">`;
    element.appendChild(cardDiv);
  });

  if (elementId === "player-cards") {
    updatePlayerHandValue();
  }
}

function dealInitialCards() {
  playerHand = [drawCard(), drawCard()];
  dealerHand = [drawCard(), drawCard()];
  displayHand(playerHand, "player-cards");
  displayHand(dealerHand, "dealer-cards", true);
  checkForBlackjack();
}

function revealDealerCard() {
  displayHand(dealerHand, "dealer-cards", false);
}

function getHandValue(hand) {
  let total = 0;
  let aceCount = 0;
  hand.forEach(card => {
    if (["J", "Q", "K"].includes(card.value)) {
      total += 10;
    } else if (card.value === "A") {
      aceCount++;
      total += 11;
    } else {
      total += parseInt(card.value, 10);
    }
  });
  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount--;
  }
  return total;
}

function checkForBlackjack() {
  const playerTotal = getHandValue(playerHand);
  const dealerTotal = getHandValue(dealerHand);
  if (playerTotal === 21) {
    if (dealerTotal === 21) {
      endGame("Both got Blackjack! It's a tie!");
    } else {
      updateBalance(currentBet * 2.5);
      endGame("Blackjack! You win 3:2 payout!");
    }
  }
}

function checkPlayerBust() {
  if (getHandValue(playerHand) > 21) {
    endGame("Player busts! Dealer wins.");
  }
}

function dealerPlay() {
  if (gameOver) return;
  revealDealerCard();
  let dealerTotal = getHandValue(dealerHand);
  while (dealerTotal < 17) {
    dealerHand.push(drawCard());
    displayHand(dealerHand, "dealer-cards", false);
    dealerTotal = getHandValue(dealerHand);
  }
  determineWinner();
}

function determineWinner() {
  const playerTotal = getHandValue(playerHand);
  const dealerTotal = getHandValue(dealerHand);
  if (dealerTotal > 21) {
    updateBalance(currentBet * 2);
    endGame("Dealer busts! Player wins!");
  } else if (playerTotal > dealerTotal) {
    updateBalance(currentBet * 2);
    endGame("Player wins!");
  } else if (playerTotal < dealerTotal) {
    updateBalance(0);
    endGame("Dealer wins!");
  } else {
    updateBalance(currentBet);
    endGame("It's a tie! Your bet is returned.");
  }
}

function endGame(message) {
  document.getElementById("win-message").innerText = message;
  gameOver = true;
  document.getElementById("hit").disabled = true;
  document.getElementById("call").disabled = true;
}

function resetGame() {
  gameOver = false;
  document.getElementById("win-message").innerText = "";
  document.getElementById("hit").disabled = true;
  document.getElementById("call").disabled = true;
  document.getElementById("place-bet").disabled = false;
  document.getElementById("dealer-cards").innerHTML = "";
  document.getElementById("player-cards").innerHTML = "";
  shuffle();
}

function updateBalance(amount) {
  playerBalance += amount;
  document.getElementById("balance").innerText = `$${playerBalance.toFixed(2)}`;
  localStorage.setItem("tokenBalance", playerBalance.toFixed(2)); 
}

document.getElementById("place-bet").disabled = true;

document.getElementById("place-bet").addEventListener("click", () => {
  const betInput = document.getElementById("bet-amount");
  const bet = parseInt(betInput.value, 10);
  if (bet >= 10 && bet <= 500 && bet <= playerBalance) {
    currentBet = bet;
    playerBalance -= bet;
    document.getElementById("balance").innerText = `$${playerBalance}`;
    document.getElementById("hit").disabled = false;
    document.getElementById("call").disabled = false;
    document.getElementById("place-bet").disabled = true;
    dealInitialCards();
  } else {
    alert("Invalid bet. Must be between $10 and $500 and within your balance.");
  }
});

document.getElementById("reset").addEventListener("click", resetGame);

document.getElementById("hit").addEventListener("click", () => {
  if (gameOver) return;
  playerHand.push(drawCard());
  displayHand(playerHand, "player-cards");
  checkPlayerBust();
});

document.getElementById("call").addEventListener("click", () => {
  if (gameOver) return;
  dealerPlay();
});

window.onload = () => {
  shuffle();
  resetGame();
  playerBalance = window.getTokenBalance(); // Retrieves the wallet balance from localStorage
  document.getElementById("balance").innerText = `$${playerBalance.toFixed(2)}`;
};

