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
  updateDoc,
  onSnapshot,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

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
  noteAll,
  note_all,
  leftSection,
  heading,
  inputBox,
  textarea,
  archiveNoteBtn,
  deleteNoteBtn;

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
  note_all = document.getElementById("note_all");
  leftSection = document.querySelector(".left_section");
  heading = document.querySelector(".heading");
  inputBox = document.getElementById("input_box");
  textarea = document.getElementById("content_input");
  archiveNoteBtn = document.getElementById("archive");
  deleteNoteBtn = document.getElementById("delete");
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
  resetBtn = document.getElementById("reset-link-btn");
  resetPasswordEmail = document.getElementById("email_password-reset");
} else if (currentPage === "reset-password.html") {
  // DOM elements for the reset password page
  resetPasswordSubmit = document.getElementById("reset-password");
  firstPassword = document.getElementById("email-password-reset");
  secondPassword = document.getElementById("email-password-reset-confirm");
}

// Auth state change listener
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
      // Initialize notes for the current user
      getNotes();
    } else if (currentPage === "login.html") {
      if (user?.emailVerified === false) {
        await sendEmailVerification(user);
        window.location.href = "emailVerification.html";
      } else {
        window.location.reload();
        window.location.href = "index.html";
        loginFormView.style.display = "none";
      }
    }
  } else {
    if (currentPage === "signup.html") {
      signUpFormView.style.display = "block";
    } else if (currentPage === "index.html") {
      window.location.href = "login.html";
    } else if (currentPage === "login.html") {
      if (user?.emailVerified === true) {
        window.location.href = "index.html";
      } else {
        window.location.href = "login.html";
      }
    } else if (currentPage === "emailVerification.html" && user?.emailVerified === true) {
      window.location.href = "index.html";
    }
  }

  if (loader) {
    loader.style.display = "none";
  }
});

// Authentication functions
const signUpButtonPressed = async (e) => {
  e.preventDefault();
  if (loader) {
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
      UIErrorMessagePassword.innerText = formatErrorMessage(error.code, "signup");
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
    const user = userCredential.user;
    await sendEmailVerification(user);
    window.location.replace = "index.html";
  } catch (error) {
    console.log(error.code);
    if (UIErrorMessageEmail) {
      email.style.borderColor = "#E52020";
      password.style.borderColor = "#E52020";
      UIErrorMessageEmail.style.display = "none";
      UIErrorMessageEmail.innerText = formatErrorMessage(error.code, "login");
    } else if (UIErrorMessagePassword) {
      UIErrorMessagePassword.style.display = "block";
      UIErrorMessagePassword.innerText = formatErrorMessage(error.code, "login");
    }
  }
};

// Navigation functions
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

// Google authentication
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

// Password reset functions
const resetPasswordButtonPressed = async (e) => {
  e.preventDefault();
  await sendPasswordResetEmail(auth, resetPasswordEmail.value);
};

const urlParams = new URLSearchParams(window.location.search);
const oobCode = urlParams.get("oobCode");

