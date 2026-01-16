/* =====================================
   DATA STORAGE & INITIALIZATION
===================================== */
const STORAGE_KEYS = {
    MOVIES: 'movies',
    DIRECTORS: 'directors'
};

let movies = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOVIES)) || [];
let directors = JSON.parse(localStorage.getItem(STORAGE_KEYS.DIRECTORS)) || [];
let editingMovieId = null;
let editingDirectorId = null;
let genreChart = null;
let ratingChart = null;

// Initialize default directors if empty
if (directors.length === 0) {
    directors = [
        { id: 1, name: 'Paul Feig', nationality: 'Américain', bio: 'Réalisateur de films à succès' },
        { id: 2, name: 'Quentin Tarantino', nationality: 'Américain', bio: 'Maître du cinéma indépendant' },
        { id: 3, name: 'Steven Spielberg', nationality: 'Américain', bio: 'Légende du cinéma hollywoodien' },
        { id: 4, name: 'Martin Scorsese', nationality: 'Américain', bio: 'Icône du cinéma américain' }
    ];
    localStorage.setItem(STORAGE_KEYS.DIRECTORS, JSON.stringify(directors));
}

/* =====================================
   NAVIGATION
===================================== */
document.querySelectorAll('.navbar .menu li').forEach(item => {
    item.addEventListener('click', () => {
        const section = item.dataset.section;

        // Update navbar active class
        document.querySelectorAll('.navbar .menu li').forEach(li => li.classList.remove('active'));
        item.classList.add('active');

        // Show section
        document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(section).classList.add('active');

        // Update dashboard if needed
        if (section === 'dashboard') updateDashboard();
    });
});

/* =====================================
   MOVIE FUNCTIONS
===================================== */
function openMovieModal(movieId = null) {
    const modal = document.getElementById('movieModal');
    const title = document.getElementById('movieModalTitle');
    const form = document.getElementById('movieForm');

    form.reset();
    clearErrors();

    if (movieId) {
        const movie = movies.find(m => m.id === movieId);
        title.textContent = 'Modifier le Film';
        document.getElementById('movieId').value = movie.id;
        document.getElementById('movieTitle').value = movie.title;
        document.getElementById('movieYear').value = movie.year;
        document.getElementById('movieDuration').value = movie.duration;
        document.getElementById('movieGenre').value = movie.genre;
        document.getElementById('movieRating').value = movie.rating;
        document.getElementById('movieDirector').value = movie.director;
        document.getElementById('movieSynopsis').value = movie.synopsis || '';
        document.getElementById('moviePoster').value = movie.poster || '';
        editingMovieId = movieId;
    } else {
        title.textContent = 'Ajouter un Film';
        editingMovieId = null;
    }

    loadDirectorOptions();
    modal.classList.add('active');
}

function closeMovieModal() {
    document.getElementById('movieModal').classList.remove('active');
    editingMovieId = null;
}

function saveMovie() {
    if (!validateMovieForm()) return;

    const movie = {
        id: editingMovieId || Date.now(),
        title: document.getElementById('movieTitle').value.trim(),
        year: parseInt(document.getElementById('movieYear').value),
        duration: parseInt(document.getElementById('movieDuration').value),
        genre: document.getElementById('movieGenre').value,
        rating: parseFloat(document.getElementById('movieRating').value),
        director: document.getElementById('movieDirector').value,
        synopsis: document.getElementById('movieSynopsis').value.trim(),
        poster: document.getElementById('moviePoster').value.trim() || 'https://via.placeholder.com/300x450?text=Film',
        createdAt: editingMovieId ? movies.find(m => m.id === editingMovieId).createdAt : new Date().toISOString()
    };

    if (editingMovieId) {
        const index = movies.findIndex(m => m.id === editingMovieId);
        movies[index] = movie;
    } else {
        movies.push(movie);
    }

    localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(movies));
    closeMovieModal();
    displayMovies();
    updateDashboard();
}

