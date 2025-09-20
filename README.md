# 🎬 Content-Based Movie Recommender (with Cosine Similarity)

This project is a **content-based movie recommender system** using the **MovieLens dataset** (`u.item` and `u.data`).  
It was originally based on **Jaccard similarity** and has been modified to use **Cosine similarity**.

---

## 📂 Project Files
```
├── index.html       # Main UI (unchanged)
├── style.css        # Styling (unchanged)
├── data.js          # Loads and parses movie/rating data
├── script.js        # Main logic for recommendations
├── u.item           # Movie metadata (MovieLens dataset)
├── u.data           # Ratings data (MovieLens dataset)
```

---

## 🔄 What Was Changed (Function-Level)

### 1. `data.js`
#### Function: `parseItemData(text)`
- **Before:**  
  Parsed genres from `u.item` into a list of genre names:  
  ```js
  const genres = genreNames.filter((_, index) => genreValues[index] === 1);
  movies.push({ id, title, genres });
  ```

- **After (Changed):**  
  Added creation of a **binary genre vector** for cosine similarity:  
  ```js
  const genreVector = genreValues.map(v => (v === 1 ? 1 : 0));
  movies.push({ id, title, genres, genreVector });
  ```
  Now each movie stores both:
  - `genres` → human-readable names (for display)  
  - `genreVector` → numeric vector (for cosine similarity calculation)

---

### 2. `script.js`
#### Function: `getRecommendations()`
- **Before (Jaccard):**  
  Calculated similarity using **set intersection / union**:
  ```js
  const intersection = new Set([...likedGenres].filter(genre => candidateGenres.has(genre)));
  const union = new Set([...likedGenres, ...candidateGenres]);
  const score = union.size > 0 ? intersection.size / union.size : 0;
  ```

- **After (Cosine):**  
  - **Removed intersection/union calculation.**  
  - **Added cosine similarity function**:
    ```js
    const cosineSimilarity = (a, b) => {
        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        const denom = Math.sqrt(normA) * Math.sqrt(normB);
        return denom > 0 ? dot / denom : 0;
    };
    ```
  - **Created a helper** `buildVectorFromGenres(movie)` to construct a binary vector if needed.  
  - For each candidate movie:
    ```js
    const likedVec = buildVectorFromGenres(likedMovie);
    const candVec = buildVectorFromGenres(candidate);
    const score = cosineSimilarity(likedVec, candVec);
    ```
  - Kept the same sorting and top-N recommendation steps.  
  - (Optional) Changed the output message to explicitly say **cosine**.

---

### 3. `index.html` and `style.css`
- **No changes**.  
  The user interface looks the same. Only the **recommendation logic** behind the scenes was modified.

---

## 🖥️ How to Run
1. Clone the repo:
   ```bash
   git clone https://github.com/your-username/movie-recommender.git
   cd movie-recommender
   ```
2. Put the dataset files `u.item` and `u.data` into the root folder.  
3. Open `index.html` in your browser.  
4. Select a movie → get **cosine-based recommendations** ✅

---

## 📊 Example Output
```
Because you liked "Toy Story (1995)", we recommend (cosine): 
    - Aladdin (1992)
    - Lion King, The (1994)
```

---

## ✅ Summary of Changes
- **`data.js`**
  - `parseItemData`: added `genreVector` for each movie.
- **`script.js`**
  - `getRecommendations`: replaced Jaccard with Cosine similarity calculation.
- **UI files (`index.html`, `style.css`)**
  - unchanged.

---
