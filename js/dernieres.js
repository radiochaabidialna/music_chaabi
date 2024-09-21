// Fonctionnalités liées aux dernières chansons

async function loadLatestSongs(section) {
  try {
    const response = await fetch(`${API_BASE_URL}/dernieres`);
    const data = await response.json();
    if (data.dernieres) {
      const isLiked = {};
      data.dernieres.forEach(song => {
        isLiked[song.id] = localStorage.getItem(`song_${song.id}_liked`) === 'true';
      });
      displayLatestSongs(data.dernieres, isLiked);
    } else {
      console.error('No latest songs available');
    }
  } catch (error) {
    console.error('Error loading latest songs:', error);
  }
}

function displayLatestSongs(data, isLiked) {
  const latestSongsContainer = document.getElementById('dernieres-list');
  //latestSongsContainer.innerHTML = '<h3>Dernières chansons</h3>';
  data.forEach(song => {
    const songElement = document.createElement('div');
    songElement.className = 'song-card';
    songElement.innerHTML = `
	<img src="http://localhost/${song.image}" alt="${song.titre}" width="100" height="100">
      <h4>${song.titre}</h4>
      <p>Artiste: ${song.artiste}</p>
      <p>Date: ${song.date}</p>
      <button onclick="playSong('http://localhost/${song.audios}')">Écouter</button>
	  <button class="like-button ${isLiked[song.id] ? 'liked' : ''}" onclick="toggleLike('chansons', ${song.id}, 'dernieres')">
        ${isLiked[song.id] ? 'Je n\'aime plus' : 'J\'aime'}
      </button>
    `;
    latestSongsContainer.appendChild(songElement);
  });
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
      if (section === 'songs') {
        await loadSongs(currentPage, 'songs');
      } else if (section === 'dernieres') {
        await loadLatestSongs('dernieres');
      } else if (section === 'top10') {
        await loadTop10Songs('top10');
      } else if (section === 'categories') {
        await loadCategorySongs(category, currentPage, 'categories');
      } else {
        displaySearchResults();
      }

      const action = isLiked ? 'retiré des favoris' : 'ajouté aux favoris';
      alert(`${type === 'song' ? 'Chanson' : 'Artiste'} ${action} avec succès! (Vues: ${viewsData.views})`);
    } else {
      throw new Error('Failed to update views');
    }
  } catch (error) {
    console.error('Error updating views:', error);
    alert('Une erreur est survenue lors de la mise à jour des vues.');
  }
}
// Charger les dernières chansons lorsque la page est chargée
document.addEventListener('DOMContentLoaded', () => {
  loadLatestSongs();
});



 function playSong(audioSrc) {
  const audioPlayer = document.getElementById('audio-player');
  audioPlayer.src = audioSrc;
  audioPlayer.play();
} 


