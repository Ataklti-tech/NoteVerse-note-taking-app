import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

const auth = getAuth();

const email = document.getElementById("email_signup");
const password = document.getElementById("password_signup");
const signUpBtn = document.getElementById("signup-btn");

const signUpFormView = document.getElementById("container");

const UIErrorMessageEmail = document.getElementById("email_error_message");
const UIErrorMessagePassword = document.getElementById(
  "password_error_message"
);

const loader = document.getElementById("loader");
const logOutBtn = document.getElementById("logout-btn");
// console.log(logOutBtn);
// Selecting DOM elements of ../index.html inside app.js
const UIuserEmail = document.getElementById("user-email");
// console.log(UIuserEmail);

///////////////////////////////////////////

// const redirectToUserProfile = () => {
//   window.location.href = "../index.html";
// };

onAuthStateChanged(auth, (user) => {
  console.log(user);
  if (user) {
    signUpFormView.style.display = "none";
    window.location.href = "index.html";
    // redirectToUserProfile();
  } else {
    signUpFormView.style.display = "block";
    // window.location.href = "signup.html";
  }
  loader.style.display = "none";
});

const signUpButtonPressed = async (e) => {
  e.preventDefault();
  //   loader.style.display = "block";
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );
    console.log(userCredential);

    // UIuserEmail.innerHTML = userCredential.user.email;
    //redirectToUserProfile();
  } catch (error) {
    console.log(error.code);
    email.style.borderColor = "#E52020";
    password.style.borderColor = "#E52020";
    // UIErrorMessageEmail.style.display = "block";
    // UIErrorMessageEmail.innerText = formatErrorMessage(error.code);
    loader.style.display = "none";
  }
};

const logOutButtonPressed = async (e) => {
  e.preventDefault();
  window.location.href = "signup.html";
  // console.log("Hello button pressed");
  try {
    await signOut(auth);
    window.location.href = "signup.html";
    email.value = "";
    password.value = "";
  } catch (error) {
    console.error(error);
  }
};

////////////////////////////////
signUpBtn.addEventListener("click", signUpButtonPressed);
logOutBtn.addEventListener("click", logOutButtonPressed);

////////////////////////////////

const formatErrorMessage = (errorCode) => {
  let message = "";
  if (
    errorCode === "auth/invalid-email" ||
    errorCode === "auth/missing-email"
  ) {
    message = "Please enter a valid email address";
  } else if (
    errorCode === "auth/missing-password" ||
    errorCode === "auth/weak-password"
  ) {
    message = "Please enter a valid password with at least 6 characters";
  } else if (errorCode === "auth/email-already-in-use") {
    message = "Email is already taken";
  }

  return message;
};
const redirectToUserProfile = () => {
  window.location.href = "../index.html";
};
