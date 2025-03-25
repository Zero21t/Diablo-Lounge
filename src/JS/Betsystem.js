document.addEventListener("DOMContentLoaded", () => {
  // Ensure splToken is available
  const splToken = window.splToken; 
  // solanaWeb3 should already be available as well if loaded from a script tag
  const placeBetButton = document.getElementById("place-bet");

  placeBetButton.addEventListener("click", async () => {
    if (!window.solana || !window.solana.publicKey) {
      alert("Wallet not connected. Please login first.");
      return;
    }
    const playerPubKey = window.solana.publicKey;
    const walletPublicKey = playerPubKey.toBase58();

    const betAmountInput = document.getElementById("bet-amount");
    const betAmount = parseFloat(betAmountInput.value);
    if (isNaN(betAmount) || betAmount <= 0) {
      alert("Please enter a valid bet amount.");
      return;
    }

    try {
      // Delegate approval
      const delegateSig = await approveDelegate(betAmount);
      console.log("Delegate approved, signature:", delegateSig);

      // Send bet details to server
      const payload = { publicKey: walletPublicKey, betAmount };
      const response = await fetch("http://localhost:3000/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      console.log("Bet recorded:", result);
    } catch (err) {
      console.error("Error during delegation or bet:", err);
    }
  });

  async function approveDelegate(amount) {
    // Create connection to devnet
    const connection = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl("devnet"),
      "confirmed"
    );

    // Vault public key (hardcoded here)
    const vaultPubKey = new solanaWeb3.PublicKey("HBTeod3CEPvAoAbqdP66v7r1TsjPiyhzPfjTP6e9Peay");
    // Token mint address
    const tokenMintAddress = new solanaWeb3.PublicKey("mntx96ePfermX8Nzt95osYHdQmyjNPbE6seiUfLqpti");

    const playerPubKey = window.solana.publicKey;
    // Derive player's associated token account for this token
    const playerTokenAccount = await splToken.getAssociatedTokenAddress(
      splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
      splToken.TOKEN_PROGRAM_ID,
      tokenMintAddress,
      playerPubKey
    );

    // Create the approval instruction
    const approveIx = splToken.createApproveInstruction(
      playerTokenAccount, // player's token account
      vaultPubKey,        // delegate: vault public key
      playerPubKey,       // owner: player's wallet public key
      amount,             // allowed amount (in smallest units)
      [],
      splToken.TOKEN_PROGRAM_ID
    );

    const transaction = new solanaWeb3.Transaction().add(approveIx);
    transaction.feePayer = playerPubKey;
    const { blockhash } = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;

    // Ask Phantom to sign the transaction
    const signedTransaction = await window.solana.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    await connection.confirmTransaction(signature);
    return signature;
  }
});
