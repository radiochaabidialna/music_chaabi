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

  // Bouton précédent
  const prevButton = document.createElement('button');
  prevButton.textContent = 'Précédent';
  prevButton.onclick = () => changeArtistsPage(Math.max(1, currentPage - 10));
  prevButton.disabled = currentPage === 1;
  paginationContainer.appendChild(prevButton);

  // Calculer la plage de pages à afficher
  let startPage = Math.floor((currentPage - 1) / 10) * 10 + 1;
  let endPage = Math.min(startPage + 9, totalPages);

  // Ajouter les boutons de page
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.onclick = () => changeArtistsPage(i);
    if (i === currentPage) {
      pageButton.disabled = true;
    }
    paginationContainer.appendChild(pageButton);
  }

  // Bouton suivant
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Suivant';
  nextButton.onclick = () => changeArtistsPage(Math.min(totalPages, currentPage + 10));
  nextButton.disabled = currentPage > totalPages - 10;
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
	artistCard.setAttribute('data-id', artist.id);
    const isLiked = localStorage.getItem(`artist_${artist.id}_liked`) === 'true';
    artistCard.innerHTML = `
      <img src="http://localhost/${artist.image}" alt="${artist.artiste}" width="150" height="150">
      <h2>${artist.artiste}</h2>
      <!-- <p>${artist.bio.substring(0, 100)}...</p>-->
      <button onclick="showArtistDetails(${artist.id})">En savoir plus</button>
       <p>Vues: <span class="views-count">${artist.views}</span>${isLiked ? ' <span style="color: red;">❤️</span>' : ''}</p>
      <button onclick="updateViews('artistes', ${artist.id})">Like</button>
    `;
    artistsList.appendChild(artistCard);
  });
}

async function showArtistDetails(artistId) {
  try {
    const response = await fetch(`${ARTISTS_API}/artistes?id=${artistId}`);
    const artist = await response.json();
    const resultsContainer = document.getElementById('profile-container');

    resultsContainer.innerHTML = `
    
        <div class="profile-image">
            <img src="http://localhost/${artist.image}" alt="${artist.artiste}">
        </div>
        <div class="profile-details">
            <h2>${artist.artiste}</h2>
			<h3>Biographie</h3>
			 <div>${artist.bio}</div>
                <div class="skill">
    <p class="job-title">${artist.views}</p>
            <p class="location">${artist.date}</p> 
                </div>
<h3>Chansons populaires:</h3>
       <div class="songs-list">
              ${artist.chansons.map(song => `<p class="song-item">${song.titre} (${song.date})</p>`).join('')}
            </div>
           <!-- <button class="contact-btn ">
	
			</button>-->
        </div>

    `;
  } catch (error) {
    console.error('Error fetching artist details:', error);
    resultsContainer.innerHTML = '<p>Une erreur est survenue lors du chargement des détails de l\'artiste.</p>';
  }
}


/*async function showArtistDetails(artistId) {
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
}*/

// Fonction pour gérer le clic sur le bouton "like"
async function updateViews(type, id) {
  try {
    const response = await fetch(`${API_BASE_URL}/updateViews.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type, id })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // Mettre à jour le nombre de vues et ajouter le cœur rouge
        const viewsElement = document.querySelector(`[data-id="${id}"] .views-count`);
        if (viewsElement) {
          viewsElement.innerHTML = `${data.views} <span style="color: red;">❤️</span>`;
        }

        // Afficher le message de remerciement
        const messageDiv = document.getElementById('like-message');
        messageDiv.textContent = 'Merci d\'avoir liké!';
        messageDiv.style.display = 'block';
        setTimeout(() => {
          messageDiv.style.display = 'none';
        }, 60000); // Le message disparaît après 1 minute

        console.log(`Artiste liké avec succès! (Vues: ${data.views})`);
      }
    } else {
      throw new Error('Failed to update views');
    }
  } catch (error) {
    console.error('Error updating views:', error);
    alert('Une erreur est survenue lors de la mise à jour des vues.');
  }
}