function validateMovieForm() {
    let isValid = true;
    clearErrors();

    const title = document.getElementById('movieTitle').value.trim();
    const year = parseInt(document.getElementById('movieYear').value);
    const duration = parseInt(document.getElementById('movieDuration').value);
    const genre = document.getElementById('movieGenre').value;
    const rating = parseFloat(document.getElementById('movieRating').value);
    const director = document.getElementById('movieDirector').value;

    if (!title) { showError('movieTitle', 'Le titre est requis'); isValid = false; }
    if (!year || year < 1900 || year > 2026) { showError('movieYear', 'Année invalide'); isValid = false; }
    if (!duration || duration < 1) { showError('movieDuration', 'Durée invalide'); isValid = false; }
    if (!genre) { showError('movieGenre', 'Le genre est requis'); isValid = false; }
    if (!rating || rating < 0 || rating > 10) { showError('movieRating', 'Note invalide (0-10)'); isValid = false; }
    if (!director) { showError('movieDirector', 'Le réalisateur est requis'); isValid = false; }

    return isValid;
}

function deleteMovie(movieId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce film ?')) return;
    movies = movies.filter(m => m.id !== movieId);
    localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(movies));
    displayMovies();
    updateDashboard();
}

function showMovieDetail(movieId) {
    const movie = movies.find(m => m.id === movieId);
    const director = directors.find(d => d.id == movie.director);
    const html = `
        <div style="text-align:center">
            <img src="${movie.poster}" class="movie-detail-poster" alt="${movie.title}">
        </div>
        <h3 style="color:#e50914; margin-bottom:20px">${movie.title}</h3>
        <div class="detail-info">
            <div class="detail-row"><strong>Année:</strong> <span>${movie.year}</span></div>
            <div class="detail-row"><strong>Durée:</strong> <span>${movie.duration} minutes</span></div>
            <div class="detail-row"><strong>Genre:</strong> <span>${movie.genre}</span></div>
            <div class="detail-row"><strong>Note:</strong> <span>⭐ ${movie.rating}/10</span></div>
            <div class="detail-row"><strong>Réalisateur:</strong> <span>${director?.name || 'N/A'}</span></div>
            <div class="detail-row"><strong>Synopsis:</strong> <span>${movie.synopsis || 'Aucun synopsis'}</span></div>
            <div class="detail-row"><strong>Ajouté le:</strong> <span>${new Date(movie.createdAt).toLocaleDateString('fr-FR')}</span></div>
        </div>
    `;
    document.getElementById('detailModalBody').innerHTML = html;
    document.getElementById('detailModal').classList.add('active');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('active');
}

