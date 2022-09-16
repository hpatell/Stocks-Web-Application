function logout() {
	clearlocalStorage();
	window.location = "/";
}

function getPortfolioValue(stocks, wallet) {
	var portVal = wallet;
	for (const [key, value] of Object.entries(stocks)) {
		console.log(value.current)
		console.log(value.numShares)
		if (value.numShares === undefined) {
			portVal += value.current
		}
		else {
			portVal += value.current * value.numShares;
		}
	}
	return portVal
}

function login(userObject) {

	let req = new XMLHttpRequest();
	req.open("POST", "/logIn", true);
	req.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			let response = JSON.parse(this.response);
			console.log(response);
			if (response["error"]) {
				alert(response["error"]["message"]);
			}
			if (response["code"] == 200) {
				console.log(response);
				let userData = response["userInfo"];
				localStorage.setItem("loggedin", true);
				localStorage.setItem("name", userData["username"]);
				localStorage.setItem("refreshStocks", 1);
				localStorage.setItem("wallet", parseFloat(userData["wallet"]));
				localStorage.setItem("stocks", (userData["stocks"] == undefined) ? "{}" : JSON.stringify(userData["stocks"]));
				localStorage.setItem("news", (userData["news"] == undefined) ? "[]" : JSON.stringify(userData["news"]));
				localStorage.setItem("pfp", userData["pfp"].split("=")[0]+"=s300-c");
				localStorage.setItem("showTutorial", userData["showTutorial"]);
				localStorage.setItem("uid", userData["uid"]);
				window.location = "/home.html";
			}
		}
	}

	req.setRequestHeader('Content-Type', 'application/json');

	req.send(JSON.stringify({
		"user": JSON.stringify(userObject)
	}));
}

/***********************/

function resetStocksAndNews() {
	localStorage.removeItem("news");
	localStorage.removeItem("stocks");
	window.location.reload();
}

function updateUsername(newUsername) {
	localStorage.setItem("name", newUsername);
	pushUserInfoToDatabase();
	window.location.reload();
}

function updatePFP() {
	alert("not yet implemented");
}

function updateWallet(newAmount, reload = false) {
	localStorage.setItem("wallet", (Math.round(newAmount * 100)) / 100);
	pushUserInfoToDatabase();
	displayUserInfo();
}

function updateStocks(newStocks) {
	localStorage.setItem("stocks", JSON.stringify(newStocks));
	console.log(newStocks);
	pushUserInfoToDatabase();
}

function updateNews(newNews) {
	localStorage.setItem("news", JSON.stringify(newNews));
	console.log(localStorage.getItem("news"));
	pushUserInfoToDatabase();
}

function clearlocalStorage() {
	localStorage.removeItem("name");
	localStorage.removeItem("wallet");
	localStorage.removeItem("stocks");
	localStorage.removeItem("news");
	localStorage.removeItem("pfp");
	localStorage.removeItem("loggedin");
	localStorage.removeItem("total value");
	localStorage.removeItem("showTutorial");
}

var timer;

function pushUserInfoToDatabase() {
	if (timer) {
		clearTimeout(timer);
	}

	timer = setTimeout(function () {
		let req = new XMLHttpRequest();
		req.open("PUT", "/updateUserData", true);
		req.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				console.log(this.response);
			}
		}
		req.setRequestHeader("Content-Type", "application/json");

		req.send(JSON.stringify({
			"id": getUserInfo()["uid"],
			"data": getUserInfo(false)
		}));
	}, 500);
}

function getUserInfo(includeLogin = true) {
	if (localStorage.getItem("loggedin") != undefined) {
		if (includeLogin) {
			return {
				"loggedin": localStorage.getItem("loggedin"),
				"username": localStorage.getItem("name"),
				"wallet": parseFloat((localStorage.getItem("wallet") == null) ? 0 : localStorage.getItem("wallet")),
				"stocks": JSON.parse(localStorage.getItem("stocks")),
				"news": JSON.parse(localStorage.getItem("news")),
				"pfp": localStorage.getItem("pfp"),
				"uid": localStorage.getItem("uid"),
				"showTutorial": parseInt(localStorage.getItem("showTutorial"))
			};
		} else {
			return {
				"username": localStorage.getItem("name"),
				"wallet": parseFloat((localStorage.getItem("wallet") == null) ? 0 : localStorage.getItem("wallet")),
				"stocks": JSON.parse(localStorage.getItem("stocks")),
				"news": JSON.parse(localStorage.getItem("news")),
				"pfp": localStorage.getItem("pfp"),
				"uid": localStorage.getItem("uid"),
				"showTutorial": parseInt(localStorage.getItem("showTutorial"))
			};
		}
	} else {
		return {
			"loggedin": false
		}
	}
}

function displayUserInfo() {
	var link = document.createElement("a");
	let userInfo = getUserInfo();
	link.href = "user.html";
	link.className = "nav-link";
	link.style.padding = "10px";
	var pfp = userInfo["pfp"];
	var wallet = userInfo["wallet"];
	var stocks = JSON.parse(localStorage.getItem("stocks"));
	var portfolioVal = getPortfolioValue(stocks, wallet);

	var userInfoContainer = document.createElement("div");
	userInfoContainer.id = "userInfoContainerNavbar";

	let pfpPreview = document.createElement("img");
	pfpPreview.id = "userPFPNavbar";
	pfpPreview.src = pfp;
	pfpPreview.style.height = "10%";


	let moneyContainer = document.createElement("div");
	moneyContainer.className = "navbarMoneyContainer";


	let walletAmountPreview = document.createElement("p");
	walletAmountPreview.id = "walletAmountPreviewNavbar";
	walletAmountPreview.innerHTML = "Current Wallet: $" + wallet;

	userInfoContainer.appendChild(pfpPreview);
	moneyContainer.appendChild(walletAmountPreview);
	userInfoContainer.appendChild(moneyContainer);

	link.appendChild(userInfoContainer);

	document.getElementById("nav-user").innerHTML = "";
	document.getElementById("nav-user").appendChild(link);
}