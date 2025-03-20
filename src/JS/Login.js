document.addEventListener("DOMContentLoaded", async () => {
  const loginButton = document.getElementById("loginButton");

  async function connectWallet() {
      if (window.solana && window.solana.isPhantom) {
          try {
              const response = await window.solana.connect();
              const publicKey = response.publicKey.toString();
              console.log("Connected with wallet:", publicKey);

              // Fetch and display token balance
              const balance = await getTokenBalance(publicKey);
              
              loginButton.innerText = `Tokens: ${balance} | Wallet: ${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`;
              loginButton.classList.remove("btn-danger");
              loginButton.classList.add("btn-success");
          } catch (err) {
              console.error("Wallet connection failed:", err);
          }
      } else {
          alert("Phantom Wallet not found! Please install it.");
      }
  }

  async function getTokenBalance(walletAddress) {
      const { Connection, PublicKey, clusterApiUrl } = solanaWeb3;
      const connection = new Connection(clusterApiUrl('devnet'));
      const tokenMintAddress = "mntx96ePfermX8Nzt95osYHdQmyjNPbE6seiUfLqpti"; 
      try {
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
              new PublicKey(walletAddress),
              { mint: new PublicKey(tokenMintAddress) }
          );

          let balance = 0;
          if (tokenAccounts.value.length > 0) {
              balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
          }
          return balance.toFixed(2);
      } catch (error) {
          console.error("Error fetching token balance:", error);
          alert("Failed to fetch token balance.");
          return "0.00";
      }
  }

  loginButton.addEventListener("click", connectWallet);
});
