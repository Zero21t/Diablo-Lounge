// Phantom Wallet Login & Connect
async function connectPhantomWallet() {
  if (window.solana && window.solana.isPhantom) {
      try {
          const response = await window.solana.connect(); // Request wallet connection
          const walletAddress = response.publicKey.toString();

          // Store wallet address in session storage (NOT local storage)
          sessionStorage.setItem("phantomWalletAddress", walletAddress);

          // Display wallet balance
          fetchWalletBalance(walletAddress);

          // Hide the login modal
          const modalEl = document.getElementById('signInModal');
          const modalInstance = bootstrap.Modal.getInstance(modalEl);
          if (modalInstance) {
              modalInstance.hide();
          }
      } catch (err) {
          console.error("Phantom Wallet connection error:", err);
      }
  } else {
      alert("Phantom Wallet is not installed. Please install it to continue.");
  }
}
// Auto-disconnect Phantom Wallet when the tab is closed or refreshed
window.addEventListener("beforeunload", () => {
  sessionStorage.removeItem("phantomWalletAddress");
});
