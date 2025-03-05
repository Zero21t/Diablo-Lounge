        // Regular expression for validating a UUID (version-agnostic).
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        // Listen for the button click to check the input key.
        document.getElementById('checkBtn').addEventListener('click', async () => {
          const keyInput = document.getElementById('keyInput').value.trim();
          const resultDiv = document.getElementById('result');
        
          // Validate that the input is not empty.
          if (!keyInput) {
            resultDiv.innerHTML = `<div class="alert alert-warning">Please enter a key.</div>`;
            return;
          }
        
          // Validate that the key is a properly formatted UUID.
          if (!uuidRegex.test(keyInput)) {
            resultDiv.innerHTML = `<div class="alert alert-warning">The entered key is not a valid UUID.</div>`;
            return;
          }
        
          // Replace 'your_table' with the actual table name that contains the id column.
          const { data, error } = await supabaseClient
            .from('users')
            .select('id')
            .eq('id', keyInput);
        
          if (error) {
            console.error('Error fetching data:', error);
            resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
          } else if (data && data.length > 0) {
            resultDiv.innerHTML = `<div class="alert alert-success">UUID match found!</div>`;
          } else {
            resultDiv.innerHTML = `<div class="alert alert-info">No matching UUID found.</div>`;
          }
        });