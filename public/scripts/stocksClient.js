function removeBadCharacters(name) {
	return name.replace(new RegExp("([\\.\\#\\$\\/\\[\\]])","g"), "");
}

function createStockObjectContainer(stockObject, addChart, showBorder, isSearch) {
	var titleObject = document.createElement("h2");
	titleObject.className = "stockObjectTitle";
	var priceObject = document.createElement("p");
	priceObject.className = "stockObjectPrice";
	var hiObject = document.createElement("p");
	var loObject = document.createElement("p");
	var lastUpdatedObject = document.createElement("p");
	lastUpdatedObject.className = "stockObjectLastUpdated";
	
	titleObject.innerHTML = (stockObject["name"]+" ("+stockObject["symbol"]+")")
	priceObject.innerHTML = ("Current: "+stockObject["current"]+" (<span class='"+((stockObject["delta"] < 0) ? "negativeStock" : "positiveStock")+"'>"+((stockObject["delta"] >= 0) ? "+" : "")+stockObject["delta"]+"</span>)"+((stockObject["numShares"] != undefined) ? (" | "+stockObject["numShares"]+" Share"+((parseInt(stockObject["numShares"]) == 1) ? "" : "s")) : ""));
	hiObject.innerHTML = ("High: "+stockObject["high"]);
	hiObject.className = "hiObject";
	loObject.innerHTML = ("Low: "+stockObject["low"]);
	loObject.className = "loObject";
	lastUpdatedObject.innerHTML = "Last Updated: "+dateToString(new Date(stockObject["lastUpdated"]))+" (Cached)";
	let container = document.createElement("div");
	if(!isSearch) {
		container.className = "stockInfoContainerInList";
	} else {
		container.className = "stockInfoContainerSearch";
	}
	
	var divider = document.createElement("div");
	divider.className = "stockHiLoDivider";
	
	var hiLoContainer = document.createElement("div");
	hiLoContainer.className = "stockHiLoContainer";
	hiLoContainer.appendChild(hiObject);
	hiLoContainer.appendChild(divider);
	hiLoContainer.appendChild(loObject);
	
	if(addChart) {
		var leftContainer = document.createElement("div");
		var rightContainer = document.createElement("div");
		
		leftContainer.className = "stockInfoContainerLeftColumn";
		rightContainer.className = "stockInfoContainerRightColumn";
		
		var leftContainerTextContent = document.createElement("div");
		leftContainerTextContent.className = "stockDetailsContainer";
		
		leftContainerTextContent.appendChild(priceObject);
		leftContainerTextContent.appendChild(hiLoContainer);
		leftContainerTextContent.appendChild(lastUpdatedObject);
		
		leftContainer.appendChild(titleObject);
		leftContainer.appendChild(leftContainerTextContent);
		
		container.appendChild(leftContainer);
		container.appendChild(rightContainer);
		
		var wrapper = document.createElement("div");
		wrapper.id =  "stockContainer"+((isSearch) ? "Search" : stockObject["symbol"]);
		wrapper.className = "stockContainerWrapper"
		
		if(showBorder) {
			wrapper.className += " module";
		}
		
		wrapper.appendChild(container);
		
		return wrapper;
	} else {
		container.appendChild(titleObject);
		let detailContainer = document.createElement("div");
		detailContainer.className = "stockDetailsContainer";
		detailContainer.appendChild(priceObject);
		detailContainer.appendChild(hiLoContainer);
		detailContainer.appendChild(lastUpdatedObject);
		container.appendChild(detailContainer);
		
		detailContainer.style.marginTop = "20px";
		detailContainer.style.marginBottom = "20px";
		
		container.id =  "stockContainer"+((isSearch) ? "Search" : stockObject["symbol"]);
		
		return container;
	}
}

function displayStock(stockObject, id, addChart, showBorder, isSearch = false) {
	let stockContainerObject = createStockObjectContainer(stockObject, addChart, showBorder, isSearch);
	
	document.getElementById(id).appendChild(stockContainerObject);
	
	if(addChart) {
		var graphContainer = document.createElement("div");
		graphContainer.id = "graphFor"+stockObject["symbol"];
		graphContainer.className = "graphContainer";
		var rightColumn = stockContainerObject.getElementsByClassName("stockInfoContainerRightColumn")[0];
		
		graphContainer.style.width = (rightColumn.clientWidth)+"px";
		rightColumn.appendChild(graphContainer);
		
		for(date of stockObject["history"]) {
			date["date"] = new Date(date["date"]);
		}
		
		generateChart(graphContainer.id, stockObject);
		
		let chartColorPicker = document.createElement("select");
		chartColorPicker.className = "chartColorPicker form-select";
		chartColorPicker.oninput = function() {
			setChartColor(stockObject, parseInt(this.value));
		}
		
		for(var i = 0; i < graphColors.length; i++) {
			let option = document.createElement("option");
			option.value = i;
			option.innerHTML = graphColors[i].name;
			chartColorPicker.appendChild(option);
		}
		
		chartColorPicker.value = (stockObject["color"] == undefined) ? 0 : stockObject["color"];
		
		
		rightColumn.appendChild(chartColorPicker);
		
		if(!window.matchMedia("(orientation:portrait)").matches) {
			stockContainerObject.getElementsByClassName("stockInfoContainerLeftColumn")[0].style.height = (stockContainerObject.clientHeight-40)+"px";
		}
	}
	
	if(!isSearch) {
		let loadInSearchContainer = document.createElement("button");
		loadInSearchContainer.className = "btn loadInSearchButton";
		loadInSearchContainer.addEventListener("click", () => {
			document.body.scrollTop = 0;
			document.documentElement.scrollTop = 0;
			document.getElementById("searchInput").value = "";
			search(stockObject["symbol"]);
		})
		loadInSearchContainer.innerHTML = "View Realtime Info";
		stockContainerObject.getElementsByClassName("stockInfoContainerLeftColumn")[0].appendChild(loadInSearchContainer);
	}
	
	return stockContainerObject;
}

