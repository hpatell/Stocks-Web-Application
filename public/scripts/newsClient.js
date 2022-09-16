async function getNews() {
	
	var storedNews = getUserInfo();
	storedNews = storedNews["news"];
	console.log(storedNews);
	
	if (!storedNews.length) {
		console.log("idiot")
		return;
	}
	
	uniq_stocks = Array.from(new Set(storedNews))
	console.log(uniq_stocks)
	var first_symb=[]
	uniq_stocks.forEach(
		s=>{
			flag=1;
			var array = s.split(" ")
			array.forEach(o=>{
				filter="LTD CO CORP INC INC-CLASS"
				if(filter.includes(o)){ 
					flag = 0;
				}
			})
			if(flag){
				first_symb.push(s);
			}
			else{
				first_symb.push(array[0]);
			}
	})
	//awful code
	uniq_stocks = first_symb;
	console.log(uniq_stocks)
	//date setup 
	var currentDate = new Date();
	var pastDate = new Date();
	pastDate.setMonth(pastDate.getMonth()-1);
	
	console.log(pastDate, currentDate);
	
	current_string = currentDate.getFullYear().toString() + (((currentDate.getMonth()+1) < 10) ? "0" : "") + (currentDate.getMonth()+1).toString() + ((currentDate.getDate() < 10) ? "0" : "") + currentDate.getDate().toString()
	
	past_string = pastDate.getFullYear().toString() + (((pastDate.getMonth()+1) < 10) ? "0" : "") + (pastDate.getMonth()+1).toString() + ((pastDate.getDate() < 10) ? "0" : "") + pastDate.getDate().toString()
	
	console.log(past_string +" " + current_string)
	//trying Promises - https://codeburst.io/javascript-making-asynchronous-calls-inside-a-loop-and-pause-block-loop-execution-1cb713fbdf2d
	//loading stories
	
	let req = new XMLHttpRequest();
	req.open("POST", "/getNews",true);
	req.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			let response = JSON.parse(this.response);
			cleaned_list=response["articles"]["full_article_list"];
			cleaned_list = cleaned_list.flat()
			console.log(cleaned_list)
			
			for (stock of cleaned_list) {
				var storedStocks = getUserInfo()["stocks"];
				var symbol;
				
				for(storedStock of Object.keys(storedStocks)) {
					if(storedStocks[storedStock]["name"].includes(stock["name"])) {
						symbol = storedStocks[storedStock]["symbol"];
						break;
					}
					
				}
				
				if(symbol != undefined) {
					console.log(symbol);
					var articleList = stock["articles"];
					function fy(a,b,c,d){
						c=a.length;while(c)b=Math.random()*(--c+1)|0,d=a[c],a[c]=a[b],a[b]=d
					}
					fy(articleList,[],[]);
					
					
					var stockObject = document.getElementById("stockContainer"+symbol);
					
					var newsTitle = document.createElement("h2");
					newsTitle.innerHTML = "News Stories";
					newsTitle.style.marginTop = "10px";
					
					stockObject.appendChild(newsTitle);
					
					let container = document.createElement("div");
					container.className = "newsArticleList";
					
					if(articleList.length > 0) {
						for(article of articleList) {
							let newsArticleObject = generateNewsArticleObject(article);
							container.appendChild(newsArticleObject);
						}
					}
					
					container.addEventListener("scroll", handleNewsListScroll);
					
					stockObject.appendChild(container);
					displayFade(container); 
				} else {
					console.log("could not find symbol for name");
				}
				
			}
			
			//shuffling list -
			// function fy(a,b,c,d){//array,placeholder,placeholder,placeholder
			// 	c=a.length;while(c)b=Math.random()*(--c+1)|0,d=a[c],a[c]=a[b],a[b]=d
			// }
			// fy(cleaned_list,[],[])
			//creating pages - https://stackoverflow.com/questions/55331172/pass-array-to-includes-javascript
			// cleaned_list.forEach(article => {
			// 	if (article.multimedia.length === 0) {
			// 		console.log("no image or bad title")
			// 	}
			// 	else {
			// 		let newsArticleObject = generateNewsArticleObject(article);
			// 		newsList.appendChild(newsArticleObject);
			// 	}
			// })
		}
	}
	
	req.setRequestHeader("Content-Type", "application/json");
	
	req.send(JSON.stringify({
		"stocks":uniq_stocks,
		"from":past_string,
		"to":current_string
	}));
}

