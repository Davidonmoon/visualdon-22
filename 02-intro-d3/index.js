import * as d3 from "d3";

const r = 40;
const position = [
  { x: 50, y: 50 },
  { x: 150, y: 150 },
  { x: 250, y: 250 },
];

const body = d3
  .select("body")
  .append("svg")
  .attr("width", 600)
  .attr("height", 600);

body
  .selectAll("circle .position")
  .data(position)
  .enter()
  .append("svg:circle")
  .attr("class", "position")
  .attr("cx", function (d) {
    return d.x;
  })
  .attr("cy", function (d) {
    return d.y;
  })
  .attr("r", r)
  .attr("fill", "blue");

// Change la couleur du deuxième cercle
d3.select("circle:nth-child(2)").style("fill", "orange");

// Bouge le premier cercle de 50px vers la droite
d3.select("circle").attr("transform", "translate(50,0)");
// Bouge le deuxième cercle de 50px vers la droite
d3.select("circle:nth-child(2)").attr("transform", "translate(50,0)");

// Texte en dessous des cercles
body
  .append("text")
  .text("Alpha")
  .attr("x", 105)
  .attr("y", 110)
  .attr("text-anchor", "middle");

body
  .append("text")
  .text("Beta")
  .attr("x", 200)
  .attr("y", 210)
  .attr("text-anchor", "middle");

body
  .append("text")
  .text("Gamma")
  .attr("x", 250)
  .attr("y", 310)
  .attr("text-anchor", "middle");

// Aligne les cercles et les textes verticalement
d3.select("circle:nth-child(3)").on("click", function () {
  d3.selectAll("circle, text")
    .attr("cx", 100)
    .attr("x", 50)
    .attr("transform", "translate(50,0)");
});

// Graphique selon données

const rect = [20, 5, 25, 8, 15];

body
  .selectAll("rect")
  .data(rect)
  .enter()
  .append("rect")
  .attr("width", 20)
  .attr("height", (d) => d * 10)
  .attr("y", (d) => 500 - d * 10)
  .attr("x", (i) => i * 20)
  .attr("fill", "green");

