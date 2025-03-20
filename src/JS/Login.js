document.addEventListener("DOMContentLoaded", async () => {
  const loginButton = document.getElementById("loginButton");

  async function connectWallet() {
      if (window.solana && window.solana.isPhantom) {
          try {
              const response = await window.solana.connect();
              const publicKey = response.publicKey.toString();
              console.log("Connected with wallet:", publicKey);

              loginButton.innerText = `Connected: ${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`;
              loginButton.classList.remove("btn-danger");
              loginButton.classList.add("btn-success");

              await getTokenBalance(publicKey);
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
      const tokenMintAddress = "mntx96ePfermX8Nzt95osYHdQmyjNPbE6seiUfLqpti"; // Replace with actual token mint address

      try {
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
              new PublicKey(walletAddress),
              { mint: new PublicKey(tokenMintAddress) }
          );

          let balance = 0;
          if (tokenAccounts.value.length > 0) {
              balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
          }

          alert(`Your token balance: ${balance}`);
      } catch (error) {
          console.error("Error fetching token balance:", error);
          alert("Failed to fetch token balance.");
      }
  }

  loginButton.addEventListener("click", connectWallet);
});
