async function fetchWalletBalance(walletAddress) {
    if (!walletAddress) {
        document.getElementById("walletBalance").innerHTML = `<p>🏴‍☠️ Not Connected</p>`;
        return;
    }
  
    // Change the RPC endpoint to a valid one
    const solanaRpcUrl = "https://api.devnet.solana.com"; // or mainnet-beta if needed
    const DOUBLOONS_MINT = "mntx96ePfermX8Nzt95osYHdQmyjNPbE6seiUfLqpti"; // Your Token Mint Address
    const DOUBLOONS_DECIMALS = 6;
  
    try {
        console.log("Fetching wallet balance for:", walletAddress);
  
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
        let doubloonBalance = 0;
  
        console.log("🔍 Wallet Tokens:", tokenData.result.value);
  
        if (tokenData.result && tokenData.result.value.length > 0) {
            tokenData.result.value.forEach((account) => {
                const mintAddress = account.account.data.parsed.info.mint;
                const balanceInfo = account.account.data.parsed.info.tokenAmount;
  
                console.log(`💰 Found Token Mint: ${mintAddress} | Raw Balance: ${balanceInfo.amount}`);
  
                if (mintAddress === DOUBLOONS_MINT) {
                    doubloonBalance = balanceInfo.amount / Math.pow(10, DOUBLOONS_DECIMALS);
                }
            });
        } else {
            console.warn("⚠️ No SPL Tokens found in this wallet.");
        }
  
        document.getElementById("walletBalance").innerHTML = `
            <p>Doubloon Balance: ${doubloonBalance.toLocaleString()} 🏴‍☠️</p>
        `;
        document.getElementById("navWalletBalance").innerText = `${doubloonBalance.toLocaleString()} Doubloons 🏴‍☠️`;
  
    } catch (error) {
        console.error("Error fetching balance:", error);
        document.getElementById("walletBalance").innerHTML = `<p>Error fetching balance</p>`;
    }
  }
  