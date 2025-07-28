// utils.js
export const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export const getTypeColor = (type) => {
  const colors = {
    fire: "#F08030",
    water: "#6890F0",
    grass: "#78C850",
    electric: "#F8D030",
    normal: "#A8A878",
    bug: "#A8B820",
    poison: "#A040A0",
    flying: "#A890F0",
    fighting: "#C03028",
    psychic: "#F85888",
    rock: "#B8A038",
    ghost: "#705898",
    ice: "#98D8D8",
    dragon: "#7038F8",
    dark: "#705848",
    steel: "#B8B8D0",
    fairy: "#EE99AC",
    ground: "#E0C068",
  };
  return colors[type] || "#AAA";
};
