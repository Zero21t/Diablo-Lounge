// src/JS/Betsystem.js

import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from "https://esm.sh/@solana/spl-token@0.3.5";

document.addEventListener("DOMContentLoaded", async () => {
  // Attempt auto-reconnect if wallet is installed but not yet connected.
  if (window.solana && !window.solana.publicKey) {
    try {
      await window.solana.connect({ onlyIfTrusted: true });
      console.log("Auto-reconnected to Phantom.");
    } catch (err) {
      console.warn("Auto reconnect failed:", err);
    }
  }

  const placeBetButton = document.getElementById("place-bet");

  placeBetButton.addEventListener("click", async () => {
    // 1) Ensure the user’s Phantom wallet is connected.
    if (!window.solana || !window.solana.publicKey) {
      try {
        await window.solana.connect();
        console.log("Connected to Phantom:", window.solana.publicKey.toBase58());
      } catch (err) {
        alert("Wallet not connected. Please login first.");
        return;
      }
    }

    const playerPubKey = window.solana.publicKey;
    const walletPublicKey = playerPubKey.toBase58();

    // 2) Get the bet amount from the input field.
    const betAmountInput = document.getElementById("bet-amount");
    let betAmount = parseFloat(betAmountInput.value);
    if (isNaN(betAmount) || betAmount <= 0) {
      alert("Please enter a valid bet amount.");
      return;
    }

    try {
      // 3) Create a Solana connection to devnet.
      const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("devnet"));

      // 4) Define the token mint address (must match your Withdraw.js).
      const tokenMintAddress = new solanaWeb3.PublicKey(
        "mntx96ePfermX8Nzt95osYHdQmyjNPbE6seiUfLqpti"
      );

      // 5) Get the player's associated token account (ATA).
      const playerTokenAccount = await getAssociatedTokenAddress(
        tokenMintAddress,
        playerPubKey,
        false,
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID
      );

      // 6) Check if the player’s ATA actually exists on-chain; if not, create it.
      let transaction = new solanaWeb3.Transaction();
      const playerAtaInfo = await connection.getAccountInfo(playerTokenAccount);
      if (!playerAtaInfo) {
        const createPlayerAtaIx = createAssociatedTokenAccountInstruction(
          playerPubKey,         // payer
          playerTokenAccount,   // the ATA to create
          playerPubKey,         // owner of the new ATA
          tokenMintAddress,
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID
        );
        transaction.add(createPlayerAtaIx);
      }

      // 7) Define the vault’s public key (same as in your server’s vault wallet).
      const vaultPublicKey = new solanaWeb3.PublicKey(
        "dadUa3DRj79Fv4M6pNUExNjXaXZ8P8zCoC863zWvuPP"
      );

      // 8) Get the vault’s associated token account (ATA).
      const vaultTokenAccount = await getAssociatedTokenAddress(
        tokenMintAddress,
        vaultPublicKey,
        false,
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID
      );

      // 9) Check if the vault’s ATA exists on-chain; if not, create it (the player pays).
      const vaultAtaInfo = await connection.getAccountInfo(vaultTokenAccount);
      if (!vaultAtaInfo) {
        const createVaultAtaIx = createAssociatedTokenAccountInstruction(
          playerPubKey,       // payer
          vaultTokenAccount,  // the ATA to create
          vaultPublicKey,     // owner of the new ATA
          tokenMintAddress,
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID
        );
        transaction.add(createVaultAtaIx);
      }

      // 10) Create the transfer instruction to move betAmount tokens from the player's ATA to the vault's ATA.
      const transferIx = createTransferInstruction(
        playerTokenAccount,
        vaultTokenAccount,
        playerPubKey, // the player's wallet is the authority
        betAmount,
        [],
        TOKEN_PROGRAM_ID
      );
      transaction.add(transferIx);

      // 11) Finalize, sign, and send the transaction.
      transaction.feePayer = playerPubKey;
      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;

      // Ask the player’s wallet to sign.
      const signedTx = await window.solana.signTransaction(transaction);
      const rawTx = signedTx.serialize();
      const txId = await connection.sendRawTransaction(rawTx);
      await connection.confirmTransaction(txId);
      console.log("Transfer transaction confirmed:", txId);

      // 12) Build a payload to send to your server (including the transaction ID).
      const payload = {
        publicKey: walletPublicKey,
        betAmount,
        transactionId: txId
      };

      // 13) POST the bet details to your server endpoint.
      const response = await fetch("http://localhost:3000/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      console.log("Bet recorded on server:", result);

    } catch (err) {
      console.error("Error sending bet request:", err);
      alert("Bet transaction failed. See console for details.");
    }
  });
});
