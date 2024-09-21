const TOP10_API = `${API_BASE_URL}/top10`;

document.addEventListener('DOMContentLoaded', function () {
  loadTop10Songs();
});

// Fonctionnalités liées au top 10
async function loadTop10Songs(section) {
  try {
    const response = await fetch(TOP10_API);
    const data = await response.json();
    if (data.top10) {
      const isLiked = {};
      data.top10.forEach(song => {
        isLiked[song.id] = localStorage.getItem(`song_${song.id}_liked`) === 'true';
      });
      displayTop10Songs(data.top10, isLiked);
    } else {
      console.error('No latest top10 available');
    }
  } catch (error) {
    console.error('Error loading Top10 songs:', error);
  }
}

function displayTop10Songs(data, isLiked) {
  const top10List = document.getElementById('top10-list');
  top10List.innerHTML = '';
  data.forEach((song, index) => {
    const songCard = document.createElement('div');
    songCard.className = 'song-card';
    songCard.innerHTML = `
	<img src="http://localhost/${song.image}" alt="${song.titre}" width="100" height="100">
      <h3>${index + 1}. ${song.titre}</h3>
      <p>Artiste: ${song.artiste}</p>
      <p>Likes: ${song.views}</p>
      <button onclick="playSong('http://localhost/${song.audios}')">Écouter</button>
      <button class="like-button ${isLiked[song.id] ? 'liked' : ''}" onclick="toggleLike('chansons', ${song.id}, 'top10')">
        ${isLiked[song.id] ? 'Je n\'aime plus' : 'J\'aime'}
      </button>
    `;
    top10List.appendChild(songCard);
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
        await loadSongs(currentPage, 'top10');
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



