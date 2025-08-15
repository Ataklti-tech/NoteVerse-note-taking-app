// import NotesAPI from "./NotesAPI.js";
// import NotesView from "./NotesView.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const auth = getAuth();

// Check which page is currently loaded
const currentPage = window.location.pathname.split("/").pop();

// Initialize DOM elements based on the current page
let email,
  password,
  signUpBtn,
  signUpFormView,
  UIErrorMessageEmail,
  UIErrorMessagePassword,
  loader,
  logOutBtn,
  UIuserEmail,
  loginBtn,
  loginFormView,
  signUpSwitch,
  loginSwitch,
  resendEmailBtn,
  resetBtn,
  forgotBtn,
  resetPasswordEmail,
  loginWithGoogleBtn,
  loginWithGoogleSignUp,
  resetPasswordSubmit,
  firstPassword,
  secondPassword,
  title,
  tags,
  lastEdited,
  content,
  isArchived,
  submitButton,
  note_1,
  noteAll;

if (currentPage === "signup.html") {
  // DOM elements for the signup page
  email = document.getElementById("email_signup");
  password = document.getElementById("password_signup");
  signUpBtn = document.getElementById("signup-btn");
  signUpFormView = document.getElementById("container");
  UIErrorMessageEmail = document.getElementById("email_error_message");
  UIErrorMessagePassword = document.getElementById("password_error_message");
  loader = document.getElementById("loader");
  signUpSwitch = document.getElementById("sign_up_switch_btn");
  loginWithGoogleSignUp = document.getElementById("login-with-google-btn_2");
} else if (currentPage === "index.html") {
  // DOM elements for the user profile page (index.html)
  logOutBtn = document.getElementById("logout-btn");
  UIuserEmail = document.getElementById("user-email");
  // selecting the create note elements
  title = document.getElementById("note_title");
  tags = document.getElementById("tags_input");

  content = document.getElementById("content_input");
  lastEdited = document.getElementById("tags_time_input");
  isArchived = false;

  submitButton = document.getElementById("save_btn");
  note_1 = document.querySelector(".note-1");
  noteAll = document.querySelector(".notes");
  // loader = document.getElementById("loader");
} else if (currentPage === "login.html") {
  // DOM elements for the login page
  email = document.getElementById("email_login");
  password = document.getElementById("password_login");
  loginBtn = document.getElementById("login-btn");
  loginFormView = document.getElementById("container");
  UIErrorMessageEmail = document.getElementById("email_error_message");
  UIErrorMessagePassword = document.getElementById("password_error_message");
  forgotBtn = document.getElementById("forgot_btn");
  loginSwitch = document.getElementById("login_switch_btn");
  loginWithGoogleBtn = document.getElementById("login-with-google-btn");
} else if (currentPage === "emailVerification.html") {
  // DOM elements for the email verification page
  resendEmailBtn = document.getElementById("resend-email-btn");
} else if (currentPage === "forgot-password.html") {
  // DOM elements for the forgot password page
  // email = document.getElementById("email_address_reset");
  resetBtn = document.getElementById("reset-link-btn");
  resetPasswordEmail = document.getElementById("email_password-reset");
} else if (currentPage === "reset-password.html") {
  // DOM elements for the reset password page
  resetPasswordSubmit = document.getElementById("reset-password");
  firstPassword = document.getElementById("email-password-reset");
  secondPassword = document.getElementById("email-password-reset-confirm");
}

///////////////////////////////////////////

onAuthStateChanged(auth, async (user) => {
  console.log(user);
  if (user) {
    if (currentPage === "signup.html") {
      signUpFormView.style.display = "none";
      window.location.href = "index.html";
    } else if (currentPage === "index.html") {
      // Update the user profile page with the logged-in user's email
      if (UIuserEmail) {
        UIuserEmail.innerHTML = user.email;
      }
    } else if (currentPage === "login.html") {
      // window.location.href = "emailVerification";
      if (user?.emailVerified === false) {
        await sendEmailVerification(user);
        window.location.href = "emailVerification.html";
      } else {
        window.location.reload(); // Refreshes the page
        window.location.href = "index.html";
        //window.location.href = "index.html";
        loginFormView.style.display = "none";
      }
    }
  } else {
    if (currentPage === "signup.html") {
      //window.location.replace = "signup.html";
      signUpFormView.style.display = "block";
    } else if (currentPage === "index.html") {
      // Redirect to the signup page if the user is not logged in
      window.location.href = "login.html";
    } else if (currentPage === "login.html") {
      if (user.emailVerified === true) {
        window.location.href = "index.html";
      } else {
        window.location.href = "login.html";
      }
      // window.location.replace = "login.html";
      // loginFormView.style.display = "block";
    } else if (
      currentPage === "emailVerification.html" &&
      user.emailVerified === true
    ) {
      window.location.href = "index.html";
    }
  }

  if (loader) {
    loader.style.display = "none";
  }
});

const signUpButtonPressed = async (e) => {
  e.preventDefault();
  if (loader) {
    // loader.style.display = "flex";
    document.body.style.cursor = "wait";
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );
    console.log(userCredential);
    const user = userCredential.user;
    await sendEmailVerification(user);

    // Redirect to the user profile page after successful signup
    window.location.replace = "index.html";
  } catch (error) {
    console.log(error.code);
    if (UIErrorMessageEmail) {
      email.style.borderColor = "#E52020";
      password.style.borderColor = "#E52020";
      UIErrorMessageEmail.style.display = "block";
      UIErrorMessageEmail.innerText = formatErrorMessage(error.code, "signup");
    } else if (UIErrorMessagePassword) {
      UIErrorMessagePassword.style.display = "block";
      UIErrorMessagePassword.innerText = formatErrorMessage(
        error.code,
        "signup"
      );
    }
    if (loader) {
      loader.style.display = "none";
    }
  }
};

