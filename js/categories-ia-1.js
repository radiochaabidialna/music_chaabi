const ITEMS_PER_PAGE = 8;
let currentPage = 1;
let totalPages = 1;
let currentData = [];
const CATEGORIES_API = 'http://localhost/api/index.php/categories';

async function loadCategory() {
  const category = document.getElementById('category-select').value;
  const url = category
    ? `${CATEGORIES_API}?${category}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`
    : `${CATEGORIES_API}?page=${currentPage}&limit=${ITEMS_PER_PAGE}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (Array.isArray(data[category] || data)) {
      currentData = category ? data[category] : data;
      totalPages = data.pagination.totalPages;
      displayCategoryResults();
      updatePagination();
    } else {
      console.error('Error loading category:', 'currentData is not an array');
    }
  } catch (error) {
    console.error('Error loading category:', error);
  }
}

function changeSongsPage(newPage) {
  if (newPage >= 1 && newPage <= totalPages) {
    currentPage = newPage;
    loadCategory();
  }
}

function displayCategoryResults() {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';

  currentData.forEach(item => {
    const itemCard = document.createElement('div');
    itemCard.className = 'item-card';
    itemCard.innerHTML = `
      <div class="card">
        <img src="http://localhost/${item.image}" alt="${item.titre}" class="card-img-top">
        <div class="card-body">
          <h5 class="card-title">${item.titre}</h5>
          <p class="card-text">Artiste: ${item.artiste}</p>
          <p class="card-text">Date: ${item.date}</p>
          <p class="card-text">Vues: <span id="views-${item.id}">${item.views}</span></p>
          <p class="card-text">Catégorie: ${item.categorie}</p>
          ${item.audios ? `<button class="btn btn-primary" onclick="playSong('http://localhost/${item.audios}')">Écouter</button>` : ''}
          <button class="btn btn-secondary" onclick="updateViews('${item.categorie.toLowerCase()}', ${item.id}, ${item.views})">Like</button>
        </div>
      </div>
    `;
    resultsContainer.appendChild(itemCard);
  });
}

async function updateViews(type, id, currentViews) {
  try {
    const viewsResponse = await fetch('http://localhost/api/index.php/updateViews.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type, id })
    });

    const viewsData = await viewsResponse.json();
    if (viewsData.success) {
      // Incrémenter les vues et afficher le cœur en rouge
      const viewsElement = document.getElementById(`views-${id}`);
      viewsElement.textContent = viewsData.views;
      viewsElement.style.color = 'red';
      viewsElement.innerHTML += ' ❤️';

      // Afficher le message de remerciement
      const messageDiv = document.getElementById('like-message');
      messageDiv.textContent = 'Merci d\'avoir liké!';
      messageDiv.style.display = 'block';
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 60000); // Le message disparaît après 1 minute

      // Recharger les données de la catégorie
      loadCategory();
    } else {
      throw new Error('Failed to update views');
    }
  } catch (error) {
    console.error('Error updating views:', error);
    const messageDiv = document.getElementById('like-message');
    messageDiv.textContent = 'Une erreur est survenue lors de la mise à jour des vues.';
    messageDiv.style.display = 'block';
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 60000); // Le message disparaît après 1 minute
  }
}

function updatePagination() {
  const paginationContainer = document.getElementById('categories-pagination');
  paginationContainer.innerHTML = '';

  const maxVisiblePages = 10;
  const halfVisiblePages = Math.floor(maxVisiblePages / 2);
  let startPage = Math.max(1, currentPage - halfVisiblePages);
  let endPage = Math.min(totalPages, currentPage + halfVisiblePages);

  if (currentPage <= halfVisiblePages) {
    endPage = Math.min(totalPages, maxVisiblePages);
  } else if (currentPage >= totalPages - halfVisiblePages) {
    startPage = Math.max(1, totalPages - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.onclick = () => changeSongsPage(i);
    if (i === currentPage) {
      pageButton.className = 'active';
    }
    paginationContainer.appendChild(pageButton);
  }

  const prevButton = document.createElement('button');
  prevButton.textContent = 'Précédent';
  prevButton.onclick = () => changeSongsPage(currentPage - 1);
  prevButton.disabled = currentPage === 1;
  paginationContainer.appendChild(prevButton);

  const nextButton = document.createElement('button');
  nextButton.textContent = 'Suivant';
  nextButton.onclick = () => changeSongsPage(currentPage + 1);
  nextButton.disabled = currentPage === totalPages;
  paginationContainer.appendChild(nextButton);
}

// Ajouter le div pour le message de like
const messageDiv = document.createElement('div');
messageDiv.id = 'like-message';
document.body.appendChild(messageDiv);
