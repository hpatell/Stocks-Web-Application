function generateChart(id, object, useObjectSize = false) {
	var margin = 50;
	
	  // append the svg object to the body of the page
	  var container = d3.select("#"+id);
	  console.log("IN CHART");
	  console.log(container.node().clientWidth);
	  let width = container.node().clientWidth;
		var height = container.node().clientHeight;
	  if(!useObjectSize) {
		height = container.node().clientWidth*0.5;
	    }
	  
	  let symbol = object["symbol"];
	  console.log(width, height);
	  var svg = container
	  .append("svg")
		.attr("width", width)
		.attr("height", height)
		.classed("chart", true)
		.attr("id", "chartFor"+symbol);
	  
	  var graphContainer = svg.append("g")
		.attr("transform","scale("+((width-margin*2)/width)+") translate("+margin+",0)")
		let data = object["history"];
		console.log(d3.extent(data, function(d) {return d.date;}));
		console.log(d3.extent(data, function(d) {return d.value;}));
	  
	  // x axis 
	  var x = d3.scaleTime()
		.domain(d3.extent(data, function(d) { return new Date(d.date); }))
		.range([ 0, width ]);
	  var xAxis = graphContainer.append("g")
		.attr("transform", "translate(0," + (height) + ")")
		.call(d3.axisBottom(x))
		.classed("axis", true);
	
	  // y axis
	  var y = d3.scaleLinear()
		.domain([d3.min(data, function(d) { return +d.value; }), d3.max(data, function(d) { return +d.value; })])
		.range([ height, 0 ]);
	  graphContainer.append("g")
		.call(d3.axisLeft(y))
		.classed("axis", true);
	
	  // line
	  graphContainer.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", getGraphColor((object["color"] == undefined) ? 0 : object["color"]))
		.attr("stroke-width", 3)
		.attr("d", d3.line()
		  .x(function(d) { return x(new Date(d.date)) })
		  .y(function(d) { return y(d.value) })
		  )
		.classed("graphLine", true);
		
	  svg
		.selectAll('text')
		.style("fill","black");
	  svg
		.selectAll(".axis")
		.selectAll("path")
		.attr("stroke", "black");
	  svg
		.selectAll(".axis")
		.selectAll("line")
		.attr("stroke", "black");
}

function isDarkMode() {
  return window.matchMedia("(prefers-color-scheme:dark)").matches;
}

let graphColors = [
  {
	name: "Red",
	light: "#ed4d6d",
	dark: "#ed4d6d"
  },
  {
    name: "Orangered",
	light: "#ed7658",
	dark: "#ed7658"
  },
  {
    name: "Orange",
	light: "#eda83f",
	dark: "#eda83f"
  },
  {
    name: "Yellow",
	light: "#f2c93f",
	dark: "#f2d65d"
  },
  {
    name: "Green",
	light: "#74de66",
	dark: "#74de66"
  },
  {
    name: "Turquoise",
	light: "#79d9b1",
	dark: "#79d9b1"
  },
  {
    name: "Blue",
	light: "#70b4cf",
	dark: "#70b4cf"
  },
  {
    name: "Purple",
	light: "#c1a3de",
	dark: "#c1a3de"
  },
  {
    name: "Pink",
	light: "#eda3de",
	dark: "#eda3de"
  }
];

function getGraphColor(colorIndex) {
  return(graphColors[colorIndex].light);
}

function updateChartColor(object) {
	console.log("updating chart color");
	d3.select("body")
		.selectAll("#chartFor"+object["symbol"])
		.selectAll(".graphLine")
		.attr("stroke", getGraphColor((object["color"] == undefined) ? 0 : object["color"]));
}

function updateAllChartColors() {
	
}

function setChartColor(object, value) {
	var storedStocks = getUserInfo()["stocks"];
	storedStocks[removeBadCharacters(object["name"])]["color"] = value;
	updateStocks(storedStocks);
	updateChartColor(storedStocks[removeBadCharacters(object["name"])]);
}