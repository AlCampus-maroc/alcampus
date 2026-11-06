/* =========================
   CHARGER LES DONNÉES JSON
========================= */
document.addEventListener("selectstart", function(e){e.preventDefault();});

const container = document.getElementById("donnesContainer");
const ITEMS_PER_PAGE = 6;

let currentPage = 1;
let currentdata = [];
let listData = [];

async function loadData() {

    try {

        const response = await fetch("data.json");

        if (!response.ok) {            
			throw new Error("Impossible de charger le fichier JSON");
        }

        const data = await response.json();

        listData = data.dataClass || [];
 
        displayData(listData);

    } catch (error) {

        console.error(error);
		renderPagination(0,0);
		
		const noResults = document.getElementById("noResults");
		
		noResults.style.display = "block";
		noResults.querySelector("h3").style.display = "none";
		noResults.querySelector("p").textContent = "Impossible de charger les données pour le moment.";

    }
}


/* =========================
   AFFICHER LES LICENCES
========================= */

function displayData(str) {

    currentdata = str;
    const totalPages = Math.ceil(currentdata.length / ITEMS_PER_PAGE);
	document.getElementById("lenmast").textContent = currentdata.length;

    if (currentPage > totalPages && totalPages > 0) {
        currentPage = 1;
    }

    container.innerHTML = "";

    if (currentdata.length === 0) {

        const noResults = document.getElementById("noResults");

        noResults.querySelector("h3").style.display = "block";
        noResults.querySelector("h3").textContent = "Aucune Donné trouvée";
        noResults.querySelector("p").textContent = "Aucune donnée n'est disponible pour le moment.";
        updateResultCount(0);
        renderPagination(1, 0);
        return;
    }

    // PAGINATION
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const dataToDisplay = currentdata.slice(start, end);


    // AFFICHER LES 6 Donnes
    dataToDisplay.forEach((dataClass) => {

        const originalIndex = listData.indexOf(dataClass);
        const card = document.createElement("a");

        card.href = dataClass.url;
        card.title = dataClass.title;
        card.dataset.university = dataClass.filter_university;
        card.dataset.city = dataClass.filter_ville;


        card.innerHTML = `
            <article class="donne-card">

                <div class="card-top">

                    <span class="category ${verifierDate(dataClass.limite_ins)}">
                        ${verifierDate(dataClass.limite_ins)}
                    </span>

                    <span class="deadline">
						<svg width="16" height="16"
							 viewBox="0 0 48 48"
							 role="img"
							 aria-label="Calendrier">
							<use href="#ic-calendar"></use>
						</svg> ${dataClass.public}</span>

                </div>

                <img
                    src="${dataClass.img}"
                    alt="${dataClass.title}"
                >

                <h3 dir="${dataClass.dire}">${dataClass.title}</h3>

                <p class="university">${"university" in dataClass ? dataClass.university : ""}</p>

                <p class="location">
					<svg width="16" height="16"
							 viewBox="0 0 24 24"
							 fill="none"
							 stroke="currentColor"
							 stroke-width="2"
							 stroke-linecap="round"
							 stroke-linejoin="round"
							 aria-hidden="true">
							<use href="#ic-map-pin"></use>
						</svg> 
				${dataClass.ville}</p>

                <div class="card-footer">

                    <span class="deadline">
                        ${dataClass.title_sec}
                    </span>

                    <span>Détails →</span>

                </div>

            </article>
        `;


        card.addEventListener("click", () => {
            window.location.href = dataClass.url;
        });

        container.appendChild(card);
    });


    // COMPTEUR
    updateResultCount(currentdata.length);

    // PAGINATION
    renderPagination(currentPage, totalPages);
}


/* =========================
   COMPTEUR
========================= */

function updateResultCount(count) {

    const resultCount = document.getElementById("resultCount");
    const noResults = document.getElementById("noResults");

    resultCount.textContent = `${count} résultat${count > 1 ? "s" : ""}`;

    noResults.style.display = count === 0 ? "block" : "none";
}


/* =========================
   RECHERCHE & FILTRE
========================= */

