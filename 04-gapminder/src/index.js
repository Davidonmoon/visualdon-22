   
import * as d3 from "d3";
import pibData from "/data/income_per_person_gdppercapita_ppp_inflation_adjusted.csv"; 
import esperanceVie from "/data/life_expectancy_years.csv"; 
import populationTotal from "../data/population_total.csv"; 

// Récupère toutes les années
const annees = Object.keys(populationTotal[0]);
console.log(annees);

let convertisseurSI = (array, variable, nomVariable) => {
  let convertedVariable = array.map((d) => {
    // Trouver le format SI (M, B, k)
    let SI =
      typeof d[variable.toString()] === "string" ||
      d[variable.toString()] instanceof String
        ? d[variable.toString()].slice(-1)
        : d[variable.toString()];

    // On prend la partie numérique
    let number =
      typeof d[variable.toString()] === "string" ||
      d[variable.toString()] instanceof String
        ? parseFloat(d[variable.toString()].slice(0, -1))
        : d[variable.toString()];

    // multiplication par la valeur SI
    switch (SI) {
      case "M": {
        return { country: d.country, [nomVariable]: Math.pow(10, 6) * number };
        break
      }
      case "B": {
        return { country: d.country, [nomVariable]: Math.pow(10, 9) * number };
        break
      }
      case "k": {
        return { country: d.country, [nomVariable]: Math.pow(10, 3) * number };
        break
      }
      default: {
        return { country: d.country, [nomVariable]: number };
        break
      }
    }
  });
  return convertedVariable;
};

let population = [],
  revenue = [],
  vie = [],
  combinationDonnee = [];

// Fusionner données
const mergeByCountry = (a1, a2, a3) => {
  let data = [];
  a1.map((itm) => {
    let newObject = {
      ...a2.find((item) => item.country === itm.country && item),
      ...a3.find((item) => item.country === itm.country && item),
      ...itm,
    };
    data.push(newObject);
  });
  return data;
};

annees.forEach((annee) => {
  population.push({
    annee: annee,
    data: convertisseurSI(populationTotal, annee, "population"),
  });
  revenue.push({
    annee: annee,
    data: convertisseurSI(pibData, annee, "revenue"),
  });
  vie.push({
    annee: annee,
    data: convertisseurSI(esperanceVie, annee, "vie"),
  });
  const populationAnnee = population
    .filter((d) => d.annee == annee)
    .map((d) => d.data)[0];
  const revenueAnnee = revenue
    .filter((d) => d.annee == annee)
    .map((d) => d.data)[0];
  const esperanceVieAnnee = vie
    .filter((d) => d.annee == annee)
    .map((d) => d.data)[0];
  combinationDonnee.push({
    annee: annee,
    data: mergeByCountry(populationAnnee, revenueAnnee, esperanceVieAnnee),
  });
});

console.log(combinationDonnee[221]);

let tableauRevenue = combinationDonnee[221].data.map((d) => d.revenue);
let maximalRevenue = d3.max(tableauRevenue);

let esperanceVieMax = combinationDonnee[221].data.map((d) => d.vie);
let maxVie = d3.max(esperanceVieMax);

console.log(tableauRevenue);
console.log(maxVie);
console.log(maximalRevenue);
let popArray = combinationDonnee[221].data.map((d) => d.population);
let maxPopulation = d3.max(popArray);

//Graphique-------------------------------------------------------------------------------------
// set the dimensions and margins of the graph
var margin = { top: 10, right: 20, bottom: 30, left: 50 },
  width = 1000 - margin.left - margin.right,
  height = 420 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Axes-------------------------------------------------------------------------------------
// Ajout de l'axe des X
var x = d3.scalePow().domain([0, maximalRevenue]).range([0, width]);
svg
  .append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

// Ajout de l'axe des Y
var y = d3.scaleLinear().domain([40, maxVie]).range([height, 0]);
svg.append("g").call(d3.axisLeft(y));

// Ajoute une échelle pour la taille des bulles
var z = d3.scaleSqrt().domain([0, maxPopulation]).range([0, 30]);

svg
  .append("g")
  .selectAll("dot")
  .data(combinationDonnee[221].data)
  .enter()
  .append("circle")
  .attr("cx", function (d) {
    return x(d.revenue);
  })
  .attr("cy", function (d) {
    return y(d.vie);
  })
  .attr("r", function (d) {
    return z(d.population);
  })
  .style("fill", "#0D00B2")
  .style("opacity", "0.8")
  .attr("stroke", "black");



