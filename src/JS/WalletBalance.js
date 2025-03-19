async function fetchWalletBalance(walletAddress) {
    if (!walletAddress) {
        document.getElementById("walletBalance").innerHTML = `<p>Not Connected</p>`;
        return;
    }

    const solanaRpcUrl = "https://api.devnet.solana.com"; // Devnet RPC
    const DEVNET_TOKEN_MINT = "mntx96ePfermX8Nzt95osYHdQmyjNPbE6seiUfLqpti"; // USDC Devnet

    try {
        // Fetch SOL Balance
        const solResponse = await fetch(solanaRpcUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "getBalance",
                params: [walletAddress]
            }),
        });

        const solData = await solResponse.json();
        const solBalance = solData.result.value / 1e9; // Convert Lamports to SOL

        // Fetch SPL Token Balances
        const tokenResponse = await fetch(solanaRpcUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "getTokenAccountsByOwner",
                params: [
                    walletAddress,
                    { "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
                    { "encoding": "jsonParsed" }
                ]
            }),
        });

        const tokenData = await tokenResponse.json();
        let tokenBalance = 0;

        tokenData.result.value.forEach((account) => {
            if (account.account.data.parsed.info.mint === DEVNET_TOKEN_MINT) {
                tokenBalance = account.account.data.parsed.info.tokenAmount.uiAmount;
            }
        });

        // Update UI with balance
        document.getElementById("walletBalance").innerHTML = `
            <p>Balance: ${solBalance.toFixed(4)} SOL</p>
            <p>Devnet Token Balance: ${tokenBalance.toFixed(2)} USDC</p>
        `;
    } catch (error) {
        console.error("Error fetching balance:", error);
    }
}
// Auto-login on page load if wallet is connected
window.addEventListener("load", () => {
    const savedWallet = sessionStorage.getItem("phantomWalletAddress");

    if (savedWallet) {
        fetchWalletBalance(savedWallet);
    } else {
        document.getElementById("walletBalance").innerHTML = `<p>Not Connected</p>`;
        const modalEl = document.getElementById("signInModal");
        const modal = new bootstrap.Modal(modalEl, {
            backdrop: "static",
            keyboard: false
        });
        modal.show();
    }
});
