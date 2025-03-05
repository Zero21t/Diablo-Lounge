// Regular expression for validating a UUID (version-agnostic).
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Listen for the sign in form submission.
document.getElementById('signInForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const uuidInput = document.getElementById('uuidInput').value.trim();
  const feedbackDiv = document.getElementById('signInFeedback');
  feedbackDiv.innerHTML = '';

  // Validate that the input is not empty.
  if (!uuidInput) {
    feedbackDiv.innerHTML = '<div class="alert alert-warning">Please enter a UUID.</div>';
    return;
  }

  // Validate that the input is a properly formatted UUID.
  if (!uuidRegex.test(uuidInput)) {
    feedbackDiv.innerHTML = '<div class="alert alert-warning">The entered UUID is not valid.</div>';
    return;
  }

  // Query the "users" table to check if the UUID exists.
  const { data, error } = await supabaseClient
    .from('users')
    .select('id')
    .eq('id', uuidInput)
    .limit(1);

  if (error) {
    console.error('Error fetching data:', error);
    feedbackDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
  } else if (data && data.length > 0) {
    feedbackDiv.innerHTML = `<div class="alert alert-success">UUID match found! Sign in successful.</div>`;
    // Close the modal after a short delay.
    setTimeout(() => {
      const modalEl = document.getElementById('signInModal');
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) {
        modalInstance.hide();
      }
    }, 1000);
  } else {
    feedbackDiv.innerHTML = `<div class="alert alert-info">No matching UUID found.</div>`;
  }
});

// Show the sign in modal on page load.
window.addEventListener('load', () => {
  const modalEl = document.getElementById('signInModal');
  const modal = new bootstrap.Modal(modalEl, {
    backdrop: 'static',
    keyboard: false
  });
  modal.show();
});