// description is only included here for cleanliness of the final object
function loadStockInfo(symbol, description) {
	return new Promise(resolve => {
		let req = new XMLHttpRequest();
		req.open("POST", "/getStockInfo", true);
		req.onreadystatechange = function() {
			if(this.readyState == 4 && this.status == 200) {
				console.log(this.response);
				resolve(JSON.parse(this.response));
			}
		}
		
		req.setRequestHeader('Content-Type', 'application/json');
		
		req.send(JSON.stringify({
			"symbol":symbol,
			"description": description
		}));
	})
}

function refreshStock(stock) {
	return new Promise(async (resolve) => {
		let result = await loadStockInfo(stock["symbol"], stock["name"]);
		resolve(result);
	});
}

async function refreshAllStocks() {
	var storedStocks = getUserInfo()["stocks"];
	var newStocks = [];
	console.log("REFRESHING STOCKS");
	if(storedStocks.length > 5) {
		var i = 1;
		var timeOffset  = 0;
		for(stock of Object.keys(storedStocks)) {
			setTimeout(() => {
				newStocks.push(refreshStock(storedStocks[stock]));
			}, timeOffset);
			i += 1;
			if(i%5 == 0) {
				timeOffset+=60000;
			}
		}
	} else {
		for(stock of Object.keys(storedStocks)) {
			newStocks.push(refreshStock(storedStocks[stock]));
		}
	}
	
	Promise.all(newStocks).then((stocks) => {
		for(stock of stocks) {
			oldNumShares = storedStocks[stock["name"]]["numShares"];
			stock["numShares"] = oldNumShares;
			storedStocks[stock["name"]] = stock;
		}
		updateStocks(storedStocks);
		localStorage.setItem("refreshStocks", 0);
		loadAllStocks(false);
	});
	
	// for (stock of Object.keys(stocksCopy)) {
	// 	var stockObject = stocksCopy[stock];
	// 	console.log(stockObject)
	// 	if (stocksCopy.length > 5) {
	// 		setTimeout(async () => {
	// 			console.log(stockObject["symbol"])
	// 			stocksCopy["history"] = await loadStockInfo(stockObject["symbol"], stockObject["name"]);
	// 		}, 12000);
	// 	} else {
	// 		(async () => {
	// 			console.log(stockObject["symbol"])
	// 			stocksCopy["history"] = await loadStockInfo(stockObject["symbol"], stockObject["name"]);
	// 		})();
	// 	}
	// }
	// 
	// Promise.all(stocksCopy).then((stocks) => {
	// 	console.log("STOCKS!!!!!!!!!!!!!!");
	// 	updateStocks(stocks);
	// 	localStorage.setItem("refreshStocks", false);
	// });
}

function buyShare(stockObject, numShares) {
	console.log("buying "+numShares+" shares");
	console.log(stockObject);
	
	let price = stockObject["current"];
	var wallet = getUserInfo()["wallet"];
	
	if (price * numShares <= wallet) {
		wallet-=price * numShares;
		
		var storedNews = getUserInfo()["news"];
		var storedStocks = getUserInfo()["stocks"];
		console.log(storedStocks);
		
		if(storedNews == null) {
			storedNews = []
		}
		
		if(storedStocks == null) {
			storedStocks = {};
		}
		
		console.log(storedNews);
		
		var loadNews = false;
		
		if(storedStocks[removeBadCharacters(stockObject["name"])] == undefined) {
			console.log("CREATING NEW OBJECT");
			storedStocks[removeBadCharacters(stockObject["name"])] = stockObject;
			storedStocks[removeBadCharacters(stockObject["name"])]["numShares"] = numShares;
			storedNews.push(removeBadCharacters(stockObject["name"]));
			loadNews = true;
		} else {
			console.log("UPDATING EXISTING OBJECT");
			oldObject = storedStocks[removeBadCharacters(stockObject["name"])];
			storedStocks[removeBadCharacters(stockObject["name"])] = stockObject;
			storedStocks[removeBadCharacters(stockObject["name"])]["numShares"] = parseInt(oldObject["numShares"])+numShares;
			storedStocks[removeBadCharacters(stockObject["name"])]["lastUpdated"] = stockObject["lastUpdated"];
		}
		console.log("=========");
		
		updateWallet(wallet);
		updateStocks(storedStocks);
		updateNews(storedNews);
		displayUserInfo();
		loadAllStocks(loadNews);
	} else {
		alert("Price of Stock exceeds wallet!")
	}
}

