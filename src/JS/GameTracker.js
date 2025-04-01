/**
 * @param {string} GameName
 * @param {number} AmountBet
 * @param {number} winnings
 * @param {string} Result
 */
async function logGameResult(GameName, AmountBet, Winnings, Result) {
	const wallet = localStorage.getItem("walletAddress");
    const playerName = localStorage.getItem("username");
    if (!wallet || !playerName) {
        console.error("Missing wallet or username. Make sure the player is logged in.");
        return;
      }
      
    const { data, error } = await supabaseClient
    .from(GameName)
    .insert([
      {
        player_name: playerName,
        wallet: wallet,
        amount_bet: AmountBet,
        winnings: Winnings,
        result: Result, 
      }
    ]);

    if (error) {
        console.error("Error logging game result:", error);
      } else {
        console.log("Game result logged successfully:", data);
      }
}

async function PlayerResults(Result) {
    const wallet = localStorage.getItem("walletAddress");
    const playerName = localStorage.getItem("username");
    if (!wallet || !playerName) {
        console.error("Missing wallet or username. Make sure the player is logged in.");
        return;
      }
      
    let columnToUpdate = "";
    if (Result === "win") {
        columnToUpdate = "Wins";
    } else if (Result === "loss") {
        columnToUpdate = "Loss";
    }  

    let { data, error } = await supabaseClient
    .from('users')
    .select(columnToUpdate)
    .eq('wallet', wallet)
    .single();
    if (error) {
        console.error("Error fetching current record:", error);
        return;
    }
    const currentValue = data[columnToUpdate] || 0;
    const newValue = currentValue + 1;
    
    let { data: updateData, error: updateError } = await supabaseClient
    .from('users')
    .update({ [columnToUpdate]: newValue })
    .eq('wallet', wallet);
    if (updateError) {
        console.error("Error updating player result:", updateError);
        return;
    }
    console.log(`Player ${playerName} (${wallet}) ${Result} count updated to: ${newValue}`);


}