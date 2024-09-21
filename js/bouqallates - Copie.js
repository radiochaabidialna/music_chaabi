const BOUQALLATES_API = `http://localhost/api/index.php/bouqallas?rondom`;

document.addEventListener('DOMContentLoaded', function () {
  loadRandomBouqallate();
});


// Fonctionnalités liées aux bouqallates

async function loadRandomBouqallate() {
  try {
    const response = await fetch(`${BOUQALLATES_API}`);
    const data = await response.json();
    if (data.bouqalla) {
      const bouqallate = data.bouqalla[0];
      const bouqallateContent = document.getElementById('bouqallate-content');
      bouqallateContent.innerHTML = `
        <p lang="ar">${bouqallate.arab}</p>
        <p>${bouqallate.phonetic}</p>
        <p >${bouqallate.franc}</p>
      `;
    } else {
      console.error('No bouqallate available');
    }
  } catch (error) {
    console.error('Error loading bouqallate:', error);
  }
}