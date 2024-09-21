

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
	  <div class="mb-4">
    <h3 class="font-bold mb-2"> Arabe: </h3>
    <div lang="ar" class="bg-red-500 text-white p-4 rounded-lg text-right arabic-text" style="font-size: x-large">
   ${bouqallate.arab}
    </div>
   </div>
   <div class="mb-4">
    <h3 class="font-bold mb-2">
     Français:
    </h3>
    <div class="bg-blue-500 text-white p-4 rounded-lg">
     ${bouqallate.franc}
    </div>
   </div>
   <div class="mb-4">
    <h3 class="font-bold mb-2">
     Phonetic:
    </h3>
    <div class="bg-green-200 text-green-800 p-4 rounded-lg">
     ${bouqallate.phonetic}
    </div>
   </div>
	  
	
      `;
	  
	//essai images
  fetch('list-images.php')
  .then(response => response.json())
  .then(imageFiles => {
    const randomIndex = Math.floor(Math.random() * imageFiles.length);
    const randomFile = imageFiles[randomIndex];
    const img = document.querySelector('img');
    img.src = 'http://localhost/img_comparer/' + randomFile;
    img.alt = 'Illustration of a traditional scene';
    img.className = 'w-24 h-24 rounded-lg';
    img.height = 100;
    img.width = 100;
  })
  .catch(error => console.error('Erreur lors de la requête :', error));
// fin image	
	  
	  
    } else {
      console.error('No bouqallate available');
    }
  } catch (error) {
    console.error('Error loading bouqallate:', error);
  }
}

