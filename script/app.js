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
    if (this.pokemonImage == null) this.pokemonImage = 'https://raw.githubusercontent.com/blaiziken23/Pokemon-DEX/main/img/default.png'
  }

  card() {
    return `
      <div class="card shadow-sm">
        <img src="${ this.pokemonImage }" class="card-img-top p-3" alt="${ this.pokemonName }">
        <div class="card-body py-3 px-0 d-flex flex-column justify-content-center">
          <h5 class="card-title text-center" data-bs-toggle="modal" data-bs-target="#modalInfo">${ this.pokemonName }</h5>
          <div class="card-text d-flex justify-content-center gap-1"> ${ this.pokemonType } </div>
          <div class="card-text id"> ${ this.pokemonId }</div>
        </div>
      </div> `
  }
}

// create function instanciate Pokemon class
const newPokemon = (promise) => {
  const pokemon = new Pokemon(
    promise.id,
    promise.name,
    promise.sprites.other['official-artwork'].front_default,
    promise.types.map(poke_type => {
      let bgColor = "";
      for (const type in typeColor) { if (poke_type.type.name == type) bgColor = typeColor[type]; }
      return `<li class="list-group-item pokemon-type" style="background-color:${bgColor};">${poke_type.type.name}</li>`;
    }).join("")
  )
  return pokemon.card();
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
const modalDialog = document.querySelector(".modalDialogInfo");

const modalPokedex = async (pokemonName) => {
  const start = Date.now()

  try {
    modalLoad.classList.remove("d-none");
    const pokemonInfo = await api_fetch(`https://pokeapi.co/api/v2/pokemon/${ pokemonName }`);
    const species = await api_fetch(pokemonInfo.species.url);

    const varity = species.varieties.filter(varity => !varity.is_default).map(varity => api_fetch(varity.pokemon.url));
    const varieties = await Promise.all(varity).then(x => { return x });
   
    // pokemonColor 
    let colorPokemon;
    for (const pokemonColor in pokemonColors) {
      if(species.color.name == pokemonColor) colorPokemon = pokemonColors[pokemonColor];
    }

    // stats
    const stats = pokemonInfo.stats.map(stat => {
      const value = (stat.base_stat * 100) / 300;    /* maxValue = 300 */
      return `
        <div class="progress-div pb-2"> 
          <label for="${ stat.stat.name }" class="form-label m-0">${ stat.stat.name }</label>
          <div class="progress" title="${ stat.base_stat }">
            <div class="progress-bar" id="${ stat.stat.name }" role="progressbar" style="width:${ value }%; background: linear-gradient(${ colorPokemon }, #ECEFF1);">
              ${ stat.base_stat }
            </div>
          </div>
        </div> `
    }).join("");

    // text entries
    const randomEntries = async () => {
      const textEntries = await species.flavor_text_entries.filter(eng => eng.language.name === "en");
      const randomText = random(textEntries.length - 1, 0);
      const entries = textEntries[randomText].flavor_text;
      const version = textEntries[randomText].version.name;
      return ` 
        <figure class="m-0">
          <blockquote class="blockquote mb-2">
            <p class=""> ${ entries } </p>
          </blockquote>
          <figcaption class="blockquote-footer m-0">
            <cite title="${ version }">Pokemon ${ version }</cite>
          </figcaption>
        </figure> 
        <hr class="my-2">`
    }

    // ability
    const ability = pokemonInfo.abilities.filter(x => !x.is_hidden).map(url => api_fetch(url.ability.url));
    const abilities = await Promise.all(ability).then(x => { return x });
    const effectEntries = abilities.map((effectEntry, i) => { 
      let shortEffect;
      effectEntry.effect_entries.filter(eng => eng.language.name === "en").map(getEffect => { 
        shortEffect = getEffect.short_effect; 
      });
      if (shortEffect == undefined) shortEffect = "";
      return `
        <h6 class="text-capitalize"><span> ${ i + 1 } </span> - ${ effectEntry.name.replace(/-/g, " ") } </h6>
        <p class="card-text">${ shortEffect }</p> `
    }).join("");

    // pokemon type Damage Relations
    const type = pokemonInfo.types.map(type => api_fetch(type.type.url));
    const types = await Promise.all(type).then(types => { return types });

    let x2DamageFrom = new Set();
    let x2DamageTo = new Set();
    types.map(dmg => {
      dmg.damage_relations.double_damage_from.map(type => x2DamageFrom.add(type.name));
      dmg.damage_relations.double_damage_to.map(type =>  x2DamageTo.add(type.name));
    });
    const dmgRelationsValues = (dmgRelations) => {
      const typeList = Array.from(dmgRelations).map(x => {
        let bgColor = "";
        for (const type in typeColor) { 
          if (x == type) bgColor = typeColor[type]; 
        }
        return `<li class="list-group-item" style="background-color:${ bgColor };"> ${ x } </li> `;
      }).join("");
      return typeList;
    }
    const pokemonDamageRelations = () => {
      return `
        <div class="row"> 
          <div class="col-sm">
            <nav class="navbar">
              <h6 class="card-text"> double Damage from </h6>
            </nav>
            <div class="card-text damage-relation"> 
              ${ dmgRelationsValues(x2DamageFrom) }
            </div>
          </div>
          <div class="col-sm">
            <nav class="navbar">
              <h6 class="card-text"> double Damage to </h6>
            </nav>
            <div class="card-text damage-relation"> 
              ${ dmgRelationsValues(x2DamageTo) }
            </div>
          </div>
        </div>`
    }
    
    // pokemon Height
    const decimetresTometres = pokemonInfo.height / 10;
    
    const metres = decimetresTometres;
    const inch = metres / 0.0254;
    const ft = Math.floor(inch / 12);
    const d_inch = Math.round(inch - (12 * ft));
    const length = `${ ft }' ${ d_inch.toString().padStart(2, 0) }"`;

    // pokemon habitat
    const habitat = species.habitat;
    let habitatName;
    habitat == null ? habitatName = "None" : habitatName = species.habitat.name;

    // evolution chain
    const evolution = species.evolution_chain;
    const noEvolution =  `
      <nav class="navbar px-3 pt-0">
        <h6 class="card-text"> This Pokemon does not evolve </h6>
      </nav>
      <div class="row">
        <div class="col-evolution col-sm">
          ${ newPokemon(pokemonInfo) }
        </div>
      </div> `

    const displayEvolution = async () => {
      if (evolution != null) {
        const evolutionChain = await api_fetch(evolution.url);
        
        const species1 = await api_fetch(evolutionChain.chain.species.url)
        const species1Data = await api_fetch(`https://pokeapi.co/api/v2/pokemon/${ species1.id }`)

        const species2 = evolutionChain.chain.evolves_to.map(x => api_fetch(x.species.url))
        const species2Data = (await Promise.all(species2).then(x => x)).map(x => api_fetch(`https://pokeapi.co/api/v2/pokemon/${ x.id }`))
        const species2Dataa = await Promise.all(species2Data).then(x => {
          return x.map( y => { return newPokemon(y) }).join("");
        });
        const checkSpecies3 = evolutionChain.chain.evolves_to.map(x => x.evolves_to);

        if (species2.length === 0) {
          return noEvolution;
        }
        else {
          if (checkSpecies3[0].length === 0) {
            return `
              <div class="row">
                <div class="col-evolution col-sm-4">
                  ${ newPokemon(species1Data) }
                </div>
                <div class="col-evolution svg col-sm p-0 justify-content-end">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </div>
                <div class="col-evolution col-sm-7">
                  ${ species2Dataa }
                </div>
              </div> `
          }
          else {
            const species3 = checkSpecies3[0].map(x => api_fetch(x.species.url))
            const species3Data = (await Promise.all(species3).then(x => x)).map(x => api_fetch(`https://pokeapi.co/api/v2/pokemon/${ x.id }`))
            const species3Dataa = await Promise.all(species3Data).then(x => {
              return x.map(y => { return newPokemon(y); }).join("")
            })

            return `
              <div class="row">
                <div class="col-evolution col-sm">
                  ${ newPokemon(species1Data) }
                </div>
                <div class="col-evolution col-sm-1 p-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </div>
                <div class="col-evolution col-sm">
                  ${ species2Dataa }
                </div>
                <div class="col-evolution col-sm-1 p-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-chevron-double-right" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708z"/>
                    <path fill-rule="evenodd" d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </div>
                <div class="col-evolution col-sm lastEvolution"> 
                  ${ species3Dataa }
                </div>
              </div> `
          }
        }
      }
      else {
        return noEvolution;
      }
    }

    // modal Content
    modalDialog.innerHTML = `
      <div class="modal-content">
        <div class="modal-header py-2 shadow-sm" style="background:${ colorPokemon }">
          <button type="button" class="btn-close m-0 shadow-0" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body px-0"> 
          <div class="container"> 
           
            <div class="row">
              <div class="column col-md">
                ${ newPokemon(pokemonInfo) }
              </div>

              <div class="column col-md">
                <div class="card">
                  <div class="card-header py-0"> 
                    <h5 class="card-text"> Pokémon Stats </h5>
                  </div>
                  <div class="card-body">
                    <div class="card-text"> ${ stats } </div>
                  </div>
                </div>
              </div>

              <div class="column col-xl-6">
                <div class="card"> 
                  <div class="card-header"> 
                    <ul class="nav nav-tabs " id="myTab">
                      <li class="nav-item">
                        <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#pokemonProfile" type="button"> Profile </button>
                      </li>
                      <li class="nav-item">
                        <button class="nav-link " data-bs-toggle="tab" data-bs-target="#pokemonDamage" type="button"> Damage </button>
                      </li>
                    </ul>
                  </div>
                  <div class="card-body"> 
                    <div class="tab-content">

                      <div class="tab-pane fade show active" id="pokemonProfile">
                        <nav class="navbar">
                          <h6 class="card-text m-0"> Pokemon Entries </h6>
                            <button type="button" class="btn" id="random-entries-btn">
                              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="currentColor" class="bi bi-shuffle" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.624 9.624 0 0 0 7.556 8a9.624 9.624 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.595 10.595 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.624 9.624 0 0 0 6.444 8a9.624 9.624 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5z"/>
                                <path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192zm0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z"/>
                              </svg>
                            </button>
                        </nav>
                        <div class="card-text random-entries">
                          ${ await randomEntries() }
                        </div>
                        <div class="row">   
                          <div class="col-sm"> 
                            <div class="card-text">
                              <nav class="navbar pt-0">
                                <h6 class="card-text"> Ability </h6>
                              </nav>
                              <ol class="list-group mb-3">
                                <li class="list-group-item p-0">
                                  ${ effectEntries }
                                </li>
                              </ol>
                            </div>
                          </div>
                          <div class="col-sm"> 
                            <div class="row"> 
                              <div class="col"> 
                                <div class="card-text">
                                  <nav class="navbar pt-0">
                                    <h6 class="card-text"> Height </h6>
                                  </nav>
                                  <p class="card-text"> ${ length } </p>
                                </div>
                              </div>
                              <div class="col"> 
                                <div class="card-text">
                                  <nav class="navbar pt-0">
                                    <h6 class="card-text"> Weight </h6>
                                  </nav>
                                  <p class="card-text"> ${ ((pokemonInfo.weight / 10) * 2.205).toFixed(1) } pound </p>
                                </div>
                              </div>
                            </div>
                            <hr class="my-2"> 
                            <div class="row"> 
                              <div class="col">  
                                <div class="card-text">
                                  <nav class="navbar pt-0">
                                    <h6 class="card-text"> Egg groups </h6>
                                  </nav>
                                  <p class="card-text"> ${ species.egg_groups.map(name => ` ${ name.name }`) } </p>
                                </div>
                              </div>
                              <div class="col"> 
                                <div class="card-text">
                                  <nav class="navbar pt-0">
                                    <h6 class="card-text"> habitat </h6>
                                  </nav>
                                  <p class="card-text"> ${ habitatName } </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="tab-pane fade " id="pokemonDamage">
                        <div class="card-text">
                          ${ pokemonDamageRelations() }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <hr class="my-2"> 
            <div class="row"> 
              <div class="column col-md">
                <div class="card evolution"> 
                  <div class="card-header"> 
                    <h4 class="card-text"> Evolution chain </h4>
                  </div>
                  ${ await displayEvolution() }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> `
    document.querySelector(".btn-close").addEventListener("click", () => { 
      modalDialog.innerHTML = "";
      document.title = "Pokemon"; 
      console.clear(); 
    });
    document.querySelector(".modal-body .card-title").removeAttribute("data-bs-toggle", "modal");
    document.querySelectorAll(".modal-body .column .evolution .card .card-title").forEach(x => { 
      x.removeAttribute("data-bs-toggle", "modal");
    })
    document.querySelector("#random-entries-btn").addEventListener("click", async () => {
      document.querySelector(".random-entries").innerHTML = `${ await randomEntries() }`
    })
    modalLoad.classList.add("d-none");
    document.title = `${ pokemonInfo.name } | Pokemon`;

  } catch (error) {
    alert("Please Try Again!!!");
    modalLoad.classList.add("d-none");
    console.log(error);
  }
  const stop = Date.now()
  console.log(`Time Taken to execute = ${ (stop - start) / 1000 } seconds`);
}


export { api_fetch, typeColor, random, removeChild, modalPokedex, newPokemon }