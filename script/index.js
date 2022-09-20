import { api_fetch, typeColor, random, removeChild, modalPokedex, newPokemon } from "./app.js";

const pokemonCards = document.querySelector(".pokemon-cards");
const loader = document.querySelector(".loader");
const title = document.querySelector(".container-title");
const next_prevBtn = document.querySelector("#next-prev-btn");
const header = document.querySelector("header");
const prevBtnEl = document.getElementById("prev");
const nextBtnEl = document.getElementById("next");
const randomBtn = document.getElementById("random-pokemon");
const inputSearch = document.getElementById("input-search");
const body = document.body;

const display = async (promise) => {
  try {
    for (let i = 0; i < promise.length; i++) {
      
      pokemonCards.innerHTML += newPokemon(promise[i]);

      document.querySelectorAll(".card-title").forEach(pokemonName => {
        pokemonName.addEventListener("click", (e) => {
          modalPokedex(e.target.textContent);
        });
      });

      document.querySelectorAll(".pokemon-type").forEach(pokemonType => {
        pokemonType.addEventListener("click", async (e) => {
          loader.classList.remove("d-none");
          body.style.overflow = "hidden";

          const type = await api_fetch(`https://pokeapi.co/api/v2/type/${ e.target.textContent }`);
          const pokemonList = type.pokemon;
          let list = [];

          pokemonList.map(x => { list.push(api_fetch(x.pokemon.url)) });
          await Promise.all(list).then(pokemon => {
            title.innerHTML = `${ pokemon.length } ${ e.target.textContent } Pokémon type`;
            removeChild(pokemonCards);
            display(pokemon);
            for (const type in typeColor) { if (e.target.textContent == type) header.style.background = ` ${ typeColor[type] } `; }
            body.style.overflow = "auto";
            document.title = `${ e.target.textContent } Pokémon`;
            next_prevBtn.classList.add("d-none");
            body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
          });
        });
      });
    }
    next_prevBtn.classList.remove("d-none");
    loader.classList.add("d-none");
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
    removeChild(pokemonCards)
    display(data);
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  });
}
const nextBtn = async () => (next != null) ? await showData(next) : alert("Highest ID");
const prevBtn = async () => (prev != null) ? await showData(prev) : alert("Lowest ID");
prevBtnEl.addEventListener("click", prevBtn);
nextBtnEl.addEventListener("click", nextBtn);
showData(`https://pokeapi.co/api/v2/pokemon`);

// Random
randomBtn.addEventListener("click", async () => {
  loader.classList.remove("d-none");
  document.querySelector("#next-prev-btn").classList.add("d-none");
  try {
    let randomData = [];
    const data = await api_fetch(`https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0`);
    for (let i = 0; i < 10; i++) {
      const randomPokemon = random(data.count - 1, 0);
      const url = data.results[randomPokemon].url;
      randomData.push(api_fetch(url));
    }
    removeChild(pokemonCards);
    display(await Promise.all(randomData));
    title.innerHTML = "Random Pokémon";
    header.style.background = "var(--white)";

  } catch (error) {
    console.log(error);
  }
  next_prevBtn.classList.add("d-none");
  inputSearch.value = "";
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  document.title = `Random Pokémon`;
});

// Search
document.querySelector("#search-pokemon").addEventListener("click", async (e) => {
  e.preventDefault();
  const pokeName = inputSearch.value.toLowerCase().trim().replace(/ /g, "-");
  modalPokedex(pokeName)
  inputSearch.value = "";
})

// window scroll
window.addEventListener("scroll", () => {
  window.scrollY === 0 ? header.classList.remove("shadow-sm") : header.classList.add("shadow-sm");
});