const logOutButtonPressed = async (e) => {
  e.preventDefault();
  try {
    await signOut(auth);
    window.location.href = "login.html";
    if (email && password) {
      email.value = "";
      password.value = "";
    }
  } catch (error) {
    console.error(error);
  }
};

const loginButtonPressed = async (e) => {
  e.preventDefault();
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );
    await sendEmailVerification(user);
    window.location.replace = "index.html";
  } catch (error) {
    console.log(error.code);
    console.log(error.code);
    if (UIErrorMessageEmail) {
      email.style.borderColor = "#E52020";
      password.style.borderColor = "#E52020";
      UIErrorMessageEmail.style.display = "none";
      UIErrorMessageEmail.innerText = formatErrorMessage(error.code, "login");
    } else if (UIErrorMessagePassword) {
      UIErrorMessagePassword.style.display = "block";
      UIErrorMessagePassword.innerText = formatErrorMessage(
        error.code,
        "login"
      );
    }
    console.log(formatErrorMessage(error.code, "login"));
  }
};

const needAnAccountButtonPressed = (e) => {
  e.preventDefault();
  window.location.href = "signup.html";
};

const haveAnAccountButtonPressed = (e) => {
  e.preventDefault();
  window.location.href = "login.html";
};

const resendEmailButtonPressed = async (e) => {
  e.preventDefault();
  try {
    const user = auth.currentUser;
    if (user) {
      await sendEmailVerification(user);
    } else {
      console.log("No user is logged in");
    }
  } catch (error) {
    console.log(error.code);
  }
};

const forgotButtonPressed = (e) => {
  e.preventDefault();
  window.location.href = "forgot-password.html";
};
// console.log(forgotBtn);

const googleLoginButtonPressed = async (e) => {
  e.preventDefault();
  const googleProvider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.log(error.code);
  }
};

const googleLoginButtonPressedSignUp = async (e) => {
  e.preventDefault();
  const googleProvider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.log(error.code);
  }
};

const resetPasswordButtonPressed = async (e) => {
  e.preventDefault();
  await sendPasswordResetEmail(auth, resetPasswordEmail.value);
  // window.location.href = "reset-password.html";
};

// Get the OOB code from the URL
const urlParams = new URLSearchParams(window.location.search);
const oobCode = urlParams.get("oobCode");
// After the user filled the form of reset password the password will be updated
const resetPasswordFormSubmitted = async (e) => {
  e.preventDefault();
  if (firstPassword.value !== secondPassword) {
    alert("Passwords do not match");
    return;
  }
  try {
    await confirmPasswordReset(auth, oobCode, firstPassword.value);
    alert("Password updated");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Error resetting password:", error);
    alert("Failed to reset password. Please try again.");
  }
};
////////////////////////////////
if (signUpBtn) {
  signUpBtn.addEventListener("click", signUpButtonPressed);
}
if (logOutBtn) {
  logOutBtn.addEventListener("click", logOutButtonPressed);
}
if (loginBtn) {
  loginBtn.addEventListener("click", loginButtonPressed);
}
if (loginSwitch) {
  loginSwitch.addEventListener("click", needAnAccountButtonPressed);
}
if (signUpSwitch) {
  signUpSwitch.addEventListener("click", haveAnAccountButtonPressed);
}
if (resendEmailBtn) {
  resendEmailBtn.addEventListener("click", resendEmailButtonPressed);
}
if (forgotBtn) {
  forgotBtn.addEventListener("click", forgotButtonPressed);
}
if (loginWithGoogleBtn) {
  loginWithGoogleBtn.addEventListener("click", googleLoginButtonPressed);
}
if (loginWithGoogleSignUp) {
  loginWithGoogleSignUp.addEventListener(
    "click",
    googleLoginButtonPressedSignUp
  );
}
if (resetBtn) {
  resetBtn.addEventListener("click", resetPasswordButtonPressed);
}
if (resetPasswordSubmit) {
  resetPasswordSubmit.addEventListener("submit", resetPasswordFormSubmitted);
}

//////////////////////////////////////////////

const formatErrorMessage = (errorCode, action) => {
  let message = "";
  if (action === "signup") {
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
  } else if (action === "login") {
    if (
      errorCode === "auth/invalid-email" ||
      errorCode === "auth/missing-email"
    ) {
      message = "Please enter a valid email address";
    } else if (errorCode === "auth/wrong-password") {
      message = "Please enter a valid password";
    } else if (errorCode === "auth/user-not-found") {
      message = "Email is not registered";
    }
  }

  return message;
};

//////////////////////////////////////
// Select the parent container
// const notesContainer = document.querySelector(".notes");
// const note = document.querySelector(".note1");
// const noteHeader = document.querySelector(".note-header");
// const h2 = document.querySelector("h2");
// const noteTags = document.querySelector("note-tags");
// const tag = document.querySelector("tag1");

const db = getFirestore();

const dbRef = collection(db, "notes");

// simple form validation
