// Fetch api
const api_fetch = async url => {
  return (await fetch(url)).json();
}

// Pokemon class
class Pokemon {
  constructor(id, name, img, types) {
    this.pokemonId = id,
    this.pokemonName = name,
    this.pokemonImage = img,
    this.pokemonType = types;
    if (this.pokemonImage == null) this.pokemonImage = 'https://raw.githubusercontent.com/blaiziken23/My-Pokedex/main/img/default.png'
  }

  card() {
    return `
      <div class="card shadow-sm">
        <img src="${this.pokemonImage}" class="card-img-top p-3 animate__animated animate__fadeInDown" alt="${this.pokemonName}">
        <div class="card-body py-3 px-0 d-flex flex-column justify-content-center">
          <h5 class="card-title text-center" data-bs-toggle="modal" data-bs-target="#modalInfo">${this.pokemonName}</h5>
          <div class="card-text d-flex justify-content-center gap-1"> ${this.pokemonType} </div>
          <div class="card-text id"> ${this.pokemonId}</div>
        </div>
      </div> `
  }
}

// Color List 
const typeColor = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

const pokemonColors = {
  black: '#BBB',
  blue: '#94DBEE',
  gray: '#D1D1E0',
  brown: '#d0a880',
  pink: '#F4BDC9',
  purple: '#ca96ca',
  red: '#ef9a9a',
  white: '#FFF',
  yellow: '#eed463',
  green: '#78d978'
}

// random
const random = (max, min) => {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

// removeChild
const removeChild = (parent) => {
  while (parent.hasChildNodes()) {
    parent.removeChild(parent.firstChild);
  }
}

// Modal Pokedex -------------------------------------------------------------
const modalLoad = document.querySelector(".modalLoad");
const modalDialog = document.querySelector(".modal-dialog");

const modalPokedex = async (pokemonName) => {
  try {
    modalLoad.classList.remove("d-none");
    const pokemonInfo = await api_fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    const species = await api_fetch(pokemonInfo.species.url);
    const textEntries = await species.flavor_text_entries.filter(eng => eng.language.name === "en");
    let evolution;
    if(species.evolution_chain != null) { 
      evolution = await api_fetch(species.evolution_chain.url); 
      console.log("Evolution", evolution); 
    }

    const varity = species.varieties.filter(varity => !varity.is_default).map(varity => api_fetch(varity.pokemon.url));
    const varieties = Promise.all(varity).then(x => { return x });
    
    const ability = pokemonInfo.abilities.filter(x => !x.is_hidden).map(url => api_fetch(url.ability.url));
    const abilities = Promise.all(ability).then(x => { return x });

    const type = pokemonInfo.types.map(type => api_fetch(type.type.url));
    const types = Promise.all(type).then(types => {return types});

    const promises = await Promise.all([varieties, abilities, types]);

    console.log(promises)
   
    // pokemonColor 
    let colorPokemon;
    for (const pokemonColor in pokemonColors) {
      if(species.color.name == pokemonColor) colorPokemon = pokemonColors[pokemonColor];
    }

    // stats
    const stats = pokemonInfo.stats.map(x => {
      const value = (x.base_stat * 100) / 300;    /* maxValue = 300 */
      return `
        <div class="progress-div pb-2"> 
          <label for="${x.stat.name}" class="form-label m-0">${x.stat.name}</label>
          <div class="progress" title="${x.base_stat}">
            <div class="progress-bar animate__animated animate__fadeInLeft" id="${x.stat.name}" role="progressbar" style="width:${value}%; background:${colorPokemon};">
              ${x.base_stat}
            </div>
          </div>
        </div>`
    }).join("");

    // new pokemon card
    const pokemon = new Pokemon(
      pokemonInfo.id,
      pokemonInfo.name.replace(/-/g, " "),
      pokemonInfo.sprites.other['official-artwork'].front_default,
      pokemonInfo.types.map(poke_type => {
        let bgColor = "";
        for (const type in typeColor) { if (poke_type.type.name == type) bgColor = typeColor[type]; }
        return `<li class="list-group-item" style="background-color:${bgColor};"> ${poke_type.type.name} </li>`;
      }).join("")
    )
    
    // modal Content
    modalDialog.innerHTML = `
      <div class="modal-content">
        <div class="modal-header shadow-sm" style="background:${colorPokemon}">
          <button type="button" class="btn-close m-0 shadow-0" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body px-0"> 
          <div class="container"> 
            <div class="row gap-3">
              <div class="column col-md-4">
                ${ pokemon.card() }
              </div>
              <div class="column col-md">
                <div class="card">
                  <div class="card-header py-0"> 
                    <h5 class="card-text"> Pokémon Stats </h5>
                  </div>
                  <div class="card-body">
                    <div class="card-text"> ${stats} </div>
                    <div class="card-text">  </div>
                  </div>
                </div>
              </div>
              <div class="column col-xl-4">
                <ul class="nav nav-tabs" id="myTab" role="tablist">
                  <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home-tab-pane" type="button" role="tab" aria-controls="home-tab-pane">
                      Text Entries
                    </button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile-tab-pane" type="button" role="tab" aria-controls="profile-tab-pane">Profile</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#contact-tab-pane" type="button" role="tab" aria-controls="contact-tab-pane">Contact</button>
                  </li>
                </ul>
                <div class="tab-content" id="myTabContent">
                  <div class="tab-pane fade show active" id="home-tab-pane" role="tabpanel" aria-labelledby="home-tab">
                    ${textEntries[0].flavor_text}
                  </div>
                  <div class="tab-pane fade" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab">...</div>
                  <div class="tab-pane fade" id="contact-tab-pane" role="tabpanel" aria-labelledby="contact-tab">...</div>
                </div>
              </div>
            </div>
          </div> 
        </div>
      </div> `
    document.querySelector(".btn-close").addEventListener("click", () => { modalDialog.innerHTML = "" });
    document.querySelector(".modal-body .card-title").removeAttribute("data-bs-toggle", "modal");
    modalLoad.classList.add("d-none");

  } catch (error) {
    alert("Please Try Again!!!");
    window.location = "index.html";
    console.log(error);
  }
}

// display Card
const loader = document.querySelector(".loader");
const display = async (promise) => {
  try {
    for (let i = 0; i < promise.length; i++) {

      newPokemon(promise);

      document.querySelectorAll(".card-title").forEach(pokemonName => {
        pokemonName.addEventListener("click", async (e) => {
          modalPokedex(e.target.textContent);
        });
      });

    }
    setTimeout(() => {
      loader.classList.add("d-none");
    });
    document.querySelector("#next-prev-btn").classList.remove("d-none");
    
  } catch (error) {
    console.log(error);
  }
}

// create funtiopn instanciate Pokemon class

const newPokemon = (promise, parentElement) => {

  const pokemon = new Pokemon(
    promise.id,
    promise.name,
    promise.sprites.other['official-artwork'].front_default,
    promise.types.map(poke_type => {
      let bgColor = "";
      for (const type in typeColor) { if (poke_type.type.name == type) bgColor = typeColor[type]; }
      return `<li class="list-group-item" style="background-color:${bgColor};"> ${poke_type.type.name} </li>`;
    }).join("")
  )
  parentElement.innerHTML += pokemon.card();
}


export { api_fetch, Pokemon, typeColor, random, pokemonColors, removeChild, modalPokedex, display, newPokemon }