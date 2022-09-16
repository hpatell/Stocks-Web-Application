var stocksOnGraph = []

function getAllStocks() {
	let stocks = getUserInfo()["stocks"];
	
	console.log(stocks);
	
	var stockPrices = [];
	var dates = [];
	
	var firstLoad = false;
	
	if(stocksOnGraph.length == 0) {
		firstLoad = true;
		for(stock of Object.keys(stocks)) {
			stocksOnGraph = stocksOnGraph.concat({"name": stocks[stock]["name"], "symbol": stocks[stock]["symbol"], "enabled": true});
		}
	}
	
	console.log(stocksOnGraph);
	
	for(stock of stocksOnGraph) {
		if(stock["enabled"]) {
			for(price of stocks[stock["name"]]["history"]) {
				stockPrices = stockPrices.concat(parseFloat(price["value"]));
				if(!dates.includes(price["date"])) {
					dates = dates.concat(price["date"]);
				}
			}
		}
	}
	document.getElementById("stockChartContainer").innerHTML = "";
	
	if(stockPrices.length == 0) {
		let notice = document.createElement("h2");
		notice.innerHTML = "No stocks enabled.";
		document.getElementById("stockChartContainer").appendChild(notice);
		return;
	}
	
	let minVal = parseInt(Math.min.apply(Math, stockPrices)*0.8); 
	let maxVal = parseInt(Math.max.apply(Math, stockPrices)*1.1);
	
	var graphContainer = createGraphContainer("stockChartContainer", minVal, maxVal, dates);
	
	var i = 0;
	for(stock of stocksOnGraph) {
		if(stock["enabled"]) {
			let stockObject = stocks[stock["name"]];
			
			let color = graphColors[i]["light"];
			
			addStockToGraph(graphContainer[0], graphContainer[1], graphContainer[2], stockObject["history"], color);
			i = (i+1)%graphColors.length;
			
			if(firstLoad) {
				addCheckboxToList(stockObject["name"], stockObject["symbol"], color);
			}
		}
	}
}

function createGraphContainer(id, minVal, maxVal, dates) {
	var margin = 50;
	
	  // append the svg object to the body of the page
	  var container = d3.select("#"+id);
	  container.innerHTML = "";
	  let width = container.node().clientWidth;
	  let height = container.node().clientHeight;
	  console.log(width, height);
	  var svg = container
	  .append("svg")
		.attr("width", width)
		.attr("height", height)
		.classed("chart", true)
	  
	  var graphContainer = svg.append("g")
		.attr("transform","scale("+((width-margin*2)/width)+") translate("+margin+",0)")
	  
	  // x axis 
	  var x = d3.scaleTime()
		.domain(d3.extent(dates, function(d) { return new Date(d); }))
		.range([ 0, width ]);
	  var xAxis = graphContainer.append("g")
		.attr("transform", "translate(0," + (height) + ")")
		.call(d3.axisBottom(x))
		.classed("axis", true);
	
	  // y axis
	  var y = d3.scaleLinear()
		.domain([minVal, maxVal])
		.range([ height, 0 ]);
	  graphContainer.append("g")
		.call(d3.axisLeft(y))
		.classed("axis", true);
		
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
	
	return [graphContainer, x, y];
}

function addStockToGraph(graphContainer, x, y, data, color) {
	graphContainer.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", color)
		.attr("stroke-width", 3)
		.attr("d", d3.line()
		  .x(function(d) { return x(new Date(d.date)) })
		  .y(function(d) { return y(d.value) })
		  )
		.classed("graphLine", true);
}

function addCheckboxToList(name, symbol, color) {
	let listContainer = document.getElementById("checkBoxContainer");
	
	/*
		<input class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
		  <label class="form-check-label" for="flexCheckDefault">
			Default checkbox
		  </label>
	*/
	
	let checkBox = document.createElement("input");
	checkBox.className = "form-check-input";
	checkBox.type = "checkbox";
	checkBox.checked = true;
	checkBox.name = "checkbox"+symbol;
	checkBox.addEventListener("input", hideStockOnGraph);
	checkBox.style.backgroundColor = color;
	checkBox.style.borderColor = color;
	checkBox.style.marginRight = "10px";
	
	let labelElement = document.createElement("label");
	labelElement.setAttribute("for", "checkbox"+symbol);
	labelElement.className = "form-check-label";
	labelElement.innerHTML = name;
	
	listContainer.appendChild(checkBox);
	listContainer.appendChild(labelElement);
	listContainer.appendChild(document.createElement("br"));
}

function hideStockOnGraph(e) {
	var checked = (e.target.checked);
	var symbol = (e.target.name.replace("checkbox", ""))
	
	for(stock of stocksOnGraph) {
		if(stock["symbol"] == symbol) {
			stock["enabled"] = checked;
		}
	}
	getAllStocks();
}

function displayPortfolioValue() {
	const userInfo = getUserInfo();
	document.getElementById("portfolioValueDisplay").innerHTML = '$'+getPortfolioValue(userInfo["stocks"], userInfo["wallet"]);
}