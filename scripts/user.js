const { initializeApp } = require('firebase/app');
const {  getFirestore, collection, getDocs } = require('firebase/firestore/lite');
const { getDatabase, ref, get, set, child} = require('firebase/database');
const { getAuth } = require('firebase/auth');

const firebaseConfig = {
	apiKey: "AIzaSyDWH1fObpVBQqO_M1jhTLz8HoQbocK1ZGU",
	authDomain: "cisc474-stocks4me.firebaseapp.com",
	databaseURL: "https://cisc474-stocks4me-default-rtdb.firebaseio.com",
	projectId: "cisc474-stocks4me",
	storageBucket: "cisc474-stocks4me.appspot.com",
	messagingSenderId: "419878406960",
	appId: "1:419878406960:web:2e936e8bdae8fd8dacd6f5"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase();

const fs = require('fs');
const https = require('https');

module.exports = {createUser, getUserInfo, updateUserInfo, logIn};

function createUser(userObject) {
	console.log("creating new user...");
	var newUserData = {
		"username": userObject["displayName"],
		"wallet": 0,
		"stocks": {},
		"news": [],
		"pfp": userObject["photoURL"],
		"uid": userObject["uid"],
		"showTutorial": 1
	}
	const userRef = ref(database, 'users/'+userObject["uid"]);
	set(userRef, newUserData)
	.catch((error) => {
	  console.error(error);
	});
	
	return newUserData;
}

function updateUserInfo(id, data) {
	return new Promise(resolve => {
		const userRef = ref(database, 'users/'+id);
		set(userRef, data);
		resolve({
			"code": 200
		});
	});
}

function getUserInfoFromDatabase(id) {
	return new Promise(resolve => {
		console.log("get database");
	  const userRef = ref(database);
	  get(child(userRef, 'users/'+id)).then((snapshot) => {
		  const data = snapshot.val();
		  console.log(data);
		  resolve(data);
	  }).catch((error) => {
			console.error(error);
		  });
  });
}

function getUserInfo(id) {
	return new Promise(async (resolve) => {
		var userInfo = await getUserInfoFromDatabase(id);		
		resolve({
			"code": 200,
			"userInfo": userInfo
		});
	});
}

function logIn(userObject) {
	return new Promise(async (resolve) => {
		var userInfo = await getUserInfoFromDatabase(userObject["uid"]);		
		console.log(userInfo);
		if(userInfo == null) {
			console.log("user info is null!");
			userInfo = createUser(userObject);
		} else {
			console.log("user info is not null!");
		}
		resolve({
			"code": 200,
			"userInfo": userInfo
		});
	});
}

/*function getUserInfo(username, password) {
	return new Promise(resolve => {
		fs.readFile("testUserInfo.json", function(error, data) {
			if(error) {
				resolve(error);
			}
			var userData = (JSON.parse(data.toString())["users"]);
			
			if(userData[username] == undefined) {
				resolve({"error":{"code":404,"message":"user not found"}});
				return;
			}
			
			var userDataForUsername = userData[username];
			
			if(password == userDataForUsername["password"]) {
				delete userDataForUsername["password"];
				resolve({
					"code":200,
					"userData":userDataForUsername
				});
				return;
			} else {
				resolve({
					"error": {
						"code":403,
						"message":"password doesn't match"
					}
				});
				return;
			}
		})
	});
}*/