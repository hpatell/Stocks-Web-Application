var searchLoaded = false

function searchOnEnter(e) {
	if (e.code == "Enter") {
		search(e.originalTarget.value);
	}
}

function onSearchFocused() {
	document.addEventListener("keydown", searchOnEnter)
}

function onSearchBlurred() {
	document.removeEventListener("keydown", searchOnEnter);
}

function createBuyShareButton(stockObject) {
	let button = document.createElement("button");
	button.className = "btn interactStockButton";
	button.id = "buyButton";
	button.addEventListener("click", () => {
		console.log("===========")
		var userInput = prompt("Please enter number of stocks", "1");
		var num = parseInt(userInput);
		
		buyShare(stockObject, num);
	})
	button.innerHTML = "Buy Share";
	return button;
}

function createSellShareButton(stockObject) {
	let button = document.createElement("button");
	button.className = "btn interactStockButton";
	button.id = "sellButton";
	button.addEventListener("click", () => {
		var userInput = prompt("Please enter number of stocks", "1");
		var num = parseInt(userInput);

		sellShare(stockObject, num);
	})
	button.innerHTML = "Sell Share";
	return button;
}

function searchForSymbol(value) {
	return new Promise(resolve => {
		let req = new XMLHttpRequest();
		req.open("POST", "/searchForSymbol", true);
		req.onreadystatechange = function() {
			if(this.readyState == 4 && this.status == 200) {
				resolve(JSON.parse(this.response));
			}
		}
		
		req.setRequestHeader('Content-Type', 'application/json');
		
		req.send(JSON.stringify({
			"value":value
		}));
	})
}

async function search(value) {
	if(value == undefined) {
		value = document.getElementById("searchInput").value;
	}
	
	if(value == "") {
		alert("Please enter a search term.");
		return;
	}
	
	if(currentWebSocket) {
		currentWebSocket.close();
		currentWebSocket = null;
	}
	
	searchLoaded = false;
	
	document.getElementById("searchButton").innerHTML = "Searching...";
	
	var searchContainer = document.getElementById("searchStockInfo");
	var stockChartContainer = document.getElementById("stockChartContainer");
	
	let stockObject = await searchForSymbol(value);
	
	//updateStockObject(stockObject["symbol"], stockObject);
		
	searchContainer.innerHTML = "";
	stockChartContainer.innerHTML = "";
	
	let stockContainer = displayStock(stockObject, "searchStockInfo", false, false, true);
	
	stockContainer.appendChild(createBuyShareButton(stockObject));
	stockContainer.appendChild(createSellShareButton(stockObject));
	
	generateChart("stockChartContainer", stockObject, true);
	
	document.getElementById("searchButton").innerHTML = "Search";
	
	searchLoaded = true;
	
	openWebSocket(stockObject);
}