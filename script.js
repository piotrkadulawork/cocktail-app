const cocktailsEl = document.getElementById('cocktails');
const favouriteContainer = document.getElementById('fav-cocktails');
const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");
const cocktailPopup = document.getElementById("cocktail-popup");
const cocktailInfoEl = document.getElementById("cocktail-info");
const closePopupBtn = document.getElementById("close-popup");

getRandomCocktail();
fetchFavCocktails();

async function getRandomCocktail() {
    const resp = await fetch(
        'https://www.thecocktaildb.com/api/json/v1/1/random.php'
    );
    const respData = await resp.json();
    const randomCocktail = respData.drinks[0]
    addCocktail(randomCocktail, true);
}

async function getCocktailById(id) {
    const resp = await fetch(
        'https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=' + id
    );

    const respData = await resp.json();
    const cocktail = respData.drinks[0];

    return cocktail
}

async function getCocktailsBySearch(term) {
    const resp = await fetch(
        'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=' + term
    );

    const respData = await resp.json();
    const cocktails = respData.drinks;

    return cocktails;
}

function addCocktail(cocktailData, random = false) {
    const cocktail = document.createElement('div');
    cocktail.classList.add('cocktail');

    cocktail.innerHTML = `
        <div class="cocktail-header">
            ${random ? `
            <span class="random">
                Random Recipe
            </span>` : ""}
            <img src="${cocktailData.strDrinkThumb}" alt="${cocktailData.strDrink}"/>
        </div>
        <div class="cocktail-body">
            <h4>${cocktailData.strDrink}</h4>
            <button class="fav-btn">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `;

    const btn = cocktail.querySelector(".cocktail-body .fav-btn");
    btn.addEventListener('click', () => {
        if(btn.classList.contains('active')) {
            removeCocktailFromLS(cocktailData.idDrink)
            btn.classList.remove('active');
        } else {
            addCocktailToLS(cocktailData.idDrink)
            btn.classList.add('active');
        }

        fetchFavCocktails();
    });

    cocktail.addEventListener('click', () => {
        showCocktailInfo(cocktailData);
    });

    cocktailsEl.appendChild(cocktail);
}

function showCocktailInfo(cocktailData) {
    cocktailInfoEl.innerHTML = '';
    const cocktailEl = document.createElement('div');
    const ingredients = [];

    for(let i=1; i<15; i++) {
        if(cocktailData['strIngredient'+i]) {
            ingredients.push(`${cocktailData['strIngredient'+i]} / ${cocktailData['strMeasure'+i]}`)
        } else {
            break;
        }
    }

    cocktailEl.innerHTML = `
    <h1>${cocktailData.strDrink}</h1>
    <img src="${cocktailData.strDrinkThumb}" alt=${cocktailData.strDrink}>
    <p>${cocktailData.strInstructions}</p>
    <h3>Ingredients:</h3>
    <ul>
        ${ingredients.map(ing => `
        <li>${ing}</li>
        `).join("")}
    </ul>
    `;

    cocktailInfoEl.appendChild(cocktailEl);
    cocktailPopup.classList.remove('hidden');
}

function addCocktailToLS(cocktailId) {
    const cocktailIds = getCocktailFromLS();

    localStorage.setItem('cocktailIds', JSON.stringify
    ([...cocktailIds, cocktailId]));
}

function removeCocktailFromLS(cocktailId) {
    const cocktailIds = getCocktailFromLS();

    localStorage.setItem('cocktailIds', JSON.stringify
    (cocktailIds.filter(id => id !== cocktailId)));
}

function getCocktailFromLS() {
    const cocktailIds = JSON.parse
    (localStorage.getItem('cocktailIds'));

    return cocktailIds === null ? [] : cocktailIds;
}

async function fetchFavCocktails() {
    favouriteContainer.innerHTML = '';

    const cocktailIds = getCocktailFromLS();
    const cocktails = [];

    for(let i=0; i<cocktailIds.length; i++) {
        const cocktailId = cocktailIds[i];
        let cocktail = await getCocktailById(cocktailId);
        
        addCocktailToFav(cocktail);
    }
}

function addCocktailToFav(cocktailData) {
    const favCocktail = document.createElement('li');

    favCocktail.innerHTML = `
        <img src="${cocktailData.strDrinkThumb}"
        alt="${cocktailData.strDrink}">
        <span>${cocktailData.strDrink}</span>
        <button class="clear"><i class="fas fa-window-close"></i></button>
    `;
    
    const btn = favCocktail.querySelector('.clear')
    btn.addEventListener('click', () =>{
        removeCocktailFromLS(cocktailData.idDrink);

        fetchFavCocktails();
    });

    favCocktail.addEventListener('click', () => {
        showCocktailInfo(cocktailData);
    });

    favouriteContainer.appendChild(favCocktail);
}

searchBtn.addEventListener('click', async () => {
    cocktailsEl.innerHTML = '';
    const search = searchTerm.value;
    const cocktails = await getCocktailsBySearch(search);

    if(cocktails) {
        cocktails.forEach((cocktail) => {
            addCocktail(cocktail);
        });
    }
});

closePopupBtn.addEventListener('click', () =>{
    cocktailPopup.classList.add('hidden');

});