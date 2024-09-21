const POETRY_API = `${API_BASE_URL}/poesie`;

document.addEventListener('DOMContentLoaded', function () {
  loadPoetry();
});

async function loadPoetry() {
  try {
    const response = await fetch(`${POETRY_API}`);
    const data = await response.json();
    if (data.poesie) {
      displayPoetry(data.poesie);
    } else {
      console.error('No poetry available');
    }
  } catch (error) {
    console.error('Error loading poetry:', error);
  }
}

function displayPoetry(poetryData) {
  const poetryContent = document.getElementById('poetry-content');
  poetryContent.innerHTML = '';
  poetryData.forEach(poem => {
    const poemElement = document.createElement('div');
    poemElement.innerHTML = `<p>${poem.texte}</p>`;
    poetryContent.appendChild(poemElement);
  });
}
