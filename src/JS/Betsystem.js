// src/JS/Betsystem.js
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from "https://esm.sh/@solana/spl-token@0.3.5";

document.addEventListener("DOMContentLoaded", async () => {
  // Auto-reconnect if wallet is installed but not connected.
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
    // 1) Ensure the user's Phantom wallet is connected.
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
      // 3) Establish a connection to devnet.
      const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("devnet"));

      // 4) Define the token mint address (must match your Withdraw.js).
      const tokenMintAddress = new solanaWeb3.PublicKey("mntx96ePfermX8Nzt95osYHdQmyjNPbE6seiUfLqpti");

      // 5) Convert bet amount to raw units.
      // Assume the token has 2 decimals; adjust tokenDecimals if necessary.
      const tokenDecimals = 2;
      const rawBetAmount = Math.round(betAmount * Math.pow(10, tokenDecimals));

      // 6) Get the player's associated token account (ATA).
      const playerTokenAccount = await getAssociatedTokenAddress(
        tokenMintAddress,
        playerPubKey,
        false,
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID
      );

      // 7) Check if the player's ATA exists; if not, add an instruction to create it.
      let transaction = new solanaWeb3.Transaction();
      const playerAtaInfo = await connection.getAccountInfo(playerTokenAccount);
      if (!playerAtaInfo) {
        const createPlayerAtaIx = createAssociatedTokenAccountInstruction(
          playerPubKey,         // payer
          playerTokenAccount,   // ATA to create
          playerPubKey,         // owner of the new ATA
          tokenMintAddress,
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID
        );
        transaction.add(createPlayerAtaIx);
      }

      // 8) Define the vault's public key (matches the vault in your server/Withdraw.js).
      const vaultPublicKey = new solanaWeb3.PublicKey("dadUa3DRj79Fv4M6pNUExNjXaXZ8P8zCoC863zWvuPP");

      // 9) Get the vault's associated token account.
      const vaultTokenAccount = await getAssociatedTokenAddress(
        tokenMintAddress,
        vaultPublicKey,
        false,
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID
      );

      // 10) Check if the vault's ATA exists; if not, add an instruction to create it.
      const vaultAtaInfo = await connection.getAccountInfo(vaultTokenAccount);
      if (!vaultAtaInfo) {
        const createVaultAtaIx = createAssociatedTokenAccountInstruction(
          playerPubKey,       // payer (player pays creation fee here)
          vaultTokenAccount,  // ATA to create
          vaultPublicKey,     // owner of the new ATA
          tokenMintAddress,
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID
        );
        transaction.add(createVaultAtaIx);
      }

      // 11) Create the transfer instruction to move rawBetAmount tokens from the player's ATA to the vault's ATA.
      const transferIx = createTransferInstruction(
        playerTokenAccount,
        vaultTokenAccount,
        playerPubKey, // authority (player signs)
        rawBetAmount,
        [],
        TOKEN_PROGRAM_ID
      );
      transaction.add(transferIx);

      // 12) Finalize, sign, and send the transaction.
      transaction.feePayer = playerPubKey;
      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTx = await window.solana.signTransaction(transaction);
      const rawTx = signedTx.serialize();
      const txId = await connection.sendRawTransaction(rawTx);
      await connection.confirmTransaction(txId);
      console.log("Transfer transaction confirmed:", txId);

      // 13) Build a payload to send to your server (including the transaction ID).
      const payload = {
        publicKey: walletPublicKey,
        betAmount,
        transactionId: txId
      };

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
