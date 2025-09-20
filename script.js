// Initialize the application when the window loads
window.onload = async function() {
    try {
        // Display loading message
        const resultElement = document.getElementById('result');
        resultElement.textContent = "Loading movie data...";
        resultElement.className = 'loading';
        
        // Load data
        await loadData();
        
        // Populate dropdown and update status
        populateMoviesDropdown();
        resultElement.textContent = "Data loaded. Please select a movie.";
        resultElement.className = 'success';
    } catch (error) {
        console.error('Initialization error:', error);
        // Error message already set in data.js
    }
};

// Populate the movies dropdown with sorted movie titles
function populateMoviesDropdown() {
    const selectElement = document.getElementById('movie-select');
    
    // Clear existing options except the first placeholder
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }
    
    // Sort movies alphabetically by title
    const sortedMovies = [...movies].sort((a, b) => a.title.localeCompare(b.title));
    
    // Add movies to dropdown
    sortedMovies.forEach(movie => {
        const option = document.createElement('option');
        option.value = movie.id;
        option.textContent = movie.title;
        selectElement.appendChild(option);
    });
}

// Main recommendation function
// Main recommendation function
function getRecommendations() {
    const resultElement = document.getElementById('result');
    
    try {
        // Step 1: Get user input
        const selectElement = document.getElementById('movie-select');
        const selectedMovieId = parseInt(selectElement.value);
        
        if (isNaN(selectedMovieId)) {
            resultElement.textContent = "Please select a movie first.";
            resultElement.className = 'error';
            return;
        }
        
        // Step 2: Find the liked movie
        const likedMovie = movies.find(movie => movie.id === selectedMovieId);
        if (!likedMovie) {
            resultElement.textContent = "Error: Selected movie not found in database.";
            resultElement.className = 'error';
            return;
        }
        
        // Show loading message while processing
        resultElement.textContent = "Calculating recommendations...";
        resultElement.className = 'loading';
        
        setTimeout(() => {
            try {
                // --- NEW: функции для косинусного сходства ---
                const cosineSimilarity = (a, b) => {
                    // защита от некорректных данных
                    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return 0;

                    let dot = 0;
                    let normA = 0;
                    let normB = 0;

                    for (let i = 0; i < a.length; i++) {
                        const ai = a[i] || 0;
                        const bi = b[i] || 0;
                        dot += ai * bi;
                        normA += ai * ai;
                        normB += bi * bi;
                    }

                    const denom = Math.sqrt(normA) * Math.sqrt(normB);
                    return denom > 0 ? dot / denom : 0;
                };

                // если по какой-то причине genreVector нет — построим на лету
                const buildVectorFromGenres = (movie) => {
                    if (Array.isArray(movie.genreVector)) return movie.genreVector;
                    const set = new Set(movie.genres || []);
                    return genreNames.map(name => (set.has(name) ? 1 : 0));
                };

                const likedVec = buildVectorFromGenres(likedMovie);

                // Step 3: Список кандидатов
                const candidateMovies = movies.filter(movie => movie.id !== likedMovie.id);
                
                // Step 4: Считаем косинусное сходство
                const scoredMovies = candidateMovies.map(candidate => {
                    const candVec = buildVectorFromGenres(candidate);
                    const score = cosineSimilarity(likedVec, candVec);
                    return { ...candidate, score };
                });
                
                // Step 5: Сортировка по score
                scoredMovies.sort((a, b) => b.score - a.score);
                
                // Step 6: Топ-N рекомендаций
                const TOP_N = 2; // при желании увеличьте до 5
                const topRecommendations = scoredMovies.slice(0, TOP_N).filter(m => m.score > 0);
                
                // Step 7: Вывод
                if (topRecommendations.length > 0) {
                    const recommendationTitles = topRecommendations.map(movie => movie.title);
                    resultElement.textContent = `Because you liked "${likedMovie.title}", we recommend (cosine): ${recommendationTitles.join(', ')}`;
                    resultElement.className = 'success';
                } else {
                    resultElement.textContent = `No recommendations found for "${likedMovie.title}" using cosine similarity.`;
                    resultElement.className = 'error';
                }
            } catch (error) {
                console.error('Error in recommendation calculation:', error);
                resultElement.textContent = "An error occurred while calculating recommendations.";
                resultElement.className = 'error';
            }
        }, 100);
    } catch (error) {
        console.error('Error in getRecommendations:', error);
        resultElement.textContent = "An unexpected error occurred.";
        resultElement.className = 'error';
    }
}
