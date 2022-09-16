var express = require('express');

var app = express();

app.use(express.static('public'));
app.use(express.json());

app.listen(8080, () => {
		console.log("server running at http://localhost:8080");
	});

const stocks = require('./scripts/stocks.js');
const search = require('./scripts/search.js');
const user = require('./scripts/user.js');
const news = require('./scripts/news.js');
const https = require('https');
const fs = require('fs');

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 })

wss.on('connection', ws => {
	console.log("websocket opened");

	ws.on('message', message => {
		let data = JSON.parse(message.toString());
		console.log("received message from client");

		stocks.openWebSocket(data["symbol"],
			function(data) {
				console.log("received data from finnhub");
				ws.send(JSON.stringify(data));
			},
			function(e) {
				console.log("received error: "+e.data);
				ws.send(JSON.stringify({
					"type": "error",
					"message": e.data
				}));
			},
			function(e) {
				console.log("opened connection to finnhub");
				ws.send(JSON.stringify({
					"type": "message",
					"message": "connection to finnhub made"
				}));
			}
		);
	});
	
	ws.on('close', () => {
		console.log("websocket closed");
		stocks.closeWebSocket();
	})
});

app.post("/logIn", function(req, res) {
	console.log("signing in...");
	(async () => {
		let response = await user.logIn(JSON.parse(req.body["user"]));
		res.json(response);
	})();
})

app.post("/getUserData", function(req, res) {
	console.log("getting user data...");
	(async () => {
		let response = await user.getUserInfo(JSON.parse(req.body["id"]));
		
		res.json(response);
	})();
});

app.put("/updateUserData", function(req, res) {
	console.log("updating user data...");
	(async () => {
		let response = await user.updateUserInfo(req.body["id"], req.body["data"]);
		res.json(response);
	})();
});

app.post("/searchForSymbol", function(req, res) {
	console.log("searching for symbol...");
	(async () => {
		stocks.closeWebSocket();
		let symbol = req.body["value"];
		let response = await search.searchForSymbol(symbol);
		let stockObject = await stocks.loadStock(response);
		
		res.send(stockObject);
	})();
});

app.post("/getNews", function(req, res) {
	console.log("getting news from stocks...");
	(async () => {
		let response = await news.getNews(req.body["stocks"], req.body["from"], req.body["to"]);
		
		res.json(response);
	})();
});

app.get("/getTopNews", function(req, res) {
	console.log("getting top news story...");
	(async () => {
		let response = await news.getTopNewsStory();
		res.json(response);
	})();
});