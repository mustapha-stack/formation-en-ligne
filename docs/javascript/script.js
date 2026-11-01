/* =========================================================
   CHEMIN DU FICHIER JSON
   ========================================================= */

const JSON_URL = "../javascript/formations.json";


/* =========================================================
   CHARGEMENT DES DONNÉES JSON
   ========================================================= */

async function chargerDonnees() {
    const response = await fetch('./javascript/formations.json');

    // Vérifie si la réponse du serveur est correcte
    if (!response.ok) {
        throw new Error(
            `Erreur HTTP : ${response.status} - ${response.statusText}`
        );
    }

    // Convertit le JSON en objet JavaScript
    return await response.json();
}


/* =========================================================
   AFFICHAGE DES DÉTAILS D'UNE FORMATION
   ========================================================= */

async function afficherDetailsFormation() {

    try {

        // Récupération des paramètres dans l'URL
        // Exemple : details-formation.html?id=5
        const params = new URLSearchParams(window.location.search);

        // Récupération de l'identifiant
        const formationId = parseInt(params.get('id')) || 1;

        // Chargement des formations depuis le fichier JSON
        const formations = await chargerDonnees();

        // Recherche de la formation correspondant à l'ID
        const formation = formations.find(
            f => f.id === formationId
        );

        // Vérification de l'existence de la formation
        if (!formation) {
            throw new Error("Formation introuvable.");
        }


        /* -------------------------------------------------
           NOM ET DESCRIPTION
           ------------------------------------------------- */

        const nom = document.getElementById('formation-nom');
        const description = document.getElementById(
            'formation-description'
        );

        if (nom) {
            nom.innerText = formation.nom;
        }

        if (description) {
            description.innerText = formation.description;
        }


        /* -------------------------------------------------
           1. COURS INCLUS
           ------------------------------------------------- */

        const coursContainer = document.getElementById('cours-liste');

        if (coursContainer) {

            coursContainer.innerHTML = formation.cours
                .map(c => `<li>${c}</li>`)
                .join('');

        }


        /* -------------------------------------------------
           2. ÉTAPES À COMPLÉTER
           ------------------------------------------------- */

        const etapesContainer = document.getElementById(
            'etapes-liste'
        );

        if (etapesContainer) {

            etapesContainer.innerHTML = formation.etapes
                .map(e => `
                    <li class="step-item">
                        <div class="step-content">
                            <h4>${e}</h4>
                        </div>
                    </li>
                `)
                .join('');

        }


        /* -------------------------------------------------
           3. COMPÉTENCES DÉVELOPPÉES
           ------------------------------------------------- */

        const competencesContainer = document.getElementById(
            'competences-liste'
        );

        if (competencesContainer) {

            competencesContainer.innerHTML = formation.competences
                .map(comp => `<li>${comp}</li>`)
                .join('');

        }


    } catch (error) {

        console.error(
            "Erreur lors de la récupération des détails :",
            error
        );

        const nom = document.getElementById('formation-nom');

        if (nom) {
            nom.textContent = "Impossible de charger cette formation.";
        }

    }
}


/* =========================================================
   GESTION DE LA LISTE DES FORMATIONS
   ========================================================= */

// Tableau contenant toutes les formations
let allFormations = [];

// Numéro de la page actuelle
let currentPage = 1;

// Nombre de formations affichées par page
const itemsPerPage = 6;


/* =========================================================
   CHARGEMENT DES FORMATIONS
   ========================================================= */

async function chargerFormations() {

    try {

        // Chargement des données JSON
        allFormations = await chargerDonnees();

        // Mise à jour du nombre de formations
        afficherNombreFormations();

        // Affichage de la première page
        renderPage();


    } catch (error) {

        console.error(
            "Erreur de chargement du fichier JSON :",
            error
        );

        const countContainer = document.getElementById(
            'formations-count'
        );

        if (countContainer) {
            countContainer.textContent =
                "Erreur de chargement des formations.";
        }

    }
}


/* =========================================================
   AFFICHAGE DU NOMBRE DE FORMATIONS
   ========================================================= */

function afficherNombreFormations() {

    const countContainer = document.getElementById(
        'formations-count'
    );

    if (!countContainer) return;

    const total = allFormations.length;

    countContainer.textContent =
        `${total} formation${total > 1 ? 's' : ''} trouvée${total > 1 ? 's' : ''}`;

}


/* =========================================================
   AFFICHAGE DES FORMATIONS D'UNE PAGE
   ========================================================= */

function renderPage() {

    const container = document.getElementById(
        'formations-container'
    );

    if (!container) return;

    // Calcul de l'index de début
    const startIndex = (currentPage - 1) * itemsPerPage;

    // Calcul de l'index de fin
    const endIndex = startIndex + itemsPerPage;

    // Sélection des formations de la page actuelle
    const pageItems = allFormations.slice(
        startIndex,
        endIndex
    );

    // Création des cartes de formation
    container.innerHTML = pageItems.map(formation => `

        <div class="formation-card">

            <h3>${formation.nom}</h3>

            <p>${formation.description}</p>

            <div>
                <a
                    href="details-formation.html?id=${formation.id}"
                    class="btn">
                    Détails
                </a>
            </div>

        </div>

    `).join('');

    // Affichage de la pagination
    renderPagination();

}


/* =========================================================
   AFFICHAGE DE LA PAGINATION
   ========================================================= */