function displayMovies() {
    const searchTerm = document.getElementById('searchMovie').value.toLowerCase();
    const sortValue = document.getElementById('sortMovie').value;
    const filterGenre = document.getElementById('filterGenre').value;

    let filtered = movies.filter(m => 
        (m.title.toLowerCase().includes(searchTerm) || (m.synopsis?.toLowerCase().includes(searchTerm))) &&
        (!filterGenre || m.genre === filterGenre)
    );

    // Sorting
    const sortMap = {
        'title-asc': (a,b)=> a.title.localeCompare(b.title),
        'title-desc': (a,b)=> b.title.localeCompare(a.title),
        'year-asc': (a,b)=> a.year-b.year,
        'year-desc': (a,b)=> b.year-a.year,
        'rating-asc': (a,b)=> a.rating-b.rating,
        'rating-desc': (a,b)=> b.rating-a.rating
    };
    if (sortMap[sortValue]) filtered.sort(sortMap[sortValue]);

    const container = document.getElementById('moviesList');
    if (!filtered.length) {
        container.innerHTML = '<p style="text-align:center; padding:40px; color:#888;">Aucun film trouvé</p>';
        return;
    }

    container.innerHTML = filtered.map(movie => `
        <div class="movie-card" onclick="showMovieDetail(${movie.id})">
            <img src="${movie.poster}" class="movie-poster" alt="${movie.title}">
            <div class="movie-body">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-year">${movie.year} • ${movie.genre}</div>
                <div class="movie-rating">⭐ ${movie.rating}/10</div>
                <div class="movie-actions">
                    <button class="btn btn-sm btn-warning" onclick="event.stopPropagation(); openMovieModal(${movie.id})">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteMovie(${movie.id})">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');
}

/* =====================================
   DIRECTOR FUNCTIONS
===================================== */
function openDirectorModal(directorId = null) {
    const modal = document.getElementById('directorModal');
    const title = document.getElementById('directorModalTitle');
    const form = document.getElementById('directorForm');

    form.reset();

    if (directorId) {
        const director = directors.find(d => d.id === directorId);
        title.textContent = 'Modifier le Réalisateur';
        document.getElementById('directorId').value = director.id;
        document.getElementById('directorName').value = director.name;
        document.getElementById('directorNationality').value = director.nationality;
        document.getElementById('directorBio').value = director.bio || '';
        editingDirectorId = directorId;
    } else {
        title.textContent = 'Ajouter un Réalisateur';
        editingDirectorId = null;
    }

    modal.classList.add('active');
}

function closeDirectorModal() {
    document.getElementById('directorModal').classList.remove('active');
    editingDirectorId = null;
}

function saveDirector() {
    const name = document.getElementById('directorName').value.trim();
    const nationality = document.getElementById('directorNationality').value.trim();
    const bio = document.getElementById('directorBio').value.trim();

    if (!name || !nationality) return alert('Le nom et la nationalité sont requis');

    const director = { id: editingDirectorId || Date.now(), name, nationality, bio };

    if (editingDirectorId) {
        const index = directors.findIndex(d => d.id === editingDirectorId);
        directors[index] = director;
    } else {
        directors.push(director);
    }

    localStorage.setItem(STORAGE_KEYS.DIRECTORS, JSON.stringify(directors));
    closeDirectorModal();
    displayDirectors();
    loadDirectorOptions();
    updateDashboard();
    alert('Réalisateur ajouté avec succès !');
}

function deleteDirector(directorId) {
    if (movies.some(m => m.director == directorId)) {
        return alert('Impossible de supprimer ce réalisateur car il a des films associés');
    }
    if (!confirm('Êtes-vous sûr ?')) return;
    directors = directors.filter(d => d.id !== directorId);
    localStorage.setItem(STORAGE_KEYS.DIRECTORS, JSON.stringify(directors));
    displayDirectors();
    loadDirectorOptions();
    updateDashboard();
}

function displayDirectors() {
    const tbody = document.getElementById('directorsList');
    if (!directors.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">Aucun réalisateur</td></tr>';
        return;
    }

    tbody.innerHTML = directors.map(d => {
        const movieCount = movies.filter(m => m.director == d.id).length;
        return `
            <tr>
                <td style="color:#e50914"><strong>${d.name}</strong></td>
                <td>${d.nationality}</td>
                <td>${movieCount}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="openDirectorModal(${d.id})">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteDirector(${d.id})">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

function loadDirectorOptions() {
    const select = document.getElementById('movieDirector');
    select.innerHTML = '<option value="">Sélectionner un réalisateur</option>' +
        directors.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
}

/* =====================================
   DASHBOARD & CHARTS
===================================== */
function updateDashboard() {
    document.getElementById('kpi-total-movies').textContent = movies.length;

    const avgRating = movies.length > 0
        ? (movies.reduce((sum, m) => sum + m.rating, 0) / movies.length).toFixed(1)
        : '0';
    document.getElementById('kpi-avg-rating').textContent = avgRating;

    document.getElementById('kpi-directors').textContent = directors.length;

    const recentMovies = movies.filter(m => m.year >= 2024).length;
    document.getElementById('kpi-recent-movies').textContent = recentMovies;

    updateGenreChart();
    updateRatingChart();
}

function updateGenreChart() {
    const ctx = document.getElementById('genreChart');
    if (genreChart) genreChart.destroy();

    const genres = ['Action','Comédie','Drame','Science-Fiction','Horreur','Thriller','Animation'];
    const counts = genres.map(g => movies.filter(m => m.genre === g).length);

    genreChart = new Chart(ctx, {
        type: 'bar',
        data: { labels: genres, datasets: [{ label:'Nombre de films', data: counts, backgroundColor:[
            'rgba(229,9,20,0.8)','rgba(210, 177, 79, 0.8)','rgba(76,175,80,0.8)','rgba(33,150,243,0.8)',
            'rgba(156,39,176,0.8)','rgba(255,152,0,0.8)','rgba(103,58,183,0.8)'
        ]}]},
        options:{responsive:true, maintainAspectRatio:false,
            scales:{y:{beginAtZero:true,ticks:{color:'#ccc'},grid:{color:'#2a2a3e'}},
                    x:{ticks:{color:'#ccc'},grid:{color:'#2a2a3e'}}},
            plugins:{legend:{display:false}}}
    });
}

function updateRatingChart() {
    const ctx = document.getElementById('ratingChart');
    if (ratingChart) ratingChart.destroy();

    const topMovies = [...movies].sort((a,b)=>b.rating-a.rating).slice(0,10);

    ratingChart = new Chart(ctx, {
        type:'line',
        data:{ labels: topMovies.map(m=>m.title.substring(0,20)),
               datasets:[{label:'Note',data: topMovies.map(m=>m.rating),
               borderColor:'#e50914', backgroundColor:'rgba(229,9,20,0.1)', tension:0.4, fill:true,
               pointBackgroundColor:'#e50914', pointRadius:5}]},
        options:{responsive:true, maintainAspectRatio:false,
            scales:{y:{beginAtZero:true,max:10,ticks:{color:'#ccc'},grid:{color:'#2a2a3e'}},
                    x:{ticks:{color:'#ccc',maxRotation:45,minRotation:45},grid:{color:'#2a2a3e'}}},
            plugins:{legend:{labels:{color:'#ccc'}}}
        }
    });
}

/* =====================================
   UTILITY FUNCTIONS
===================================== */
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(fieldId+'Error');
    field.classList.add('error');
    if(errorDiv) errorDiv.textContent = message;
}

function clearErrors() {
    document.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.error-message').forEach(el => el.textContent='');
}

/* =====================================
   EVENT LISTENERS
===================================== */
document.getElementById('searchMovie').addEventListener('input', displayMovies);
document.getElementById('sortMovie').addEventListener('change', displayMovies);
document.getElementById('filterGenre').addEventListener('change', displayMovies);

// API search event listener
document.getElementById('apiSearchBtn').addEventListener('click', searchOMDB);
document.getElementById('apiSearchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchOMDB();
});

