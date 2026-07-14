// CORRECTION BUG SAFARI : Bloque la chorégraphie intempestive au chargement
document.body.classList.add('is-loading');
window.addEventListener('load', () => {
    setTimeout(() => {
        document.body.classList.remove('is-loading');
    }, 150); // Retire le blocage après un instant
});
document.addEventListener('DOMContentLoaded', () => {
    
    /* =========================================
       1. SCROLL HORIZONTAL À LA MOLETTE (Galerie uniquement)
       ========================================= */
    const gallery = document.getElementById('gallery');
    if (gallery) {
        gallery.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault(); 
                gallery.scrollLeft += e.deltaY;
            }
        });
    }

    /* =========================================
       2. LOGIQUE DU MENU DE FILTRES (TAGS)
       ========================================= */
    const brandContainer = document.getElementById('brandContainer');
    const filterMenu = document.getElementById('filterMenu');
    const filterIcons = document.querySelectorAll('.f-icon');
    const resetFilterBtn = document.getElementById('resetFilterBtn');
    const galleryItems = document.querySelectorAll('.gallery-item'); // Sert aussi pour tes photos de profil !

    let currentFilter = null; 
    let isAnimatingReturn = false; 

// --- GESTION DU MENU (SURVOL SUR ORDI / CLIC SUR MOBILE) ---
if (brandContainer && filterMenu) {
        
    // 1. Pour les ordinateurs (écrans > 1024px) : On garde le survol
    brandContainer.addEventListener('mouseenter', () => {
        if (window.innerWidth > 1024) {
            if (!currentFilter && !isAnimatingReturn) filterMenu.classList.add('is-active');
        }
    });
    brandContainer.addEventListener('mouseleave', () => {
        if (window.innerWidth > 1024) {
            if (!currentFilter && !isAnimatingReturn) filterMenu.classList.remove('is-active');
        }
    });

    // 2. Pour les téléphones et tablettes (écrans <= 1024px) : Bouton on/off tactile
    brandContainer.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
            if (!currentFilter && !isAnimatingReturn) {
                // La vraie magie infaillible : ouvre si fermé, ferme si ouvert !
                filterMenu.classList.toggle('is-active');
            }
        }
    });
}

    // --- CLIC SUR UNE ICÔNE DE CATÉGORIE ---
    filterIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const tag = icon.getAttribute('data-tag');
            currentFilter = tag;

            if (filterMenu) {
                filterMenu.classList.add('mode-selected');
                filterMenu.classList.add('is-active'); 
            }
            
            filterIcons.forEach(icn => {
                if(icn !== icon) icn.classList.add('hidden-icon');
            });

            galleryItems.forEach(item => {
                // On s'assure qu'on ne cache pas la photo de profil si on n'est pas dans la galerie
                if (item.classList.contains('profile-interactive-container')) return;
                
                const itemCategory = item.getAttribute('data-category');
                if (itemCategory === tag) item.classList.remove('hidden-by-filter'); 
                else item.classList.add('hidden-by-filter'); 
            });
        });
    });

    // --- CLIC SUR LA CROIX (DÉSÉLECTION) ---
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentFilter = null;
            isAnimatingReturn = true; 

            if (filterMenu) {
                filterMenu.classList.remove('mode-selected');
                filterMenu.classList.add('is-active'); 
            }

            filterIcons.forEach(icn => icn.classList.remove('hidden-icon'));
            galleryItems.forEach(item => item.classList.remove('hidden-by-filter'));

            setTimeout(() => {
                isAnimatingReturn = false;
                if (brandContainer && !brandContainer.matches(':hover')) {
                    filterMenu.classList.remove('is-active');
                }
            }, 1200); 
        });
    }

    /* =========================================
       3. INTERACTION SUR LES IMAGES (Clic pour changer)
       Fonctionne pour la galerie ET la photo de profil
       ========================================= */
    galleryItems.forEach(item => {
        let currentImgIndex = 0;
        
        item.addEventListener('click', () => {
            const imagesData = item.getAttribute('data-images');
            if (imagesData) {
                // Ce try/catch empêche le site de planter si tu oublies un guillemet dans le HTML !
                try {
                    const imagesArray = JSON.parse(imagesData); 
                    if (imagesArray && imagesArray.length > 1) {
                        currentImgIndex = (currentImgIndex + 1) % imagesArray.length;
                        const imgElement = item.querySelector('img');
                        if (imgElement) imgElement.src = imagesArray[currentImgIndex];
                        item.classList.add('no-hover');
                    }
                } catch (error) {
                    console.error("Erreur dans les images de :", item, error);
                }
            }
        });

        item.addEventListener('mouseleave', () => {
            item.classList.remove('no-hover');
        });
    });
    /* =========================================
       4. GESTION DU FORMULAIRE DE CONTACT
       ========================================= */
       const contactForm = document.querySelector('.contact-form');
       const submitBtn = document.querySelector('.contact-btn');
   
       if (contactForm && submitBtn) {
           contactForm.addEventListener('submit', async (e) => {
               e.preventDefault(); // Empêche le navigateur de changer de page
               
               // 1. On change le texte pendant le chargement
               submitBtn.textContent = 'ENVOI EN COURS...';
               submitBtn.style.opacity = '0.7';
               submitBtn.style.pointerEvents = 'none'; // Empêche de cliquer deux fois
   
               try {
                   // 2. On envoie les données à Formspree en arrière-plan
                   const response = await fetch(contactForm.action, {
                       method: 'POST',
                       body: new FormData(contactForm),
                       headers: {
                           'Accept': 'application/json'
                       }
                   });
   
                   // 3. Si ça a marché, on met à jour le bouton
                   if (response.ok) {
                       submitBtn.textContent = 'ENVOYÉ !';
                       submitBtn.style.opacity = '1';
                       submitBtn.style.backgroundColor = '#000'; // Le bouton reste noir
                       submitBtn.style.color = '#fff';
                       contactForm.reset(); // Vide les champs du formulaire
                   } else {
                       submitBtn.textContent = 'ERREUR...';
                       submitBtn.style.opacity = '1';
                       submitBtn.style.pointerEvents = 'auto'; // Permet de réessayer
                   }
               } catch (error) {
                   submitBtn.textContent = 'ERREUR...';
                   submitBtn.style.opacity = '1';
                   submitBtn.style.pointerEvents = 'auto';
               }
           });
       }
       /* =========================================
       5. INFOBULLES AU SURVOL DES ICÔNES
       ========================================= */
    const tooltip = document.getElementById('cursor-tooltip');
    if (tooltip && filterIcons.length > 0) {
        filterIcons.forEach(icon => {
            icon.addEventListener('mousemove', (e) => {
                const tag = icon.getAttribute('data-tag'); // Récupère le nom (paint, video...)
                if (tag) {
                    tooltip.textContent = tag;
                    // Positionne l'infobulle juste au-dessus du curseur
                    tooltip.style.left = (e.clientX + 10) + 'px'; 
                    tooltip.style.top = (e.clientY - 25) + 'px';
                    tooltip.style.opacity = '1';
                }
            });
            icon.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0'; // Cache quand on part
            });
        });
    }
});
// Préchargement silencieux des images de la galerie
window.addEventListener('load', () => {
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        const imagesData = item.getAttribute('data-images');
        if (imagesData) {
            const imagesArray = JSON.parse(imagesData);
            imagesArray.forEach(imgSrc => {
                const img = new Image();
                img.src = imgSrc; // Le navigateur la met en cache immédiatement
            });
        }
    });
});
