const cocktails = document.getElementById('cocktails');
const favouriteContainer = document.getElementById('fav-cocktails');

getRandomCocktail();
fetchFavCocktails();

async function getRandomCocktail() {
    const resp = await fetch(
        'https://www.thecocktaildb.com/api/json/v1/1/random.php'
    );
    const respData = await resp.json();
    const randomCocktail = respData.drinks[0]
    
    console.log(randomCocktail);

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

async function getCocktailBySearch(term) {
    const cocktails = await fetch(
        'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=' + term
    );
}

function addCocktail(cocktailData, random = false) {
    console.log(cocktailData);

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

    cocktails.appendChild(cocktail);
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
    })
    favouriteContainer.appendChild(favCocktail);
}