import * as d3 from "d3";
import { json } from "d3-fetch";

d3.select("body").append("div").attr("class", "tab");
d3.select(".tab").text("Nombre de posts par user: ");

let postPerUser;
let maxPostLength = 0;

// Charger les données

Promise.all([
  json("https://jsonplaceholder.typicode.com/posts/"),
  json("https://jsonplaceholder.typicode.com/users/"),
]).then(([users, posts]) => {
  //console.log(posts);
  //console.log(users);

  // Manipuler les données
  users.forEach((user) => {
    postPerUser = posts.filter(post => post.userId === user.id);

    d3.select(".tab")
      .append("p")
      .text(user.name + " : " + postPerUser.length + " posts");
  });

  posts.forEach((post) => {
    if (post.length > maxPostLength) {
      maxPostLength = post.length;
      userId.maxPostLength = post.userId;
    }
  });

  // Dessiner avec les données

  const margin = { top: 10, right: 40, bottom: 10, left: 40 },
    width = 450 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  d3.select("body").append("section").attr("id", "graph");

  const svg = d3.select("svg");
  svg
    .select("#graph")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const x = d3.scaleLinear().domain([users.length]).range([800, 0]);

  /* svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)); */

  const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

  svg.append("g").call(d3.axisLeft(y));

  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("font-weight", "bold")
    .attr("font-size", "12px")

    .attr("transform", "translate(-2,10)");

  svg
    .selectAll("bars")
    .data(users, posts)
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return x(d["nom_utilisateur"]) + 40;
    })
    .attr("y", function (d) {
      return y(d["posts"].length);
    })
    .attr("width", "60px")
    .attr("height", function (d) {
      return height - y(d["posts"].length);
    })
    .attr("fill", "green");
});