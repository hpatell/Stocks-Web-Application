const https = require('https');
const WebSocket = require('ws');
module.exports = {loadStock, openWebSocket, closeWebSocket};

function loadStockPrice(symbol) {
	return new Promise(resolve => {
		// let r = new XMLHttpRequest();
		https.get("https://finnhub.io/api/v1/quote?symbol=" + symbol + "&token=c548e3iad3ifdcrdgh80", (resp) => {
			let data = '';
			
			resp.on('data', (chunk) => {
				data+=chunk;
			})
			
			resp.on('end', () => {
				resolve(JSON.parse(data));
			});
			
			resp.on('error', (err) => {
				resolve(err);
			})
		})
			// .then(async response => {
			// 	if(response.status == 200) {
			// 		let obj = response.json();
			// 		resolve(obj);
			// 	} else if(response.status == 403) {
			// 		resolve("Cannot access this symbol.");
			// 	} else {
			// 		resolve("nope");
			// 	}
			// })
		// r.onreadystatechange = function () {
		// 	if (this.readyState == 4) {
		// 		if (this.status == 200) {
		// 			let obj = JSON.parse(this.response);
		// 			resolve(obj);
		// 		} else if (this.status == 403) {
		// 			resolve("Cannot access this symbol.");
		// 		}
		// 	}
		// }
		// r.send();
	});
}

function loadStockHistory(symbol) {
	return new Promise(resolve => {
		https.get("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" + symbol + "&interval=60min&outputsize=full&apikey=AN5BTH22T0R74PI0", (res) => {
			var data = '';
			
			res.on('data', (chunk)=> {
				data+=chunk;
			})
			
			res.on('end', ()=> {
				var responseObject = JSON.parse(data);
				responseObject = responseObject["Time Series (60min)"];
				var newObject = [];
				var lowerBound = new Date();
				lowerBound.setDate(lowerBound.getDate() - 7);
				for (key in responseObject) {
					let d = new Date(key.replace(" ", "T"));
					if (d < lowerBound) { break; }
					let openPrice = (responseObject[key]["1. open"]);
					
					var dateObject = {};
					
					dateObject.date = d;
					dateObject.value = openPrice;
					
					newObject.push(dateObject);
				}
				resolve(newObject);
			})
			
			res.on('error', (err)=> {
				resolve(err);
			})
		});
	});
}

function loadStock(object) {
	return new Promise(async (resolve) => {
		let symbol = object["symbol"]
		
		let priceObject = await loadStockPrice(symbol);
		let historyObject = await loadStockHistory(symbol);
		
		let outputObj = {
			"name":object["description"],
			"symbol":symbol,
			"current":priceObject["c"],
			"delta":priceObject["d"],
			"high":priceObject["h"],
			"low":priceObject["l"],
			"history":historyObject,
			"lastUpdated":new Date(),
			"color": 0
		}
		
		resolve(outputObj);
	});
}

var currentSocket;

function closeWebSocket() {
	if (currentSocket != undefined) {
		currentSocket.close();
	}
}

function openWebSocket(symbol, onMessage, onError, onOpen) {
	console.log("opening websocket to finnhub...");
	currentSocket = new WebSocket("wss://ws.finnhub.io?token=c548e3iad3ifdcrdgh80");
	
	currentSocket.onmessage = function(e) {
		let data = JSON.parse(e.data);
		if (data["type"] == "trade") {
			let date = new Date(data["data"][0]["t"]);
			let lastPrice = data["data"][0]["p"];
			
			onMessage({
				"type":"trade",
				"symbol":symbol,
				"date":date,
				"lastPrice":lastPrice
			});
		}
	};
	
	currentSocket.onopen = function (e) {
		currentSocket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': symbol }));
		onOpen(e);
	}
	
	currentSocket.onclose = function() {
		console.log("websocket to finnhub closed");
	}
	
	currentSocket.onerror = onError;
	
// 	let socket = new WebSocket("wss://ws.finnhub.io?token=c548e3iad3ifdcrdgh80");
// 	socket.onmessage = function (e) {
// 		let data = JSON.parse(e.data);
// 		if (data["type"] == "trade") {
// 			let date = new Date(data["data"][0]["t"]);
// 			let lastPrice = data["data"][0]["p"];
// 			// let newDiff = Math.round((currentDiff - (currentPrice - lastPrice)) * 100) / 100;
// 			
// 			let searchStockContainer = document.getElementById("searchStockInfo");
// 			
// 			searchStockContainer.getElementsByClassName("stockObjectPrice")[0].innerHTML = "Current: "+lastPrice;
// 			searchStockContainer.getElementsByClassName("stockObjectLastUpdated")[0].innerHTML = "Last Updated: "+dateToString(date)+" (Realtime)";
// 		}
// 	};
// 	socket.onopen = function (e) {
// 		socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': symbol }))
// 	};
// 	socket.onerror = function (e) {
// 		console.log(e.data);
// 	};
// 
// 	currentSocket = socket;
}