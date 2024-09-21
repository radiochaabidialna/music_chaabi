const API_BASE_URL = 'http://localhost/api/index.php';
const SONGS_API = `${API_BASE_URL}/chansons`;
let currentPage = 1;
let totalPages = 1;
let currentData = [];
let currentPageSongs = 1;
let totalPagesSongs = 1;
let currentSongsData = [];
ITEMS_PER_PAGE = 10

document.addEventListener('DOMContentLoaded', function () {
  loadSongs();
});

// Fonctionnalités liées aux chansons

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

function updateSongsPagination() {
  const paginationContainer = document.getElementById('songs-pagination');
  paginationContainer.innerHTML = '';

  // Bouton précédent
  const prevButton = document.createElement('button');
  prevButton.textContent = 'Précédent';
  prevButton.onclick = () => changeSongsPage(Math.max(1, currentPage - 10));
  prevButton.disabled = currentPage === 1;
  paginationContainer.appendChild(prevButton);

  // Calculer la plage de pages à afficher
  let startPage = Math.floor((currentPage - 1) / 10) * 10 + 1;
  let endPage = Math.min(startPage + 9, totalPages);

  // Ajouter les boutons de page
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.onclick = () => changeSongsPage(i);
    if (i === currentPage) {
      pageButton.disabled = true;
    }
    paginationContainer.appendChild(pageButton);
  }

  // Bouton suivant
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Suivant';
  nextButton.onclick = () => changeSongsPage(Math.min(totalPages, currentPage + 10));
  nextButton.disabled = currentPage > totalPages - 10;
  paginationContainer.appendChild(nextButton);
}

function changeSongsPage(newPage) {
  if (newPage >= 1 && newPage <= totalPages) {
    currentPage = newPage;
    loadSongs(currentPage);
  }
}

function displaySongs() {
  const songsList = document.getElementById('songs-list');
  songsList.innerHTML = '';
  currentData.forEach(song => {
    const songCard = document.createElement('div');
    songCard.className = 'song-card';
    songCard.setAttribute('data-id', song.id); // Ajout de l'attribut data-id pour la mise à jour

    // Vérification si la chanson a été likée
    const isLiked = localStorage.getItem(`song_${song.id}_liked`) === 'true';

    songCard.innerHTML = `
      <img src="http://localhost/${song.image}" alt="${song.titre}" class="song-image" />
      <h3>${song.titre}</h3>
      <p>Artiste: ${song.artiste}</p>
      <p>Année: ${song.date}</p>
      <p>Vues: <span class="views-count">${song.views}</span>${isLiked ? ' <span style="color: red;">❤️</span>' : ''}</p>
	    <button onclick="playSong('http://localhost/${song.audios}')">Écouter</button>
      <button onclick="updateViews('chansons', ${song.id})">Like</button>
      ${song.audio ? `<button onclick="playSong('${song.audio}')">Écouter</button>` : ''}
    `;
    
    songsList.appendChild(songCard);
  });
}

function playSong(audioSrc) {
  const audioPlayer = document.getElementById('audio-player');
  audioPlayer.src = audioSrc;
  audioPlayer.play();
}

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

        console.log(`Chanson likée avec succès! (Vues: ${data.views})`);
      }
    } else {
      throw new Error('Failed to update views');
    }
  } catch (error) {
    console.error('Error updating views:', error);
    alert('Une erreur est survenue lors de la mise à jour des vues.');
  }
}