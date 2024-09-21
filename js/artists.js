const API_BASE_URL = 'http://localhost/api/index.php';
const ARTISTS_API = `${API_BASE_URL}/artistes`;
const ITEMS_PER_PAGE = 8;
let currentPage = 1;
let totalPages = 1;
let currentData = [];
let currentPageArtists = 1;
let totalPagesArtists = 1;
let currentArtistsData = [];

document.addEventListener('DOMContentLoaded', function () {
  loadArtists();
});

async function loadArtists(page = 1) {
  try {
    const response = await fetch(`${ARTISTS_API}?page=${page}&limit=${ITEMS_PER_PAGE}`);
    const data = await response.json();
    if (data.artistes) {
      currentData = data.artistes;
      totalPages = data.pagination.totalPages;
      displayArtists();
      updateArtistsPagination();
    } else {
      console.error('No artists available');
    }
  } catch (error) {
    console.error('Error loading artists:', error);
  }
}

function updateArtistsPagination() {
  const paginationContainer = document.getElementById('artists-pagination');
  paginationContainer.innerHTML = '';
  const prevButton = document.createElement('button');
  prevButton.textContent = 'Précédent';
  prevButton.onclick = () => changeArtistsPage(currentPage - 1);
  prevButton.disabled = currentPage === 1;
  paginationContainer.appendChild(prevButton);
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.onclick = () => changeArtistsPage(i);
    if (i === currentPage) {
      pageButton.disabled = true;
    }
    paginationContainer.appendChild(pageButton);
  }
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Suivant';
  nextButton.onclick = () => changeArtistsPage(currentPage + 1);
  nextButton.disabled = currentPage === totalPages;
  paginationContainer.appendChild(nextButton);
}

function changeArtistsPage(newPage) {
  if (newPage >= 1 && newPage <= totalPages) {
    currentPage = newPage;
    loadArtists(currentPage);
  }
}

function displayArtists() {
  const artistsList = document.getElementById('artists-list');
  artistsList.innerHTML = '';
  currentData.forEach(artist => {
    const artistCard = document.createElement('div');
    artistCard.className = 'artist-card';
    const isLiked = localStorage.getItem(`artist_${artist.id}_liked`) === 'true';
    artistCard.innerHTML = `
      <img src="http://localhost/${artist.image}" alt="${artist.artiste}" width="150" height="150">
      <h2>${artist.artiste}</h2>
      <p>${artist.bio.substring(0, 100)}...</p>
      <button onclick="showArtistDetails(${artist.id})">En savoir plus</button>
      <button class="like-button ${isLiked ? 'liked' : ''}" onclick="toggleLike('artistes', ${artist.id}, 'artists')">
  ${isLiked ? 'Je n\'aime plus' : 'J\'aime'}
</button>
    `;
    artistsList.appendChild(artistCard);
  });
}

async function showArtistDetails(artistId) {
  try {
    const response = await fetch(`${ARTISTS_API}/artistes?id=${artistId}`);
    const artist = await response.json();
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `
      <div class="artist-card">
        <img src="http://localhost/${artist.image}" alt="${artist.artiste}" width="100" height="100">
        <h2>${artist.artiste}</h2>
        <p>${artist.bio}</p>
        <h3>Chansons populaires:</h3>
        <ul>
          ${artist.chansons.map(song => `<li>${song.titre} (${song.date})</li>`).join('')}
        </ul>
      </div>
    `;
    document.getElementById('results-pagination').innerHTML = '';
  } catch (error) {
    console.error('Error loading artist details:', error);
  }
}

// Fonction pour gérer le clic sur le bouton "like"
async function toggleLike(type, id, section) {
  const key = `${type}_${id}_liked`;
  const isLiked = localStorage.getItem(key) === 'true';

  try {
    // Mettre à jour les vues en appelant l'API PHP
    const viewsResponse = await fetch('http://localhost/api/index.php/updateViews.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: type, id: id })
    });
    const viewsData = await viewsResponse.json();

    if (viewsData.success) {
      // Mettre à jour le statut du like
      localStorage.setItem(key, (!isLiked).toString());

      // Actualiser la page ou les résultats de recherche
      if (section === 'artists') {
        await loadArtists(currentPage);
      } else if (section === 'songs') {
        await loadSongs(currentPage);
      } else if (section === 'dernieres') {
        await loadLatestSongs();
      } else if (section === 'top10') {
        await loadTop10Songs();
      } else if (section === 'categories') {
        await loadCategorySongs();
      } else {
        displaySearchResults();
      }

      const action = isLiked ? 'retiré des favoris' : 'ajouté aux favoris';
      alert(`${type === 'artist' ? 'Artiste' : 'Chanson'} ${action} avec succès! (Vues: ${viewsData.views})`);
    } else {
      throw new Error('Failed to update views');
    }
  } catch (error) {
    console.error('Error updating views:', error);
    alert('Une erreur est survenue lors de la mise à jour des vues.');
  }

  try {
    // Mettre à jour le like en utilisant l'API d'origine
    const response = await fetch(`${API_BASE_URL}/updateViews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: type,
        id: id,
        action: isLiked ? 'unlike' : 'like'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update like status');
    }
  } catch (error) {
    console.error('Error updating like status:', error);
    alert('Une erreur est survenue lors de la mise à jour du statut de like.');
  }
}

