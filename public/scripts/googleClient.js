import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";

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
const auth = getAuth();
const provider = new GoogleAuthProvider();

function googleSignIn() {
	signInWithPopup (auth, provider)
	.then((result) => {
	  // This gives you a Google Access Token. You can use it to access the Google API.
	  const user = result.user;
	  
	  console.log(user);
	  
	  login(user);
	}).catch((error) => {
		console.log(error);
	  // Handle Errors here.
	  const errorCode = error.code;
	  const errorMessage = error.message;
	  // The email of the user's account used.
	  const email = error.email;
	  // The AuthCredential type that was used.
	  const credential = GoogleAuthProvider.credentialFromError(error);
  });
}
window.googleSignIn = googleSignIn;

function googleSignOut() {
	signOut(auth).then(() => {
	  // Sign-out successful.
	}).catch((error) => {
	  // An error happened.
	});
}
window.googleSignOut = googleSignOut;