window.getWalletAddress = () => localStorage.getItem("walletAddress");
window.getTokenBalance = () => parseFloat(localStorage.getItem("tokenBalance") || "0");

document.addEventListener("DOMContentLoaded", async () => {
    const loginButton = document.getElementById("loginButton");
  
    const storedWallet = localStorage.getItem("walletAddress");
    const storedUsername = localStorage.getItem("username");
    if (storedWallet) {
        const tokenBalance = await getTokenBalance(storedWallet);
        loginButton.innerText = storedUsername 
          ? `${storedUsername} | Tokens: ${tokenBalance}`
          : `Tokens: ${tokenBalance} | Wallet: ${storedWallet.slice(0, 6)}...${storedWallet.slice(-4)}`;
        loginButton.classList.remove("btn-danger");
        loginButton.classList.add("btn-success");
      }
  
    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
              const response = await window.solana.connect();
              const publicKey = response.publicKey.toString();
              localStorage.setItem("walletAddress", publicKey);
              console.log("Connected with wallet:", publicKey);
              const username = await saveWalletToSupabase(publicKey);
              localStorage.setItem("username", username);
              const tokenBalance = await getTokenBalance(publicKey);
              loginButton.innerText = username 
                  ? `${username} | Tokens: ${tokenBalance}`
                  : `Tokens: ${tokenBalance} | Wallet: ${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`;
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
  
            let tokenBalance = 0;
            if (tokenAccounts.value.length > 0) {
                tokenBalance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
            }
            return tokenBalance.toFixed(2);
        } catch (error) {
            console.error("Error fetching token balance:", error);
            alert("Failed to fetch token balance.");
            return "0.00";
        }
    }
  
    loginButton.addEventListener("click", connectWallet);
  });
  