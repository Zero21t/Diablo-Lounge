async function fetchWalletBalance(walletAddress) {
    if (!walletAddress) {
      document.getElementById("loginButton").innerHTML = `Login`;
      return;
    }
  
    // Use the Devnet RPC endpoint
    const solanaRpcUrl = "https://api.devnet.solana.com";
    const DOUBLOONS_MINT = "mntx96ePfermX8Nzt95osYHdQmyjNPbE6seiUfLqpti"; // Token Mint Address
  
    try {
      console.log("Fetching wallet balance for:", walletAddress);
  
      // Create a connection using the Solana web3.js API on Devnet
      const connection = new solanaWeb3.Connection(solanaRpcUrl, "confirmed");
      const ownerPublicKey = new solanaWeb3.PublicKey(walletAddress);
  
      // Get parsed token accounts for the given mint address
      const parsedAccounts = await connection.getParsedTokenAccountsByOwner(ownerPublicKey, {
        mint: new solanaWeb3.PublicKey(DOUBLOONS_MINT)
      });
  
      let doubloonBalance = 0;
      console.log("🔍 Parsed token accounts:", parsedAccounts.value);
  
      parsedAccounts.value.forEach(({ account }) => {
        const tokenAmount = account.data.parsed.info.tokenAmount;
        console.log(`💰 Found token amount: ${tokenAmount.uiAmount}`);
        doubloonBalance += tokenAmount.uiAmount;
      });
  
      // Update the login button with Phantom icon and token balance
      document.getElementById("loginButton").innerHTML = `
        <img src="https://phantom.app/img/phantom-logo.png" alt="Phantom Wallet" style="height:24px; width:24px; border-radius:50%; margin-right:5px;" />
        ${doubloonBalance.toLocaleString()}🏴‍☠️
      `;
    } catch (error) {
      console.error("Error fetching balance:", error);
      document.getElementById("loginButton").innerHTML = `Error fetching balance`;
    }
  }
  