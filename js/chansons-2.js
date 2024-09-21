const API_BASE_URL = 'http://localhost/api/index.php';
const SONGS_API = `${API_BASE_URL}/chansons`;
const ITEMS_PER_PAGE = 10;

let currentPage = 1;
let totalPages = 1;
let currentData = [];

document.addEventListener('DOMContentLoaded', loadSongs);

// Load songs from the API
async function loadSongs(page = 1) {
  try {
    const response = await fetch(`${SONGS_API}?page=${page}&limit=${ITEMS_PER_PAGE}`);
    const data = await response.json();
    
    if (data.chansons) {
      currentData = data.chansons;
      totalPages = data.pagination.totalPages;
      displaySongs();
      updateSongsPagination();
    } else {
      console.error('No songs available');
    }
  } catch (error) {
    console.error('Error loading songs:', error);
  }
}

// Update pagination buttons
function updateSongsPagination() {
  const paginationContainer = document.getElementById('songs-pagination');
  paginationContainer.innerHTML = '';

  paginationContainer.appendChild(createPageButton('Précédent', currentPage === 1, () => changeSongsPage(currentPage - 1)));

  for (let i = 1; i <= totalPages; i++) {
    paginationContainer.appendChild(createPageButton(i, i === currentPage, () => changeSongsPage(i)));
  }

  paginationContainer.appendChild(createPageButton('Suivant', currentPage === totalPages, () => changeSongsPage(currentPage + 1)));
}

// Create a button for pagination
function createPageButton(text, isDisabled, onClick) {
  const button = document.createElement('button');
  button.textContent = text;
  button.disabled = isDisabled;
  button.onclick = onClick;
  return button;
}

// Change the page when a pagination button is clicked
function changeSongsPage(newPage) {
  if (newPage >= 1 && newPage <= totalPages) {
    currentPage = newPage;
    loadSongs(currentPage);
  }
}

// Display songs in the UI
function displaySongs() {
  const songsList = document.getElementById('songs-list');
  songsList.innerHTML = '';

  currentData.forEach(song => {
    const songCard = document.createElement('div');
    songCard.className = 'song-card';
    const isLiked = localStorage.getItem(`song_${song.id}_liked`) === 'true';
    
    songCard.innerHTML = `
      <img src="http://localhost/${song.image}" alt="${song.titre}" width="100" height="100">
      <h2>${song.titre}</h2>
      <p>Artiste: ${song.artiste}</p>
      <p>Année: ${song.date}</p>
      <button onclick="playSong('http://localhost/${song.audios}')">Écouter</button>
      <button class="like-button ${isLiked ? 'liked' : ''}" onclick="toggleLike('chansons', ${song.id}, 'songs')">${isLiked ? 'Je n\'aime plus' : 'J\'aime'}</button>
    `;
    
    songsList.appendChild(songCard);
  });
}

// Play the selected song
function playSong(audioSrc) {
  const audioPlayer = document.getElementById('audio-player');
  audioPlayer.src = audioSrc;
  audioPlayer.play();
}

// Toggle like status of a song
async function toggleLike(type, id, section) {
  const key = `${type}_${id}_liked`;
  const isLiked = localStorage.getItem(key) === 'true';

  try {
    const viewsResponse = await fetch(`${API_BASE_URL}/updateViews.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type, id })
    });
    const viewsData = await viewsResponse.json();

    if (viewsData.success) {
      localStorage.setItem(key, (!isLiked).toString());
      await loadSongs(currentPage); // Reload songs after liking/unliking
      alert(`${type === 'song' ? 'Chanson' : 'Artiste'} ${isLiked ? 'retiré des favoris' : 'ajouté aux favoris'} avec succès! (Vues: ${viewsData.views})`);
    } else {
      throw new Error('Failed to update views');
    }
  } catch (error) {
    console.error('Error updating views:', error);
    alert('Une erreur est survenue lors de la mise à jour des vues.');
  }
}