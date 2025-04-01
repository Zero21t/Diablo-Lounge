const supabaseUrl = "https://sqzrrkggbtmtcygookcm.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxenJya2dnYnRtdGN5Z29va2NtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTExMDc2NCwiZXhwIjoyMDU2Njg2NzY0fQ.iU0j8vzS4IHHPV8lLCXPl-Pf3iEc28WHV7Yz3WV0h_E";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function saveWalletToSupabase(walletAddress) {
    try {
        const { data: existingWallet, error: fetchError } = await supabaseClient
            .from("users")
            .select("wallet, username")
            .eq("wallet", walletAddress)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { 
            console.error("Error checking wallet in Supabase:", fetchError);
            return;
        }

        if (existingWallet && existingWallet.username) {
            console.log("Wallet found in Supabase, returning username:", existingWallet.username);
            return existingWallet.username;
        }

        const username = prompt("Welcome! Please enter a username to link with your wallet:");
        if (!username) {
            alert("Username is required!");
            return null;
        }

        const { data, error } = await supabaseClient
            .from("users")
            .upsert([{ wallet: walletAddress, username: username }], { onConflict: ["wallet"] });

        if (error) {
            console.error("Error saving username to Supabase:", error);
            return;
        }

        console.log("Username saved successfully to Supabase:", username);
        return username;
    } catch (err) {
        console.error("Unexpected error saving to Supabase:", err);
    }
}
