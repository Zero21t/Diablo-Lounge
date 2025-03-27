document.addEventListener("DOMContentLoaded", async () => {
  // Auto-reconnect if wallet is available but not connected
  if (window.solana && !window.solana.publicKey) {
    try {
      const response = await window.solana.connect({ onlyIfTrusted: true });
      console.log("Auto-reconnected in Betsystem.js:", response.publicKey.toBase58());
    } catch (err) {
      console.error("Auto reconnect failed in Betsystem.js:", err);
    }
  }

  const placeBetButton = document.getElementById("place-bet");

  placeBetButton.addEventListener("click", async () => {
    // Ensure wallet is connected; if not, attempt to connect.
    if (!window.solana || !window.solana.publicKey) {
      try {
        const response = await window.solana.connect();
        console.log("Connected via manual click:", response.publicKey.toBase58());
      } catch (err) {
        alert("Wallet not connected. Please login first.");
        return;
      }
    }

    const playerPubKey = window.solana.publicKey;
    const walletPublicKey = playerPubKey.toBase58();

    const betAmountInput = document.getElementById("bet-amount");
    let betAmount = parseFloat(betAmountInput.value);
    if (isNaN(betAmount) || betAmount <= 0) {
      alert("Please enter a valid bet amount.");
      return;
    }

    try {
      // Create a delegate approval message with delegator set to the wallet public key.
      const delegateApprovalMessage = { delegator: walletPublicKey };
      const encodedMessage = new TextEncoder().encode(JSON.stringify(delegateApprovalMessage));

      // Ask Phantom to sign the message.
      const signedMessage = await window.solana.signMessage(encodedMessage);
      const signatureArray = signedMessage.signature;

      // Convert the Uint8Array signature to a base64 string.
      let binary = '';
      for (let i = 0; i < signatureArray.byteLength; i++) {
        binary += String.fromCharCode(signatureArray[i]);
      }
      const signatureBase64 = btoa(binary);

      // Build the payload with the delegate approval details.
      const payload = { 
        publicKey: walletPublicKey, 
        betAmount, 
        delegateApproval: {
          message: delegateApprovalMessage,
          signature: signatureBase64
        }
      };

      const response = await fetch("http://localhost:3000/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      console.log("Bet recorded:", result);
    } catch (err) {
      console.error("Error sending bet request:", err);
    }
  });
});