const resetPasswordFormSubmitted = async (e) => {
  e.preventDefault();
  if (firstPassword.value !== secondPassword.value) {
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

// Event listeners for authentication
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
  loginWithGoogleSignUp.addEventListener("click", googleLoginButtonPressedSignUp);
}
if (resetBtn) {
  resetBtn.addEventListener("click", resetPasswordButtonPressed);
}
if (resetPasswordSubmit) {
  resetPasswordSubmit.addEventListener("submit", resetPasswordFormSubmitted);
}

// Error message formatting
const formatErrorMessage = (errorCode, action) => {
  let message = "";
  if (action === "signup") {
    if (errorCode === "auth/invalid-email" || errorCode === "auth/missing-email") {
      message = "Please enter a valid email address";
    } else if (errorCode === "auth/missing-password" || errorCode === "auth/weak-password") {
      message = "Please enter a valid password with at least 6 characters";
    } else if (errorCode === "auth/email-already-in-use") {
      message = "Email is already taken";
    }
  } else if (action === "login") {
    if (errorCode === "auth/invalid-email" || errorCode === "auth/missing-email") {
      message = "Please enter a valid email address";
    } else if (errorCode === "auth/wrong-password") {
      message = "Please enter a valid password";
    } else if (errorCode === "auth/user-not-found") {
      message = "Email is not registered";
    }
  }
  return message;
};

// Notes functionality
const createNoteBtn = document.getElementById("create_note_btn");
const notesInputPreview = document.querySelector(".notes__preview");
const cancelForm = document.querySelector(".cancel_note");
const ref = collection(db, "notes");

let notes = [];
const selectedNotes = new Set();

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { day: "numeric", month: "short", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// Create note button functionality
createNoteBtn.addEventListener("click", function () {
  notesInputPreview.classList.remove("hidden");
  notesInputPreview.removeAttribute("note-id");
  title.value = "";
  content.value = "";
  lastEdited.value = "";
  tags.value = "";
  leftSection.style.display = "none";
});

cancelForm.addEventListener("click", function () {
  notesInputPreview.classList.add("hidden");
});

// Add/Update note functionality
async function AddDocument_AutoID() {
  const user = auth.currentUser;
  if (!user) return;

  if (notesInputPreview.getAttribute("note-id")) {
    try {
      const noteId = notesInputPreview.getAttribute("note-id");
      const docRef = doc(db, "notes", noteId);
      await updateDoc(docRef, {
        title: title.value,
        tags: tags.value.split(",").map((value) => value.trim()),
        content: content.value,
        lastEdited: new Date(document.getElementById("tags_time_input").value),
        isArchived: isArchived,
        userId: user.uid
      });
      notesInputPreview.classList.add("hidden");
    } catch (error) {
      console.log("Error updating note");
    }
  } else {
    try {
      await addDoc(ref, {
        title: title.value,
        tags: tags.value.split(",").map((value) => value.trim()),
        content: content.value,
        lastEdited: new Date(document.getElementById("tags_time_input").value),
        isArchived: isArchived,
        userId: user.uid
      });
      title.value = "";
      tags.value = "";
      content.value = "";
      lastEdited.value = "";
      await refreshNotesList();
    } catch (error) {
      console.log("Error adding document: " + error);
    }
  }
}

submitButton.addEventListener("click", AddDocument_AutoID);

// Get notes for current user
const getNotes = async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const q = query(ref, where("userId", "==", user.uid));
    
    await onSnapshot(q, (docSnap) => {
      notes = [];
      docSnap.forEach((doc) => {
        const note = doc.data();
        note.id = doc.id;
        notes.push(note);
      });
      console.log(notes);
      showNotes(notes);
    });
  } catch (err) {
    console.log(err);
  }
};

// Display notes in UI
const showNotes = (notes) => {
  note_all.innerHTML = "";
  notes.forEach((note) => {
    const date = new Date(note.lastEdited.seconds * 1000);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const div = `
    <div class="note-1" id="${note.id}">
      <div class="note-header">
        <h2>${note.title}</h2>
      </div>
      <div class="note-tags">
          <div class="tag1">${note.tags[0]}</div>
          <div class="tag1">${note.tags[1]}</div>
      </div>
      <div class="note-date">
         ${formattedDate}
      </div>
    </div>
    <div class="horizontal_line_notes"></div>
    `;
    note_all.innerHTML += div;
  });
};

// Refresh notes list
async function refreshNotesList() {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(collection(db, "notes"), where("userId", "==", user.uid));
  const querySnapshot = await getDocs(q);
  
  note_all.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const note = doc.data();
    const date = new Date(note.lastEdited.seconds * 1000);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const div = `
    <div class="note-1" id="${doc.id}">
      <div class="note-header">
        <h2>${note.title}</h2>
      </div>
      <div class="note-tags">
          <div class="tag1">${note.tags[0]}</div>
          <div class="tag1">${note.tags[1]}</div>
      </div>
      <div class="note-date">
         ${formattedDate}
      </div>
    </div>
    <div class="horizontal_line_notes"></div>
    `;

    note_all.innerHTML += div;
  });
}

// Note selection and editing
const noteListPressed = (event) => {
  const noteId = event.target.closest(".note-1").getAttribute("id");
  console.log(noteId);
  const note = notes.find((note) => note.id === noteId);
  if (!note) return;

  const unixTimestamp = note.lastEdited.seconds;
  const date = new Date(unixTimestamp * 1000);
  const formattedDate = date.toISOString().split("T")[0];

  notesInputPreview.classList.remove("hidden");
  leftSection.style.display = "block";

  const formattedText = note.content.replace(/\n\n/g, "<br>");
  
  title.value = note.title;
  content.value = formattedText;
  lastEdited.value = formattedDate;
  tags.value = note.tags;

  notesInputPreview.setAttribute("note-id", note.id);
};

note_all.addEventListener("click", noteListPressed);

// Delete note functionality
const deleteNote = async (event) => {
  const noteId = event.target.closest(".note-1").getAttribute("id");
  const user = auth.currentUser;
  if (!user) return;

  try {
    await deleteDoc(doc(db, "notes", noteId));
    await refreshNotesList();
  } catch (error) {
    console.error("Error deleting note:", error);
  }
};

deleteNoteBtn.addEventListener("click", deleteNote);

// Filter notes by tag
let filteredNotes = [];
const filterNotesByTag = (tag) => {
  filteredNotes = notes.filter((note) => note.tags.includes(tag));
  showNotes(filteredNotes);
};

