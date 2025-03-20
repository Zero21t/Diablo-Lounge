document.addEventListener("DOMContentLoaded", async () => {
  const loginButton = document.getElementById("loginButton");
  const userInfo = document.createElement("div");
  userInfo.id = "userInfo";
  userInfo.classList.add("ms-3", "d-flex", "align-items-center");
  userInfo.style.display = "none";
  
  const userPfp = document.createElement("img");
  userPfp.id = "userPfp";
  userPfp.classList.add("rounded-circle", "me-2");
  userPfp.width = 40;
  userPfp.height = 40;
  
  const tokenBalance = document.createElement("span");
  tokenBalance.id = "tokenBalance";
  
  userInfo.appendChild(userPfp);
  userInfo.appendChild(tokenBalance);
  loginButton.parentNode.replaceChild(userInfo, loginButton);
  
  async function connectWallet() {
      if (window.solana && window.solana.isPhantom) {
          try {
              const response = await window.solana.connect();
              const publicKey = response.publicKey.toString();
              console.log("Connected with wallet:", publicKey);

              userInfo.style.display = "flex";
              
              // Fetch and display token balance
              await getTokenBalance(publicKey);

              // Placeholder PFP (Replace with API if needed)
              userPfp.src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${publicKey}`; 
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
      const tokenMintAddress = "TOKEN_MINT_ADDRESS_HERE"; // Replace with actual token mint address

      try {
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
              new PublicKey(walletAddress),
              { mint: new PublicKey(tokenMintAddress) }
          );

          let balance = 0;
          if (tokenAccounts.value.length > 0) {
              balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
          }

          tokenBalance.innerText = `💰 ${balance.toFixed(2)} Tokens`;
      } catch (error) {
          console.error("Error fetching token balance:", error);
          alert("Failed to fetch token balance.");
      }
  }

  loginButton.addEventListener("click", connectWallet);
});
