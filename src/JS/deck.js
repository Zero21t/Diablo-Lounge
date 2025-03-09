const suits = ["hearts", "diamonds", "clubs", "spades"];
const values = [
    "2", "3", "4", "5", "6", "7", "8", "9", "10",
    "J", "Q", "K", "A"
];

let deck = [];
let idCounter = 1;
let playerHand = [];
let dealerHand = [];

function initializeDeck() {
    deck = [];
    idCounter = 1;

    suits.forEach(suit => {
        values.forEach(value => {
            deck.push({
                id: idCounter++,
                value: `${value}_of_${suit}`,
                image: `images/${value}_of_${suit}.png`
            });
        });
    });
}

function drawCard() {
    if (deck.length === 0) {
        console.log("No more cards left in the deck!");
        return null;
    }

    const randomIndex = Math.floor(Math.random() * deck.length);
    return deck.splice(randomIndex, 1)[0]; // Removes and returns the drawn card
}

function shuffle() {
    initializeDeck(); // Reset the deck

    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap elements
    }
}

function displayHand(hand, elementId) {
    const handElement = document.getElementById(elementId);
    handElement.innerHTML = ""; // Clear previous cards
    hand.forEach(card => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card");
        cardDiv.innerHTML = `<img src="${card.image}" alt="${card.value}" width="50" height="70">`;
        handElement.appendChild(cardDiv);
    });
}

function dealInitialCards() {
    playerHand = [drawCard(), drawCard()];
    dealerHand = [drawCard(), drawCard()];
    displayHand(playerHand, "player-cards");
    displayHand(dealerHand, "dealer-cards");
}

document.getElementById("hit").addEventListener("click", () => {
    playerHand.push(drawCard());
    displayHand(playerHand, "player-cards");
});

document.getElementById("call").addEventListener("click", () => {
    // Implement logic for the "CALL" button (e.g., end the game, show scores, etc.)
    console.log("Game over or Call action triggered");
});

document.getElementById("split").addEventListener("click", () => {
    // Logic for split (e.g., split the player's hand into two)
    document.getElementById("split-hand").style.display = "block";
});

window.onload = () => {
    shuffle();
    dealInitialCards();
};