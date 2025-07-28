import { legendaryPokemons, mythicalPokemons, tipoTraduzido } from "./dados.js";
import { DOM } from "./domElements.js";
import { capitalize, getTypeColor } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  let allPokemons = [];

  // Busca todos os Pokémons e seus detalhes completos
  const fetchAllPokemon = async () => {
    const limit = 1010;
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}`;
    const response = await fetch(url);
    const data = await response.json();

    const allDetails = await Promise.all(
      data.results.map((pokemon) => fetch(pokemon.url).then((res) => res.json()))
    );

    allPokemons = allDetails;
    renderPokemonList(allPokemons);
  };

  // Renderiza lista de Pokémons na tela
  const renderPokemonList = (pokemonArray) => {
    DOM.pokedexList.innerHTML = "";
    pokemonArray.forEach((pokemon) => {
      const listItem = document.createElement("li");
      listItem.classList.add("pokemon-card", "pokemon");
      listItem.setAttribute("data-id", pokemon.id);

      const img = document.createElement("img");
      img.src = pokemon.sprites.front_default;
      img.alt = pokemon.name;

      const name = document.createElement("span");
      name.textContent = `${pokemon.id}. ${capitalize(pokemon.name)}`;

      const firstType = pokemon.types[0].type.name;
      listItem.style.backgroundColor = getTypeColor(firstType);

      if (legendaryPokemons.includes(pokemon.name.toLowerCase())) {
        listItem.classList.add("legendary");
      }
      if (mythicalPokemons.includes(pokemon.name.toLowerCase())) {
        listItem.classList.add("mythical");
      }

      listItem.appendChild(img);
      listItem.appendChild(name);

      listItem.addEventListener("click", () => showModal(pokemon));
      DOM.pokedexList.appendChild(listItem);
    });
  };

  // Filtra Pokémons por geração, lendários e míticos
  const filterPokemons = () => {
    const selectedGen = DOM.generationSelect.value;
    const isLegendary = DOM.legendaryCheckbox.checked;
    const isMythical = DOM.mythicalCheckbox.checked;

    return allPokemons.filter((pokemon) => {
      const id = pokemon.id;
      const name = pokemon.name.toLowerCase();

      if (selectedGen !== "all") {
        const [start, end] = generationRanges[selectedGen];
        if (id < start || id > end) return false;
      }

      if (isLegendary && !legendaryPokemons.includes(name)) return false;
      if (isMythical && !mythicalPokemons.includes(name)) return false;

      return true;
    });
  };

  // Filtra também pelo texto da busca
  const filterBySearch = () => {
    const query = DOM.searchInput.value.toLowerCase().trim();
    const filtered = filterPokemons().filter((pokemon) =>
      pokemon.name.toLowerCase().includes(query)
    );
    renderPokemonList(filtered);
  };

  // Modal: abre e popula com dados, incluindo fetch para dados extras
  const showModal = async (pokemon) => {
    DOM.modal.classList.remove("hidden");
    DOM.modalName.textContent = capitalize(pokemon.name);
    DOM.modalImg.src =
      pokemon.sprites.other["official-artwork"].front_default ||
      pokemon.sprites.front_default;
    DOM.modalType.textContent = pokemon.types
      .map((t) => tipoTraduzido[t.type.name] || capitalize(t.type.name))
      .join(", ");
    DOM.modalHeight.textContent = (pokemon.height / 10).toFixed(1);
    DOM.modalWeight.textContent = (pokemon.weight / 10).toFixed(1);
    DOM.modalHealthPoints.textContent = pokemon.stats.find(
      (stat) => stat.stat.name === "hp"
    ).base_stat;
    DOM.modalAttack.textContent = pokemon.stats.find(
      (stat) => stat.stat.name === "attack"
    ).base_stat;

    DOM.modalContent.className = "modal-content type-" + pokemon.types[0].type.name;

    // Função para traduzir gênero
    function formatGender(genderRate) {
      if (genderRate === -1) return "?";
      const femaleRate = genderRate * 12.5;
      if (femaleRate === 0) return "♂";
      if (femaleRate === 100) return "♀";
      return "♂/♀";
    }

    try {
      const speciesResponse = await fetch(pokemon.species.url);
      if (!speciesResponse.ok) throw new Error("Erro no fetch da espécie");
      const speciesData = await speciesResponse.json();

      const genderRate = speciesData.gender_rate;
      DOM.modalGender.textContent = formatGender(genderRate);

      const flavor = speciesData.flavor_text_entries.find(
        (entry) => entry.language.name === "pt"
      );
      DOM.modalDescription.textContent = flavor
        ? flavor.flavor_text.replace(/\f/g, " ")
        : "Sem descrição.";

      DOM.modalAbilities.textContent = pokemon.abilities
        .map((a) => capitalize(a.ability.name))
        .join(", ");

      const maxMoves = 5;
      const movesList = pokemon.moves
        .slice(0, maxMoves)
        .map((m) => capitalize(m.move.name))
        .join(", ");
      DOM.modalMoves.textContent =
        movesList + (pokemon.moves.length > maxMoves ? ", ..." : "");
    } catch (error) {
      console.error("Erro ao buscar dados extras da espécie:", error);
      DOM.modalGender.textContent = "?";
      DOM.modalDescription.textContent = "Sem descrição.";
      DOM.modalAbilities.textContent = pokemon.abilities
        .map((a) => capitalize(a.ability.name))
        .join(", ");
      DOM.modalMoves.textContent =
        pokemon.moves
          .slice(0, 5)
          .map((m) => capitalize(m.move.name))
          .join(", ") + (pokemon.moves.length > 5 ? "." : "");
    }
  };

  // Atualiza a cor do modal baseado no tipo
  const updateModalColors = (type) => {
    DOM.modalContent.className = "modal-content type-" + type;
  };

  // Fecha modal
  const closeModal = () => {
    DOM.modal.classList.add("hidden");
  };

  // Eventos para fechar modal
  if (DOM.closeBtn) DOM.closeBtn.addEventListener("click", closeModal);

  DOM.modal.addEventListener("click", (e) => {
    if (!e.target.closest(".modal-content")) closeModal();
  });

  // Eventos filtros e busca
  DOM.searchBtn.addEventListener("click", filterBySearch);
  DOM.searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") filterBySearch();
  });
  DOM.generationSelect.addEventListener("change", () =>
    renderPokemonList(filterPokemons())
  );
  DOM.legendaryCheckbox.addEventListener("change", () =>
    renderPokemonList(filterPokemons())
  );
  DOM.mythicalCheckbox.addEventListener("change", () =>
    renderPokemonList(filterPokemons())
  );

  // Inicia app
  fetchAllPokemon();
});
