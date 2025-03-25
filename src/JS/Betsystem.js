// This script sends the player's bet and wallet public key to the server

document.getElementById('place-bet').addEventListener('click', function () {
    // Retrieve the player's wallet public key from localStorage
    const publicKey = localStorage.getItem('walletAddress');
    
    // Get the bet amount from the input field and parse it as a number
    const betAmount = parseFloat(document.getElementById('bet-amount').value);
    
    // Basic validation
    if (!publicKey) {
      alert('Wallet not connected. Please login first.');
      return;
    }
    if (isNaN(betAmount) || betAmount <= 0) {
      alert('Please enter a valid bet amount.');
      return;
    }
    
    // Create the payload to send to the server
    const payload = {
      publicKey,
      betAmount
    };
    
    // Send the bet to the server using a POST request
    fetch('http://localhost:3000/bet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Bet recorded:', data);
      })
      .catch(error => {
        console.error('Error sending bet:', error);
      });
  });
  