/* =====================================
   API OMDB FUNCTIONS
===================================== */
async function searchOMDB() {
    const query = document.getElementById('apiSearchInput').value.trim();
    if (!query) return alert('Veuillez entrer un titre de film');

    const apiKey = '629eafda';
    const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${apiKey}`;

    console.log('Searching OMDB for:', query);
    console.log('API URL:', url);

    try {
        const response = await fetch(url);
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('API Response:', data);

        if (data.Response === 'True') {
            displayApiMovies(data.Search);
        } else {
            console.error('API Error:', data.Error);
            alert('Aucun film trouvé ou erreur API: ' + (data.Error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Erreur API OMDB:', error);
        alert('Erreur lors de la recherche: ' + error.message);
    }
}

function displayApiMovies(movies) {
    const container = document.getElementById('apiMoviesList');
    container.innerHTML = movies.map(movie => `
        <div class="movie-card" onclick="importMovie('${movie.imdbID}')">
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=Film'}" class="movie-poster" alt="${movie.Title}">
            <div class="movie-body">
                <div class="movie-title">${movie.Title}</div>
                <div class="movie-year">${movie.Year}</div>
                <div class="movie-rating">⭐ ${movie.imdbRating || 'N/A'}</div>
                <div class="movie-actions">
                    <button class="btn btn-sm btn-success" onclick="event.stopPropagation(); importMovie('${movie.imdbID}')">Importer</button>
                </div>
            </div>
        </div>
    `).join('');
}

async function importMovie(imdbID) {
    const apiKey = '629eafda';
    const url = `https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const movie = await response.json();

        if (movie.Response === 'True') {
            // Check if movie already exists
            const existing = movies.find(m => m.title.toLowerCase() === movie.Title.toLowerCase());
            if (existing) return alert('Ce film existe déjà');

            // Map OMDB data to our format
            const newMovie = {
                id: Date.now(),
                title: movie.Title,
                year: parseInt(movie.Year),
                duration: parseInt(movie.Runtime) || 120,
                genre: movie.Genre.split(',')[0].trim(),
                rating: parseFloat(movie.imdbRating) || 0,
                director: findOrCreateDirector(movie.Director),
                synopsis: movie.Plot,
                poster: movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=Film',
                createdAt: new Date().toISOString()
            };

            movies.push(newMovie);
            localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(movies));
            displayMovies();
            updateDashboard();
            alert('Film importé avec succès !');
        }
    } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        alert('Erreur lors de l\'import du film');
    }
}

function findOrCreateDirector(directorName) {
    const director = directors.find(d => d.name.toLowerCase() === directorName.toLowerCase());
    if (director) return director.id;

    // Create new director
    const newDirector = {
        id: Date.now(),
        name: directorName,
        nationality: 'Inconnue',
        bio: ''
    };
    directors.push(newDirector);
    localStorage.setItem(STORAGE_KEYS.DIRECTORS, JSON.stringify(directors));
    return newDirector.id;
}

/* =====================================
   INITIALIZE
===================================== */
displayMovies();
displayDirectors();
loadDirectorOptions();
updateDashboard();
