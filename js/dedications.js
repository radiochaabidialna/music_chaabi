// Fonctionnalités liées aux dédicaces
const API_BASE_URL = 'http://localhost/api/index.php';
async function loadDedicationBanner() {
  try {
    const response = await fetch(`${API_BASE_URL}/dedicaces`);
    const data = await response.json();
    if (data.dedicaces) {
      const dedicaces = data.dedicaces.map(dedication => `${dedication.nom}: ${dedication.description}`).join(' | ');
      document.getElementById('dedication-text').textContent = dedicaces;
    } else {
      console.error('No dedicaces available');
    }
  } catch (error) {
    console.error('Error loading dedicaces:', error);
  }
}
 loadDedicationBanner()

async function loadDedicationModal() {
  try {
    const response = await fetch(`${API_BASE_URL}/dedicaces`);
    const data = await response.json();
    if (data.dedicaces) {
      const dedicaces = data.dedicaces.map(dedication => `
        <p>${dedication.nom}: ${dedication.description}</p>
      `).join('');
      document.getElementById('dedication-modal-content').innerHTML = dedicaces;
    } else {
      console.error('No dedicaces available');
    }
  } catch (error) {
    console.error('Error loading dedicaces:', error);
  }
}

document.getElementById('dedication-form').onsubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById('dedication-name').value;
  const message = document.getElementById('dedication-message').value;
  try {
    const response = await fetch(DEDICACES_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, message }),
    });
    if (response.ok) {
      alert('Dédicace envoyée avec succès!');
      modal.style.display = 'none';
      loadDedicationBanner();
    } else {
      alert('Erreur lors de l\'envoi de la dédicace.');
    }
  } catch (error) {
    console.error('Error sending dedication:', error);
    alert('Erreur lors de l\'envoi.');
  }
};