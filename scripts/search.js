const https = require('https');
module.exports = {searchForSymbol}

function searchForSymbol(symbol) {
	return new Promise(resolve=> {
		// let r = new XMLHttpRequest();
		https.get("https://finnhub.io/api/v1/search?q=" + symbol + "&token=c548e3iad3ifdcrdgh80", (resp) => {
			  let data = '';
			
			  // A chunk of data has been received.
			  resp.on('data', (chunk) => {
				data += chunk;
			  });
			
			  // The whole response has been received. Print out the result.
			  resp.on('end', () => {
				let obj = JSON.parse(data);
				if (parseInt(obj["count"]) > 0) {
					let firstResult = obj["result"][0];
					resolve(firstResult);
				} else {
					resolve("Could not find symbol.");
				}
			  });
			
			}).on("error", (err) => {
			  resolve("Error: " + err.message);
			});
		// r.onload = function () {
		// 	if (this.status == 200) {
		// 		document.getElementById("searchStockInfo").style["visibility"] = "visible";
		// 		let obj = JSON.parse(this.response);
		// 		if (parseInt(obj["count"]) > 0) {
		// 			let firstResult = obj["result"][0];
		// 			resolve(firstResult);
		// 		} else {
		// 			document.getElementById("name").innerHTML = "Could not find symbol."
		// 		}
		// 	}
		// }
		// r.send();
	})
}