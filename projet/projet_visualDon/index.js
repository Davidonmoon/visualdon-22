Promise.all([
  d3.csv("./ucdp-prio-acd-211.csv"),
  d3.json("./world.geojson"),
]).then(([data, geo]) => {
  d3.select(".container").call(map, data, geo);
});

function map(container, raw, geo) {
  const data = parse(raw, geo);

  //size
  const width = 1200;
  const height = 700;
  const margin = { left: 10, right: 10, top: 10, bottom: 10 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  //scale
  const maxConflictCnt = d3.max(
    data.features
      .map((d) =>
        d.properties.data
          ? Object.values(d.properties.data).map((dd) => dd.length)
          : 0
      )
      .flat()
  );

  const colors = (cnt) => {
    const scale = d3
      .scaleLinear()
      .domain([1, cnt + 1])
      .range([0.8, 0]);

    return d3.range(1, cnt + 1).map((d) => d3.interpolateViridis(scale(d)));
  };

  const color = d3
    .scaleLinear()
    .domain(d3.range(0, maxConflictCnt + 1))
    .nice()
    .range(["#DCDCDC", ...colors(maxConflictCnt)]);

  //geoGenerator
  const geoGenerator = d3.geoPath().projection(
    d3
      .geoNaturalEarth1()
      .center([0, 0])
      .translate([margin.left + innerWidth / 2, margin.top + innerHeight / 2])
      .scale(230)
  );

  //slider
  const yearExtent = d3.extent(raw, (d) => d.year);
  var initYear = yearExtent[0];
  slider(container, ...yearExtent, initYear, (value) => {
    tooltip(container);
    update(value);
    d3.select("h1").text("Armed conflict in  " + value);
  });

  //create svg
  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  //map
  const gMap = svg.append("g");

  //legend
  svg
    .append("g")
    .attr(
      "transform",
      (d) => `translate(${width - margin.left - 40},${margin.top})`
    )
    .call(legend);
  //zoom

  const zoomInit = d3
    .zoom()
    .scaleExtent([1, 8])
    .translateExtent([
      [0, 0],
      [width, height],
    ])
    .on("zoom", handleZoom);
  function handleZoom(e) {
    gMap.attr("transform", e.transform);
  }
  svg.call(zoomInit);

  update(initYear);

  return update;

  function update(currentYear) {
    const gItem = gMap
      .selectAll("g")
      .data(data.features, (d) => d.properties.name)
      .join("g")
      .attr("cursor", (d) =>
        d.properties.data && d.properties.data[currentYear]
          ? "pointer"
          : "default"
      );

    gItem.each(function (d) {
      d3.select(this)
        .selectAll("path")
        .data([true])
        .join("path")
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("d", geoGenerator(d))
        .attr("opacity", 0.9)
        .transition()
        .duration(200)
        .attr(
          "fill",
          d.properties.data && d.properties.data[currentYear]
            ? color(d.properties?.data[currentYear].length)
            : "#DCDCDC"
        );

      d3.select(this)
        .selectAll("text")
        .data([true])
        .join("text")
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "middle")
        .attr("fill", "rgba(0,0,0,0.7)")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .attr("x", geoGenerator.centroid(d)[0])
        .attr("y", geoGenerator.centroid(d)[1])
        .attr("visibility", "hidden")
        .text(d.properties.name);
    });

    gItem
      .on("mouseover", function () {
        d3.select(this).raise();
        d3.select(this).select("text").attr("visibility", "visible");
      })
      .on("mouseout", function () {
        d3.select(this).select("text").attr("visibility", "hidden");
      });

    gItem.on("click", function (e, d) {
      const xy = d3.pointer(e, svg.node());

      const dd = d.properties.data ? d.properties.data[currentYear] : undefined;
      tooltip(container, ...xy, dd);
    });
  }

  function legend(g) {
    const rectWidth = 15;
    const rectHeight = 15;
    const ticks = color.domain();
    ticks.sort((a, b) => b - a);

    g.selectAll("text.tittle")

    g.selectAll("rect")
      .data(ticks)
      .join("rect")
      .attr("fill", (d) => color(d))
      .attr("opacity", 0.9)
      .attr("stroke", "none")
      .attr("y", (d, i) => i * rectHeight)
      .attr("width", rectWidth)
      .attr("height", rectHeight);

    g.selectAll("text")
      .data(ticks)
      .join("text")
      .attr("dominant-baseline", "middle")
      .attr("text-anchor", "start")
      .attr("fill", "grey")
      .attr("font-size", 12)
      .attr("x", rectWidth + 10)
      .attr("y", (d, i) => (i + 1) * rectHeight + 1)
      .text((d) => d);
  }
  function parse(raw, geo) {
    //
    const match = {
      "Cambodia (Kampuchea)": "Cambodia",
      "Russia (Soviet Union)": "Russia",
      "United Kingdom": "England",
      "Bosnia-Herzegovina": "Bosnia and Herzegovina",
      "Hyderabad": "India",
      "Guinea-Bissau": "Guinea Bissau",
      "Grenada" : "England",
      "Comoros": "France",
      "Serbia (Yugoslavia)": "Republic of Serbia",
      "DR Congo (Zaire)": "Democratic Republic of the Congo",
      "Congo" : "Republic of the Congo",
      "Vietnam (North Vietnam)": "Vietnam",
      "South Vietnam": "Vietnam",
      "Madagascar (Malagasy)": "Madagascar",
      "Myanmar (Burma)": "Myanmar",
      "United States of America": "USA",
      "Yemen (North Yemen)": "Yemen",
      "South Yemen": "Yemen",
      "Zimbabwe (Rhodesia)": "Zimbabwe",
      "North Macedonia": "Macedonia",
      "Tanzania": "United Republic of Tanzania",
    };

    const allRaw = raw
      .map((d) =>
        d.location.split(",").map((dd) => ({
          ...d,
          locations: d.location,
          location: dd.trim(),
        }))
      )
      .flat();

    const locations = d3
      .rollups(
        allRaw,
        (v) =>
          d3
            .rollups(
              v,
              (vv) => vv,
              (d) => d.year
            )
            .reduce((prev, curr) => {
              prev[curr[0]] = curr[1];
              return prev;
            }, {}),
        (d) => (match[d.location] ? match[d.location] : d.location)
      )
      .map((d) => ({ name: d[0], data: d[1] }));

    locations.forEach((l) => {
      const found = geo.features.find((f) => f.properties.name == l.name);

      if (found) {
        found.properties.data = l.data;
      } else {
        console.log("not found", l);
      }
    });

    return geo;
  }
}