function renderPagination() {

    const paginationContainer = document.getElementById(
        'pagination-container'
    );

    if (!paginationContainer) return;

    // Calcul du nombre total de pages
    const totalPages = Math.ceil(
        allFormations.length / itemsPerPage
    ) || 1;

    let html = '';


    /* -----------------------------------------------------
       BOUTON PAGE PRÉCÉDENTE
       ----------------------------------------------------- */

    html += `

        <button
            class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}"
            onclick="changerPage(${currentPage - 1})"
            ${currentPage === 1 ? 'disabled' : ''}>

            ❮

        </button>

    `;


    /* -----------------------------------------------------
       NUMÉROS DES PAGES
       ----------------------------------------------------- */

    const pages = getPageNumbers(
        currentPage,
        totalPages
    );

    pages.forEach(p => {

        if (p === '...') {

            html += `
                <span class="pagination-dots">...</span>
            `;

        } else {

            html += `

                <button
                    class="pagination-btn ${p === currentPage ? 'active' : ''}"
                    onclick="changerPage(${p})">

                    ${p}

                </button>

            `;

        }

    });


    /* -----------------------------------------------------
       BOUTON PAGE SUIVANTE
       ----------------------------------------------------- */

    html += `

        <button
            class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}"
            onclick="changerPage(${currentPage + 1})"
            ${currentPage === totalPages ? 'disabled' : ''}>

            ❯

        </button>

    `;


    // Insertion du HTML
    paginationContainer.innerHTML = html;

}


/* =========================================================
   CHANGEMENT DE PAGE
   ========================================================= */

function changerPage(page) {

    const totalPages = Math.ceil(
        allFormations.length / itemsPerPage
    );

    // Vérification du numéro de page
    if (page < 1 || page > totalPages) {
        return;
    }

    // Mise à jour de la page actuelle
    currentPage = page;

    // Affichage des nouvelles formations
    renderPage();

    // Défilement vers le compteur
    const countContainer = document.getElementById(
        'formations-count'
    );

    if (countContainer) {

        countContainer.scrollIntoView({
            behavior: 'smooth'
        });

    }

}


/* =========================================================
   CALCUL DES NUMÉROS DE PAGES
   ========================================================= */

function getPageNumbers(current, total) {

    // Si le nombre de pages est inférieur ou égal à 7
    if (total <= 7) {

        return Array.from(
            { length: total },
            (_, i) => i + 1
        );

    }


    // Si l'utilisateur est au début
    if (current <= 3) {

        return [
            1, 2, 3, 4, 5, '...', total
        ];

    }


    // Si l'utilisateur est à la fin
    if (current >= total - 2) {

        return [
            1,
            '...',
            total - 4,
            total - 3,
            total - 2,
            total - 1,
            total
        ];

    }


    // Si l'utilisateur est au milieu
    return [
        1,
        '...',
        current - 1,
        current,
        current + 1,
        '...',
        total
    ];

}


/* =========================================================
   BOUTON RETOUR EN HAUT
   ========================================================= */

function initialiserRetourEnHaut() {

    const scrollTopBtn = document.getElementById(
        'scrollTopBtn'
    );

    // Si le bouton n'existe pas sur cette page
    if (!scrollTopBtn) return;


    // Détection du défilement
    window.addEventListener('scroll', () => {

        if (window.scrollY > 300) {

            scrollTopBtn.classList.add('show');

        } else {

            scrollTopBtn.classList.remove('show');

        }

    });


    // Clic sur le bouton
    scrollTopBtn.addEventListener('click', () => {

        window.scrollTo({

            top: 0,

            behavior: 'smooth'

        });

    });

}


/* =========================================================
   FORMULAIRE DE CONTACT
   ========================================================= */

function initialiserFormulaire() {

    const fullname = document.getElementById('fullname');

    const email = document.getElementById('email');

    const message = document.getElementById('message');

    const submitBtn = document.getElementById('submitBtn');

    const contactForm = document.querySelector('.contact-form');

    const confirmationMessage = document.getElementById(
        'confirmationMessage'
    );


    // Vérifie que tous les éléments existent
    if (
        !fullname ||
        !email ||
        !message ||
        !submitBtn ||
        !contactForm
    ) {
        return;
    }


    /* -----------------------------------------------------
       VÉRIFICATION DU FORMULAIRE
       ----------------------------------------------------- */

    function verifierFormulaire() {

        if (

            fullname.value.trim() !== "" &&

            email.value.trim() !== "" &&

            message.value.trim() !== "" &&

            email.checkValidity()

        ) {

            submitBtn.disabled = false;

        } else {

            submitBtn.disabled = true;

        }

    }


    // Vérification pendant la saisie
    fullname.addEventListener(
        'input',
        verifierFormulaire
    );

    email.addEventListener(
        'input',
        verifierFormulaire
    );

    message.addEventListener(
        'input',
        verifierFormulaire
    );


    /* -----------------------------------------------------
       ENVOI DU FORMULAIRE
       ----------------------------------------------------- */

    contactForm.addEventListener('submit', function(event) {

        // Empêche le rechargement de la page
        event.preventDefault();

        // Message de confirmation
        if (confirmationMessage) {

            confirmationMessage.textContent =
                "Votre message a été envoyé !";

        }

        // Réinitialisation du formulaire
        contactForm.reset();

        // Désactivation du bouton
        submitBtn.disabled = true;

    });

}


/* =========================================================
   INITIALISATION GÉNÉRALE
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // Vérifie si on est sur la page des détails
    if (document.getElementById('formation-nom')) {

        afficherDetailsFormation();

    }

    // Vérifie si on est sur la page de la liste
    if (document.getElementById('formations-container')) {

        chargerFormations();

    }

    // Initialisation du bouton retour en haut
    initialiserRetourEnHaut();

    // Initialisation du formulaire
    initialiserFormulaire();

});