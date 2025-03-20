const supabaseUrl = "https://sqzrrkggbtmtcygookcm.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxenJya2dnYnRtdGN5Z29va2NtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTExMDc2NCwiZXhwIjoyMDU2Njg2NzY0fQ.iU0j8vzS4IHHPV8lLCXPl-Pf3iEc28WHV7Yz3WV0h_E";

// Initialize Supabase client (GLOBAL)
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function saveWalletToSupabase(walletAddress) {
    try {
        const { data, error } = await supabaseClient
            .from("users")
            .upsert([{ wallet: walletAddress }], { onConflict: ["wallet"] });

        if (error) {
            console.error("Error saving wallet to Supabase:", error);
            return;
        }

        console.log("Wallet saved successfully to Supabase:", data);
    } catch (err) {
        console.error("Unexpected error saving to Supabase:", err);
    }
}