function slider(container, min, max, initValue, callback) {
  container
    .append("div")
    .attr("class", "slider")
    .append("input")
    .attr("class", "year-slider")
    .attr("type", "range")
    .attr("min", min)
    .attr("max", max)
    .attr("value", initValue)
    .attr("step", 1)
    .on("input", function () {
      callback(this.value);
    });
}

function tooltip(container, x = 0, y = 0, data) {
  const div = container
    .selectAll("div.tooltip")
    .data([true])
    .join("div")
    .attr("class", "tooltip")
    .style("left", x + 20 + "px")
    .style("top", y + 10 + "px")
    .style("visibility", data ? "visible" : "hidden");

  if (data == undefined) return;

  div
    .selectAll("div.location")
    .data([true])
    .join("div")
    .attr("class", "location")
    .text(data[0].location);

  const items = div
    .selectAll("div.item")
    .data(data)
    .join("div")
    .attr("class", "item");

  items.each(function (d) {
    var time = "";
    time += d.start_date ? d.start_date : "?";
    time += " - ";
    time += d.ep_end_date ? d.ep_end_date : "";

    d3.select(this)
      .selectAll("div.date")
      .data([true])
      .join("div")
      .attr("class", "date")
      .text(time);

    const ul = d3.select(this).selectAll("ul").data([true]).join("ul");

    ul.each(function () {
      d3.select(this)
        .selectAll("li")
        .data([d.side_a, d.side_b])
        .join("li")
        .text((a) => a);
    });
  });
}
