import { api_fetch, Pokemon, typeColor, random, pokemonColors, removeChild, modalPokedex, newPokemon } from "./app.js";

const pokemonCards = document.querySelector(".pokemon-cards");
const loader = document.querySelector(".loader");

const display = async (promise) => {
  try {
    for (let i = 0; i < promise.length; i++) {
      
      newPokemon(promise[i], pokemonCards);

      document.querySelectorAll(".card-title").forEach(pokemonName => {
        pokemonName.addEventListener("click", async (e) => {
          modalPokedex(e.target.textContent)
        })
      });

    }
    setTimeout(() => {
      loader.classList.add("d-none");
    });
    document.querySelector("#next-prev-btn").classList.remove("d-none");
    
  } catch (error) {
    console.log(error)
  }
}

let prev = null; 
let next = null;

const showData = async (url) => {
  loader.classList.remove("d-none");
  const link = await api_fetch(url);
  const results = link.results;
  prev = link.previous;
  next = link.next;
  let list = [];
  for (let i = 0; i < results.length; i++) {
    list.push(api_fetch(results[i].url));
  }
  Promise.all(list).then(data => {
    
    setTimeout(() => {
      removeChild(pokemonCards)
      display(data);
    });
    
  });
}
const nextBtn = async () => (next != null) ? await showData(next) : alert("Highest ID");
const prevBtn = async () => (prev != null) ? await showData(prev) : alert("Lowest ID");
document.querySelector("#prev").addEventListener("click", prevBtn);
document.querySelector("#next").addEventListener("click", nextBtn);

showData(`https://pokeapi.co/api/v2/pokemon`);

// Random
document.querySelector("#random-pokemon").addEventListener("click", async () => {
  loader.classList.remove("d-none");
  document.querySelector("#next-prev-btn").classList.add("d-none");
  try {
    let randomData = [];
    const data = await api_fetch(`https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0`);
    for (let i = 0; i < 20; i++) {
      const randomPokemon = random(data.count, 0);
      const url = data.results[randomPokemon].url;
      randomData.push(api_fetch(url));
    }

    setTimeout(async () => {
      removeChild(pokemonCards);
      display(await Promise.all(randomData));
    }, 100);

  } catch (error) {
    alert("Please Try Again!!!");
    setTimeout(() => {
      loader.classList.add("d-none");
    }, 100);
    console.log(error);
  }
  document.querySelector("#input-search").value = "";

});


// Search
document.querySelector("#search-pokemon").addEventListener("click", async (e) => {
  e.preventDefault();
  const inputSearch = document.querySelector("#input-search");
  const pokeName = inputSearch.value = inputSearch.value.toLowerCase().trim().replace(/ /g, "-");
  modalPokedex(pokeName)
  document.querySelector("#input-search").value = "";

})