function updateStockObject(symbol, stockObject) {
	var storedStocks = getUserInfo()["stocks"];
	
	if(storedStocks[removeBadCharacters(stockObject["name"])] == undefined) {
		return;
	}
	
	oldNumShares = storedStocks[removeBadCharacters(stockObject["name"])]["numShares"];
	
	storedStocks[removeBadCharacters(stockObject["name"])] = stockObject;
	storedStocks[removeBadCharacters(stockObject["name"])]["numShares"] = oldNumShares;
	storedStocks[removeBadCharacters(stockObject["name"])]["lastUpdated"] = new Date();
	
	updateStocks(storedStocks);
	loadAllStocks(false);
}

function sellShare(stockObject, numShares) {
	console.log("selling "+numShares+" shares");
	console.log(stockObject);
	
	let price = stockObject["current"];
	var wallet = getUserInfo()["wallet"];
	
	wallet+=price * numShares;
	
	var storedNews = getUserInfo()["news"];
	var storedStocks = getUserInfo()["stocks"];
	
	if(storedStocks[removeBadCharacters(stockObject["name"])]["numShares"]-numShares < 1) {
		delete storedStocks[removeBadCharacters(stockObject["name"])];
		storedNews.splice(storedNews.indexOf(removeBadCharacters(stockObject["name"])),1);
	} else {
		var oldObject = storedStocks[removeBadCharacters(stockObject["name"])];
		storedStocks[removeBadCharacters(stockObject["name"])] = stockObject;
		storedStocks[removeBadCharacters(stockObject["name"])]["numShares"] = oldObject["numShares"]-numShares;
		storedStocks[removeBadCharacters(stockObject["name"])]["lastUpdated"] = new Date();
	}
	
	updateWallet(wallet);
	updateStocks(storedStocks);
	updateNews(storedNews);
	
	displayUserInfo();
	loadAllStocks();
}

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dateToString(date) {
	return (
		(
			months[date.getMonth()] +
			" " + 
			date.getDate()
		) + 
		", " + 
		((date.getHours() < 10) ? "0" : "") + 
		date.getHours() + 
		":" + 
		((date.getMinutes() < 10) ? "0" : "") + 
		date.getMinutes() + 
		":" + 
		((date.getSeconds() < 10) ? "0" : "") + 
		date.getSeconds()
	);
}

function loadAllStocks(loadNews = true) {
	var stocks = getUserInfo()["stocks"];
	var allStocksContainer = document.getElementById("allStocksHolder");
	var newsStoriesContainer = document.getElementById("table_holder");
	if(stocks == null) {
		allStocksContainer.innerHTML = "No stocks in your portfolio.";
		newsStoriesContainer.innerHTML = "News stories will show up after you add stocks to your portfolio.";
		return;
	}
	
	allStocksHolder.innerHTML = "";
	
	if(stocks.length == 0) {
		allStocksContainer.innerHTML = "No stocks in your portfolio.";
		newsStoriesContainer.innerHTML = "News stories will show up after you add stocks to your portfolio.";
	} else {
		for(var stock of Object.keys(stocks)) {
			displayStock(stocks[stock], "allStocksHolder", true, true);
		}
		if(loadNews) {
			getNews();
		}
	}
}

var currentWebSocket;

function openWebSocket(stockObject) {
	let symbol = stockObject["symbol"];
	let price = stockObject["current"];
	let delta = stockObject["delta"];
	
	const url = "ws://localhost:3000";
	currentWebSocket = new WebSocket(url);
	
	  currentWebSocket.onopen = () => {
		console.log("connection to server opened");
		currentWebSocket.send(JSON.stringify({"symbol":symbol}));
	  };
	
	  currentWebSocket.onmessage = (e) => {
		let data = JSON.parse(e.data);
		if(data["type"] == "trade") {
			let date = new Date(data["date"]);
			let lastPrice = data["lastPrice"];
			
			let newDiff = Math.round((delta - (price - lastPrice)) * 100) / 100;
			
			let searchStockContainer = document.getElementById("searchStockInfo");
			searchStockContainer.getElementsByClassName("stockObjectPrice")[0].innerHTML = "Current: "+lastPrice+" (<span class='"+((newDiff < 0) ? "negativeStock" : "positiveStock")+"'>"+((newDiff >= 0) ? "+" : "")+newDiff+"</span>)";
			searchStockContainer.getElementsByClassName("stockObjectLastUpdated")[0].innerHTML = "Last Updated: "+dateToString(date)+" (Realtime)";
		} else {
			if(data["type"] == "error") {
				alert("websocket error: "+data["message"]);
				currentWebSocket.close();
			} else {
				console.log("received message: "+data["message"]);
			}
		}
	  };
	
	  currentWebSocket.onerror = (err) => {
		console.log(`WebSocket error: ${err}`);
	  };
}