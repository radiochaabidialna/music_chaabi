// main.js
const API_BASE_URL = 'http://localhost/api/index.php';

// Fonction pour la pagination, likes, etc.
function updatePagination(paginationId, loadFunction, currentPage, totalPages) {
  const paginationContainer = document.getElementById(paginationId);
  paginationContainer.innerHTML = '';
  
  const prevButton = document.createElement('button');
  prevButton.textContent = 'Précédent';
  prevButton.onclick = () => loadFunction(currentPage - 1);
  prevButton.disabled = currentPage === 1;
  paginationContainer.appendChild(prevButton);

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.onclick = () => loadFunction(i);
    pageButton.disabled = i === currentPage;
    paginationContainer.appendChild(pageButton);
  }

  const nextButton = document.createElement('button');
  nextButton.textContent = 'Suivant';
  nextButton.onclick = () => loadFunction(currentPage + 1);
  nextButton.disabled = currentPage === totalPages;
  paginationContainer.appendChild(nextButton);
}

function toggleLike(type, id) {
  const key = `${type}_${id}_liked`;
  const isLiked = localStorage.getItem(key) === 'true';
  localStorage.setItem(key, !isLiked);
  alert(`${type === 'artist' ? 'Artiste' : 'Chanson'} ${isLiked ? 'retiré des favoris' : 'ajouté aux favoris'}!`);
}

function playSong(audioSrc) {
  const audioPlayer = document.getElementById('audio-player');
  audioPlayer.src = audioSrc;
  audioPlayer.play();
}
// essai didecaces
// Fonctions pour charger les données et mettre à jour les pages
async function loadDedicationBanner() {
    try {
      const response = await fetch(`http://localhost/api/index.php/dedicaces?page=1&limit=5`);
      const data = await response.json();
      if (data.dedicaces) {
        const dedicaces = data.dedicaces.map(dedicace => `${dedicace.nom}: ${dedicace.description}`).join(' | ');
        document.getElementById('dedication-text').textContent = dedicaces;
      } else {
        console.error('No dedicaces available');
      }
      // Charger les dernières chansons après avoir chargé les dédicaces
      //loadLatestSongs();
    } catch (error) {
      console.error('Error loading dedicaces:', error);
    }
  }
  loadDedicationBanner()