const searchInput = document.getElementById("searchInput");
const universityFilter = document.getElementById("universityFilter");
const cityFilter = document.getElementById("cityFilter");

document.getElementById("len2").textContent = universityFilter.options.length - 1;
document.getElementById("len3").textContent = cityFilter.options.length - 1;

searchInput.value = "";
universityFilter.value = "";
cityFilter.value = "";

function filterDonne() {

    const searchValue = searchInput.value.toLowerCase().trim();
    const universityValue = universityFilter.value;
    const cityValue = cityFilter.value;

    const filtered = listData.filter(dataClass => {

        const title = dataClass.title.toLowerCase();

        const matchesSearch = title.includes(searchValue);

        const matchesUniversity =
            universityValue === "" ||
            dataClass.filter_university === universityValue;

        const matchesCity =
			cityValue === "" || (dataClass.filter_ville || "")
			.split(",")
			.map(city => city.trim())
			.includes(cityValue);

        return (
            matchesSearch &&
            matchesUniversity &&
            matchesCity
        );
    });


    // نرجعو للصفحة الأولى
    currentPage = 1;

    displayData(filtered);
}


/* =========================
   EVENTS
========================= */

searchInput.addEventListener("input", filterDonne);
universityFilter.addEventListener("change", filterDonne);
cityFilter.addEventListener("change", filterDonne);

/* =========================
   INITIALISATION
========================= */

loadData();


// verifierDate
function verifierDate(dateString) {

    if (/^[a-zA-Z]/.test(dateString)) return dateString;
	
	const [jour, mois, annee] = dateString.split("/");

    const dateLimite = new Date(
        annee,
        mois - 1,
        jour
    );

    const aujourdHui = new Date();

    aujourdHui.setHours(0, 0, 0, 0);
    dateLimite.setHours(0, 0, 0, 0);

	return (aujourdHui <= dateLimite) ? "disponible" : "indisponible";
}

/* ================================
   pagination
 ================================*/

function renderPagination(currentPage, totalPages) {

    const pagination = document.getElementById("pagination");
    const pagesContainer = document.getElementById("paginationPages");
	const prev = document.getElementById("prevPage");
	const next = document.getElementById("nextPage");

    if (!pagination) return;

    pagesContainer.textContent = currentPage + " sur " + totalPages;

    // ما كايناش pagination إلا كانت صفحة وحدة
    if (totalPages <= 1) {
        pagination.style.display = "none";
        return;
    }

    pagination.style.display = "flex";
	
	prev.disabled = currentPage === 1;
	next.disabled = currentPage === totalPages;
	
}

/* =========================
   PREVIOUS -- NEXT
 =========================*/

function prevPage() {
	
	const prev = document.getElementById("prevPage");

    if (currentPage > 1) {

        currentPage--;
        displayData(currentdata);
    }
	
	document.getElementById("decouvrir").scrollIntoView({ behavior: "smooth" });
	prev.disabled = currentPage === 1;
}


function nextPage() {

	const next = document.getElementById("nextPage");
	const totalPages = Math.ceil(currentdata.length / ITEMS_PER_PAGE);

    if (currentPage < totalPages) {

        currentPage++;
        displayData(currentdata);
    }
	
	document.getElementById("decouvrir").scrollIntoView({ behavior: "smooth" });
	next.disabled = currentPage === totalPages;
}


 
 /* ================================
   MOBILE MENU
 ================================*/

const menuBtn = document.getElementById("menuBtn");
const nav = document.querySelector(".nav");

menuBtn.addEventListener("click", () => {

	nav.classList.toggle("active");

	if (nav.classList.contains("active")) {
		document.getElementById("close").style.display = "block";
		document.getElementById("menu").style.display = "none";
	} else {
		document.getElementById("menu").style.display = "block";
		document.getElementById("close").style.display = "none";
	}

});


// Fermer le menu après avoir cliqué
document.querySelectorAll(".nav a").forEach(link => {

	link.addEventListener("click", () => {

		nav.classList.remove("active");
		document.getElementById("menu").style.display = "block";
		document.getElementById("close").style.display = "none";

	});

});