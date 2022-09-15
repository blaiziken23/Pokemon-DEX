import { api_fetch, Pokemon, typeColor, random, pokemonColors, removeChild, modalPokedex, newPokemon } from "./app.js";

const pokemonCards = document.querySelector(".pokemon-cards");
const loader = document.querySelector(".loader");
const title = document.querySelector(".container-title");

const display = async (promise) => {
  try {
    const start = Date.now()

    for (let i = 0; i < promise.length; i++) {
      
      newPokemon(promise[i], pokemonCards);

      document.querySelectorAll(".card-title").forEach(pokemonName => {
        pokemonName.addEventListener("click", async (e) => {
          modalPokedex(e.target.textContent);
        });
      });

      document.querySelectorAll(".pokemon-type").forEach(pokemonType => {

        pokemonType.addEventListener("click", async (e) => {
          loader.classList.remove("d-none");

          const header = document.querySelector("header");

          const type = await api_fetch(`https://pokeapi.co/api/v2/type/${ e.target.textContent }`);
          const pokemonList = type.pokemon;
          let list = [];

          pokemonList.map(x => { list.push(api_fetch(x.pokemon.url)) });
          await Promise.all(list).then(pokemon => {
          
            title.innerHTML = `${ pokemon.length } ${ e.target.textContent } Pokémon type`;
            removeChild(pokemonCards);
            display(pokemon);

            for (const type in typeColor) { 
              if (e.target.textContent == type) header.style.background = ` ${ typeColor[type] } `; 
            }

            document.title = `${ e.target.textContent } Pokémon`;
            document.querySelector("#next-prev-btn").classList.add("d-none");

            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
          });
        });
      });
    }
    const stop = Date.now()
    console.log(`Time Taken to execute = ${(stop - start)/1000} seconds`);
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
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
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
      const randomPokemon = random(data.count - 1, 0);
      const url = data.results[randomPokemon].url;
      randomData.push(api_fetch(url));
    }
    // console.log(await Promise.all(randomData))
    setTimeout(async () => {
      removeChild(pokemonCards);
      display(await Promise.all(randomData));
      title.innerHTML = "Random Pokémon";
    });

  } catch (error) {
    console.log(error);
  }
  document.querySelector("#input-search").value = "";
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
});

// Search
document.querySelector("#search-pokemon").addEventListener("click", async (e) => {
  e.preventDefault();
  const inputSearch = document.querySelector("#input-search");
  const pokeName = inputSearch.value.toLowerCase().trim().replace(/ /g, "-");
  modalPokedex(pokeName)
  document.querySelector("#input-search").value = "";

})

// window scroll
const header = document.querySelector("header");
window.addEventListener("scroll", () => {
  window.scrollY == 0 ? header.classList.remove("shadow-sm") : header.classList.add("shadow-sm");
});