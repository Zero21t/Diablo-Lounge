document.addEventListener("DOMContentLoaded", async () => {
    const connectButton = document.getElementById("phantomLoginButton");
    if (connectButton) {
      connectButton.addEventListener("click", connectPhantomWallet);
    }
  
    // Auto-reconnect wallet on page load if saved
    const savedWallet = localStorage.getItem("phantomWalletAddress");
    if (savedWallet) {
      console.log("Reconnecting wallet...");
      fetchWalletBalance(savedWallet);
    } else {
      // Show the sign-in modal if no wallet is connected
      const modalEl = document.getElementById('signInModal');
      const modalInstance = new bootstrap.Modal(modalEl);
      modalInstance.show();
    }
  });
  
  // Phantom Wallet Login & Connect (Only for Doubloons)
  async function connectPhantomWallet() {
    if (window.solana && window.solana.isPhantom) {
      console.log("Phantom Wallet detected. Attempting connection...");
  
      try {
        const response = await window.solana.connect({ onlyIfTrusted: true }); // Auto-connect if trusted
        console.log("Wallet Connected!", response);
  
        const walletAddress = response.publicKey.toString();
        console.log("Wallet Address:", walletAddress);
        localStorage.setItem("phantomWalletAddress", walletAddress);
        fetchWalletBalance(walletAddress);
  
        // Hide the sign-in modal after successful connection
        const modalEl = document.getElementById('signInModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
          modalInstance.hide();
        }
  
        // Update navbar with shortened wallet address
        document.getElementById("navWalletBalance").innerText = `Wallet: ${walletAddress.slice(0, 6)}...`;
  
      } catch (err) {
        console.error("Phantom Wallet connection error:", err);
        alert(`Error connecting to Phantom Wallet: ${err.message}`);
      }
    } else {
      console.warn("Phantom Wallet not detected.");
      alert("Phantom Wallet is not installed. Please install it to continue.");
    }
  }
  