// Tag filter event listeners
document.getElementById("cooking").addEventListener("click", () => {
  filterNotesByTag("Cooking");
  heading.innerText = "Notes Tagged: Cooking";
  inputBox.readOnly = true;
});

document.getElementById("dev").addEventListener("click", () => {
  filterNotesByTag("Dev");
  heading.innerText = "Notes Tagged: Dev";
});

document.getElementById("fitness").addEventListener("click", () => {
  filterNotesByTag("Fitness");
  heading.innerText = "Notes Tagged: Fitness";
});

document.getElementById("health").addEventListener("click", () => {
  filterNotesByTag("Health");
  heading.innerText = "Notes Tagged: Health";
});

document.getElementById("personal").addEventListener("click", () => {
  filterNotesByTag("Personal");
  heading.innerText = "Notes Tagged: Personal";
});

document.getElementById("react").addEventListener("click", () => {
  filterNotesByTag("React");
  heading.innerText = "Notes Tagged: React";
});

document.getElementById("recipes").addEventListener("click", () => {
  filterNotesByTag("Recipes");
  heading.innerText = "Notes Tagged: Recipes";
});

document.getElementById("shopping").addEventListener("click", () => {
  filterNotesByTag("Shopping");
  heading.innerText = "Notes Tagged: Shopping";
});

document.getElementById("travel").addEventListener("click", () => {
  filterNotesByTag("Travel");
  heading.innerText = "Notes Tagged: Travel";
});

document.getElementById("typescript").addEventListener("click", () => {
  filterNotesByTag("TypeScript");
  heading.innerText = "Notes Tagged: TypeScript";
});

// Archive functionality
let showingArchived = false;
const filterNotes = () => {
  return notes.filter((note) =>
    showingArchived ? note.isArchived === false : note.isArchived !== false
  );
};

document.getElementById("archived_notes").addEventListener("click", () => {
  showNotes(filterNotes());
  heading.innerText = "Archived Notes";
});

// Show all notes
document.querySelector(".all_notes").addEventListener("click", () => {
  showNotes(notes);
  heading.innerText = "All Notes";
  inputBox.readOnly = false;
});

// Search functionality
function searchNotes(searchTerm) {
  if (!searchTerm.trim()) {
    return notes;
  }

  const searchLower = searchTerm.toLowerCase();

  return notes.filter((note) => {
    const titleMatch = note.title && note.title.toLowerCase().includes(searchLower);
    const contentMatch = note.content && note.content.toLowerCase().includes(searchLower);
    const tagsMatch = note.tags && note.tags.some((tag) => tag.toLowerCase().includes(searchLower));

    return titleMatch || contentMatch || tagsMatch;
  });
}

inputBox.addEventListener("input", function () {
  showNotes(searchNotes(this.value));
});

// Placeholder animation
document.addEventListener("DOMContentLoaded", function () {
  const originalPlaceholder = textarea.placeholder || "Start typing your note here...";
  const typingSpeed = 50;
  const deletingSpeed = 30;
  const pauseDuration = 2000;

  let isTyping = true;
  let currentText = "";
  let currentIndex = 0;
  let isUserTyping = false;
  let animationTimeout;

  function typeWriter() {
    if (isUserTyping) return;

    if (isTyping) {
      if (currentIndex < originalPlaceholder.length) {
        currentText += originalPlaceholder.charAt(currentIndex);
        textarea.placeholder = currentText + "|";
        currentIndex++;
        animationTimeout = setTimeout(typeWriter, typingSpeed);
      } else {
        textarea.placeholder = currentText;
        animationTimeout = setTimeout(() => {
          isTyping = false;
          typeWriter();
        }, pauseDuration);
      }
    } else {
      if (currentText.length > 0) {
        currentText = currentText.substring(0, currentText.length - 1);
        textarea.placeholder = currentText + "|";
        animationTimeout = setTimeout(typeWriter, deletingSpeed);
      } else {
        textarea.placeholder = "";
        animationTimeout = setTimeout(() => {
          isTyping = true;
          currentIndex = 0;
          typeWriter();
        }, pauseDuration / 2);
      }
    }
  }

  typeWriter();

  textarea.addEventListener("input", function () {
    isUserTyping = textarea.value.length > 0;
    if (isUserTyping) {
      clearTimeout(animationTimeout);
      textarea.placeholder = "";
    } else {
      currentText = "";
      currentIndex = 0;
      isTyping = true;
      typeWriter();
    }
  });

  textarea.addEventListener("focus", function () {
    clearTimeout(animationTimeout);
    textarea.placeholder = "";
  });

  textarea.addEventListener("blur", function () {
    if (textarea.value.length === 0) {
      currentText = "";
      currentIndex = 0;
      isTyping = true;
      typeWriter();
    }
  });
}); 