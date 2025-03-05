 const SUPABASE_URL = 'https://sqzrrkggbtmtcygookcm.supabase.co';
 const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxenJya2dnYnRtdGN5Z29va2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMTA3NjQsImV4cCI6MjA1NjY4Njc2NH0.HisqzKqfQ6tHseA2HAb8AFbXrXC65y-GE3Q-uWi8dS0';

 // Initialize the Supabase client
 const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

 async function checkDatabaseConnection() {
   // Perform a simple query to test the connection.
   const { data, error } = await supabaseClient
     .from('users')
     .select('*')
     .limit(1);
   
   // If there's no error, assume the connection is successful.
   if (!error) {
     document.getElementById('connection-status').classList.add('connected');
   } else {
     console.error('Database connection error:', error);
   }
 }
 // Run the connection check when the page loads
 checkDatabaseConnection();