function handleNewsListScroll(e) {
	displayFade(e.target);
}

function displayFade(target) {
	
	var scrollLeft = target.scrollLeft;
	var scrollRight = (target.scrollWidth-target.clientWidth)-scrollLeft;
	
	if(scrollLeft == 0 && scrollRight == 0) {
		target.className = "newsArticleList showGradientNone";
	} else if(scrollLeft > 0 && scrollRight == 0) {
		target.className = "newsArticleList showGradientLeft";
	} else if(scrollLeft == 0 && scrollRight > 0) {
		target.className = "newsArticleList showGradientRight";
	} else {
		target.className = "newsArticleList showGradientBoth";
	}
}

function generateNewsArticleObject(article) {
	let container = document.createElement("div");
	container.className = "newsArticle";
	
	let img = document.createElement('img')
	var imgURL = "";
	if(article.multimedia.length > 0) {
		console.log("HI");
		imgURL = "https://www.nytimes.com/"+article.multimedia[0].url;
	} else {
		imgURL = "/img/noimage.png";
	}
	img.src = imgURL;
	img.className = "articleImage";
	
	let headlineContent = document.createElement("p");
	headlineContent.innerHTML = article.headline.main;
	headlineContent.className = "articleHeadline";

	container.appendChild(img);
	container.appendChild(headlineContent);
		
	let link = document.createElement("a");
	link.href=article.web_url;
	link.target = "_blank";
	
	link.appendChild(container);
	
	return link;
}

function getTopNewsStory() {
	var homeNewsDiv = document.getElementById("stockChartContainer");
	
	let req = new XMLHttpRequest();
	req.open("GET", "/getTopNews", true);
	req.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			let response = JSON.parse(this.response);
			
			homeNewsDiv.appendChild(generateTopNewsStoryObject(response));
		}
	}
	
	req.send();
}

function generateTopNewsStoryObject(article) {
	let title = article.title;
	let url = article.url;
	let abstract = article.abstract;
	let imageURL = article.multimedia[0].url;
	
	let container = document.createElement("div");
	container.className = "topNewsArticle";
	
	let img = document.createElement('img')
	let imgURL=imageURL;
	img.src = imgURL;
	img.className = "articleImageTop";
	img.style.width = "100%";
	
	let link = document.createElement("a");
	link.href=url;
	link.target = "_blank";
	
	link.appendChild(img);
	
	var headlineContent = document.createElement("p");
	headlineContent.innerHTML = title;
	headlineContent.style.marginBottom = "5px";
	headlineContent.style.fontWeight = "bold";
	headlineContent.style.fontSize = "1.3em";
	
	let headlineLink = document.createElement("a");
	headlineLink.href=url;
	headlineLink.target = "_blank";
	headlineLink.style.color = "var(--dark)";
	headlineLink.style.textDecoration = "none";
	
	headlineLink.appendChild(headlineContent);
	
	var abstractContent = document.createElement("p");
	abstractContent.innerHTML = abstract;
	abstractContent.style.fontSize = "1.3em";
	
	var titleLine = document.createElement("h2");
	titleLine.innerHTML = "Today's Top Story";
	titleLine.style.fontWeight = "bold";
	titleLine.style.marginBottom = "20px";
	
	let topNewsArticleContentContainer = document.createElement("div");
	topNewsArticleContentContainer.id = "topNewsArticleContentContainer";
	let leftTopNewsContent = document.createElement("div");
	leftTopNewsContent.id = "leftTopNewsContent";
	let rightTopNewsContent = document.createElement("div");
	rightTopNewsContent.id = "rightTopNewsContent";
	
	container.appendChild(titleLine);
	leftTopNewsContent.appendChild(link);
	
	rightTopNewsContent.appendChild(headlineLink);
	rightTopNewsContent.appendChild(abstractContent);
	
	topNewsArticleContentContainer.appendChild(leftTopNewsContent);
	topNewsArticleContentContainer.appendChild(rightTopNewsContent);
	
	container.appendChild(topNewsArticleContentContainer)
	
	return container;
}