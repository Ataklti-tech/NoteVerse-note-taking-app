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
  onSnapshot
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
  // loader = document.getElementById("loader");
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

const createNoteBtn = document.getElementById("create_note_btn");
const notesInputPreview = document.querySelector(".notes__preview");
const cancelForm = document.querySelector(".cancel_note");
// fetching the notes from the local storage to the UI
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { day: "numeric", month: "short", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// Displaying / Hiding the notes creating section

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
const saveBtn = document.querySelector(".save_note");
// Handling the new notes for submission

const db = getFirestore();

const selectedNotes = new Set();
async function fetchNotesFromFirestore() {
  try {
    // Fetch notes from the "notes" collection in Firestore
    const querySnapshot = await getDocs(collection(db, "notes"));

    // Get the container where notes will be displayed
    const notesContainer = document.querySelector(".notes");

    // Clear any existing content in the container
    notesContainer.innerHTML = "";

    // Loop through each note and create HTML elements
    querySnapshot.forEach((doc, index) => {
      const note = doc.data(); // Get the note data

      // Create the note container
      const noteElement = document.createElement("div");
      noteElement.classList.add(`note-1`);
      noteElement.setAttribute("data-id", doc.id);

      // Create the note header (title)
      const noteHeader = document.createElement("div");
      noteHeader.classList.add("note-header");
      const title = document.createElement("h2");
      title.textContent = note.title;
      noteHeader.appendChild(title);

      // Create the note tags
      const noteTags = document.createElement("div");
      noteTags.classList.add("note-tags");
      note.tags.forEach((tag) => {
        const tagElement = document.createElement("div");
        tagElement.classList.add("tag1");
        tagElement.textContent = tag;
        noteTags.appendChild(tagElement);
      });

      // Create the note date
      const noteDate = document.createElement("div");
      noteDate.classList.add("note-date");

      const date = new Date(note.lastEdited).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
      noteDate.textContent = date;

      // Append all elements to the note container
      noteElement.appendChild(noteHeader);
      noteElement.appendChild(noteTags);
      noteElement.appendChild(noteDate);

      // Add a horizontal line after each note except the last one
      if (index > 1) {
        const horizontalLine = document.createElement("div");
        horizontalLine.classList.add("horizontal_line_notes");
        notesContainer.appendChild(horizontalLine);
      }

      noteElement.addEventListener("click", () => {
        const noteId = noteElement.getAttribute("data-id");

        // Toggle selection
        if (selectedNotes.has(noteId)) {
          selectedNotes.delete(noteId); // Deselect the note
          noteElement.classList.remove("selected"); // Remove visual selection
        } else {
          selectedNotes.add(noteId); // Select the note
          noteElement.classList.add("selected"); // Add visual selection
        }
        console.log("Selected Notes:", Array.from(selectedNotes));
        // selectedNotes.style.backgroundColor = "#000";
      });
      // Append the note container to the notes container
      notesContainer.appendChild(noteElement);
      notesInputPreview.classList.remove("hidden");
    });
  } catch (error) {
    console.log("Error fetching notes");
  }
}
// Call the function to fetch and display notes
// fetchNotesFromFirestore();

// References - already selected

const ref = collection(db, "notes");
async function AddDocument_AutoID() {
  if (notesInputPreview.getAttribute("note-id")) {
    // Update existing note
    try {
      const noteId = notesInputPreview.getAttribute("note-id");
      const docRef = doc(db, "notes", noteId);
      await updateDoc(docRef, {
        title: title.value,
        tags: tags.value.split(",").map((value) => value.trim()),
        content: content.value,
        lastEdited: new Date(document.getElementById("tags_time_input").value),
        isArchived: isArchived
      });
      // note_all.innerHTML = "";
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
        isArchived: isArchived
      });
      // Clear the input fields
      title.value = "";
      tags.value = "";
      content.value = "";
      lastEdited.value = "";
      // Hide the input preview
      // notesInputPreview.classList.add("hidden");
      await refreshNotesList();
    } catch (error) {
      console.log("Error adding document: " + error);
    }
    // const docRef = await addDoc(ref, {
    //   title: title.value,
    //   tags: tags.value.split(",").map((value) => value.trim()),
    //   content: content.value,
    //   lastEdited: new Date(document.getElementById("tags_time_input").value),
    //   isArchived: isArchived
    // })
    // .then(() => {
    //   console.log("Document added");
    //   console.log("Document added with ID: ", docRef.id);
    // })
    // .catch((error) => {
    //   console.log("Error adding document: " + error);
    // });
  }
}
submitButton.addEventListener("click", AddDocument_AutoID);
// fetchNotesFromFirestore();

// noteAll.addEventListener("click", function () {
//   notesInputPreview.classList.remove("hidden");
// });

// Getting documents
// async function GetADocument() {
//   var ref = doc(db, "notes", doc.id);
//   const docSnap = await getDocs(ref);
//   if (docSnap.exists()) {
//     (title.value = docSnap.data().title),
//       (tags.value = docSnap.data().tags.join(",")),
//       (content.value = docSnap.data().content),
//       (lastEdited.value = docSnap.data().lastEdited);
//   } else {
//     console.log("No such document");
//   }
// }
// // console.log(GetADocument());
// noteAll.addEventListener("click", GetADocument);

// first displaying the data in firestore

let notes = [];
const getNotes = async () => {
  try {
    // const docSnap = await getDocs(ref);
    await onSnapshot(ref, (docSnap) => {
      docSnap.forEach((doc) => {
        const note = doc.data();
        note.id = doc.id;
        notes.push(note);
      });
      console.log(notes);
      showNotes(notes);
    });

    // archivedNotes();
  } catch (err) {
    console.log(err);
  }
};
getNotes();

// Showing notes in the ui - second option
const showNotes = (notes) => {
  note_all.innerHTML = "";
  // Convert timestamp to JavaScript Date
  // const lastEditedDate = new Date(notes.lastEdited.seconds * 1000); // Convert seconds to milliseconds

  // // Extract date, month, and year
  // const day = lastEditedDate.getDate();
  // const month = lastEditedDate.toLocaleString("default", { month: "long" }); // "January", "February", etc.
  // const year = lastEditedDate.getFullYear();

  // // Format the date as "Day Month Year" (e.g., "15 March 2024")
  // const formattedDate = `${day} ${month} ${year}`;

  // // Generate tag elements dynamically
  // const tagElements = notes.tags
  //   .map((tag) => `<div class="tag1">${tag}</div>`)
  //   .join(""); // Join the tags into a single HTML string

  notes.forEach((note) => {
    // Option_1 for date formatting
    const date = new Date(note.lastEdited.seconds * 1000);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    // Option_2 for date formatting
    // const months = [
    //   "Jan",
    //   "Feb",
    //   "Mar",
    //   "Apr",
    //   "May",
    //   "Jun",
    //   "Jul",
    //   "Aug",
    //   "Sep",
    //   "Oct",
    //   "Nov",
    //   "Dec"
    // ];
    // const day = date.getDate();
    // const month = months[date.getMonth()];
    // const year = date.getFullYear();
    // const formattedDate = `${day} ${month} ${year}`;
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
// Method_2 - Add document to the cloud Firestore

// fetch notes which has isArchived = True if the "Archived" button is pressed
// const archivedNotes = async () => {
//   note_all.innerHTML = "";
//   try {
//     // Simulated fetching of notes (Replace this with your actual data source)
//     const notes = await getNotes(); // Assume this function fetches all notes

//     // Filter notes that are archived (isArchived == true)
//     const archived = notes.filter((note) => note.isArchived === true);

//     // Display archived notes
//     showNotes(archived);
//   } catch (error) {
//     console.error("Error fetching archived notes:", error);
//   }
// };
// document.getElementById("archived").addEventListener("click", archivedNotes);

// Click notes list div element
const noteListPressed = (event) => {
  // console.log("note pressed");
  const noteId = event.target.closest(".note-1").getAttribute("id");
  console.log(noteId);
  const note = notes.find((note) => note.id === noteId); // Assuming notes have an `id` property
  if (!note) return;

  // --------
  const unixTimestamp = note.lastEdited.seconds; // 1743120000
  const date = new Date(unixTimestamp * 1000); // Convert to milliseconds

  // Format as yyyy-MM-dd (required by <input type="date">)
  const formattedDate = date.toISOString().split("T")[0];

  // -----------------------------------
  notesInputPreview.classList.remove("hidden");
  leftSection.style.display = "block";

  // ------------------------------------
  const formattedText = note.content.replace(/\n\n/g, "<br>");
  // ------------------------------------
  title.value = note.title;
  content.value = formattedText;
  lastEdited.value = formattedDate;
  tags.value = note.tags;

  // removing/adding the id as its only for editing/updating of the note
  // if the id is present, it means the note is being edited

  notesInputPreview.setAttribute("note-id", note.id);
};
note_all.addEventListener("click", noteListPressed);

// --------------------------------------------------------------------------
// refreshing the UI for the notes
// --------------------------------------------------------------------------
async function refreshNotesList() {
  const querySnapshot = await getDocs(collection(db, "notes"));
  note_all.innerHTML = ""; // Clear existing notes

  querySnapshot.forEach((doc) => {
    const date = new Date(note.lastEdited.seconds * 1000);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const note = doc.data();
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
}

// --------------------------------------------------------------------------
//  deleting a note
// --------------------------------------------------------------------------
const deleteNote = (event) => {
  const noteId = event.target.closest(".note-1").getAttribute("id");
  console.log(noteId);
  const note = notes.find((note) => note.id === noteId); // Assuming notes have an `id` property
  if (!note) return;

  // const noteId = event.target.parentNode.id;
  // const noteSelected = event.target.closest(".note-1");

  // if (!noteSelected) {
  //   // Alternative approach: Find by ID from selectedNotes Set
  //   if (selectedNotes.size > 0) {
  //     const noteId = Array.from(selectedNotes)[0];
  //     console.log("Deleting selected note:", noteId);
  //     // deleteDoc(doc(db, "notes", noteId)).then(() => refreshNotesList());
  //     return;
  //   }
  //   console.warn("Note element not found");
  //   return;
  // }

  // const noteId = noteSelected.id;
  // console.log("Note ID to delete:", noteId);

  // if (noteSelected) {
  //   // let noteId = noteSelected.getAttribute("id");
  //   // console.log(noteId);
  //   let noteId = noteSelected.id; // Get the id attribute instead of data-id
  //   console.log("Note ID to delete:", noteId);
  //   // proceed to delete the note
  // } else {
  //   console.warn("Note element not found");
  // }
  // // const noteId = noteSelected.id;
  console.log(noteSelected);
  //const noteId = noteSelected.getAttribute("id");
  //const noteId = event.target.closest(".note-1").getAttribute("id");
  //console.log(noteId);
};

deleteNoteBtn.addEventListener("click", deleteNote);
// deleteNoteBtn.addEventListener("click", () => {
//   console.log("Delete button pressed");
// });
// the selected note's id
// the delete button only works on the pressed/selected note's id and then delete after a modal pops out
//
// -------------------------------------------------------------------------
// filtering notes by a tag
// -------------------------------------------------------------------------
let filteredNotes = [];
const filterNotesByTag = (tag) => {
  filteredNotes = notes.filter((note) => note.tags.includes(tag));
  showNotes(filteredNotes);
};
document.getElementById("cooking").addEventListener("click", () => {
  filterNotesByTag("Cooking");
  console.log(filteredNotes);
  heading.innerText = "Notes Tagged: Cooking";
  inputBox.readOnly = true;
});
document.getElementById("dev").addEventListener("click", () => {
  filterNotesByTag("Dev");
  console.log(filteredNotes);
  heading.innerText = "Notes Tagged: Dev";
});
document.getElementById("fitness").addEventListener("click", () => {
  filterNotesByTag("Fitness");
  console.log(filteredNotes);
  heading.innerText = "Notes Tagged: Fitness";
});
document.getElementById("health").addEventListener("click", () => {
  filterNotesByTag("Health");
  console.log(filteredNotes);
  heading.innerText = "Notes Tagged: Health";
});
document.getElementById("personal").addEventListener("click", () => {
  filterNotesByTag("Personal");
  console.log(filteredNotes);
  heading.innerText = "Notes Tagged: Personal";
});
document.getElementById("react").addEventListener("click", () => {
  filterNotesByTag("React");
  console.log(filteredNotes);
  heading.innerText = "Notes Tagged: React";
});
document.getElementById("recipes").addEventListener("click", () => {
  filterNotesByTag("Recipes");
  console.log(filteredNotes);
  heading.innerText = "Notes Tagged: Recipes";
});
document.getElementById("shopping").addEventListener("click", () => {
  filterNotesByTag("Shopping");
  console.log(filteredNotes);
  heading.innerText = "Notes Tagged: Shopping";
});
document.getElementById("travel").addEventListener("click", () => {
  filterNotesByTag("Travel");
  console.log(filteredNotes);
  heading.innerText = "Notes Tagged: Travel";
});
document.getElementById("typescript").addEventListener("click", () => {
  filterNotesByTag("TypeScript");
  console.log(filteredNotes);
  heading.innerText = "Notes Tagged: TypeScript";
});
// ----------------------------------------------------------------------------
// show archived notes
// ----------------------------------------------------------------------------
// Filter notes based on archive state
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

// showing all notes after all notes button is pressed
document.querySelector(".all_notes").addEventListener("click", () => {
  showNotes(notes);
  heading.innerText = "All Notes";
  inputBox.readOnly = false;
});

// --------------------------------------------------------------
// Search functionality
// --------------------------------------------------------------
// Search notes based on search query
function searchNotes(searchTerm) {
  if (!searchTerm.trim()) {
    // If search is empty, return all notes
    // showNotes(notes);
    return notes;
  }

  const searchLower = searchTerm.toLowerCase();

  return notes.filter((note) => {
    // Check title
    const titleMatch =
      note.title && note.title.toLowerCase().includes(searchLower);

    // Check content
    const contentMatch =
      note.content && note.content.toLowerCase().includes(searchLower);

    // Check tags (assuming tags is an array)
    const tagsMatch =
      note.tags &&
      note.tags.some((tag) => tag.toLowerCase().includes(searchLower));

    return titleMatch || contentMatch || tagsMatch;
  });
}
inputBox.addEventListener("input", function () {
  // const filteredNotes = searchNotes(this.value);
  showNotes(searchNotes(this.value));
  // displayNotes(filteredNotes);
});
// showNotes(notes);

// ------------------------------------------
// animation for the placeholder
// ------------------------------------------
// document.addEventListener("DOMContentLoaded", function () {
//   // const textarea = document.getElementById("content_input");
//   // const placeholderText = "Start typing your note here...";
//   const typingSpeed = 50; // milliseconds per character
//   const deletingSpeed = 30; // milliseconds per character when deleting
//   const pauseDuration = 2000; // milliseconds to pause between cycles

//   // Create a div to hold our animated placeholder
//   const placeholder = document.createElement("div");
//   placeholder.className = "notes__body::placeholder";
//   textarea.parentNode.insertBefore(placeholder, textarea.nextSibling);

//   let isTyping = true;
//   let currentText = "";
//   let currentIndex = 0;
//   let isUserTyping = false;

//   function typeWriter() {
//     if (isUserTyping) return;

//     if (isTyping) {
//       if (currentIndex < textarea.placeholder.length) {
//         currentText += textarea.placeholder.charAt(currentIndex);
//         placeholder.textContent = currentText + "|"; // Add cursor
//         currentIndex++;
//         setTimeout(typeWriter, typingSpeed);
//       } else {
//         // Finished typing - pause then start deleting
//         placeholder.textContent = currentText; // Remove cursor
//         setTimeout(() => {
//           isTyping = false;
//           typeWriter();
//         }, pauseDuration);
//       }
//     } else {
//       if (currentText.length > 0) {
//         currentText = currentText.substring(0, currentText.length - 1);
//         placeholder.textContent = currentText + "|"; // Add cursor
//         setTimeout(typeWriter, deletingSpeed);
//       } else {
//         // Finished deleting - pause then start typing again
//         placeholder.textContent = ""; // Remove cursor
//         setTimeout(() => {
//           isTyping = true;
//           currentIndex = 0;
//           typeWriter();
//         }, pauseDuration / 2);
//       }
//     }
//   }

//   // Start the animation
//   typeWriter();

//   // Hide placeholder when user starts typing
//   textarea.addEventListener("input", function () {
//     if (textarea.value.length > 0) {
//       placeholder.style.display = "none";
//       isUserTyping = true;
//     } else {
//       placeholder.style.display = "block";
//       isUserTyping = false;
//       // Restart animation if it was stopped
//       if (currentText.length === 0) {
//         isTyping = true;
//         currentIndex = 0;
//         typeWriter();
//       }
//     }
//   });

//   // Hide placeholder when textarea is focused (even if empty)
//   textarea.addEventListener("focus", function () {
//     placeholder.style.display = "none";
//   });

//   // Show placeholder again when blurred if empty
//   textarea.addEventListener("blur", function () {
//     if (textarea.value.length === 0) {
//       placeholder.style.display = "block";
//       isUserTyping = false;
//       // Restart animation if it was stopped
//       if (currentText.length === 0) {
//         isTyping = true;
//         currentIndex = 0;
//         typeWriter();
//       }
//     }
//   });
// });

// -------------------------------------------------------------
// 2. TypeWriter - option 2 for placeholder animation
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  // const textarea = document.getElementById("content_input");
  const originalPlaceholder =
    textarea.placeholder || "Start typing your note here...";
  const typingSpeed = 50; // milliseconds per character
  const deletingSpeed = 30; // milliseconds per character when deleting
  const pauseDuration = 2000; // milliseconds to pause between cycles

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
        textarea.placeholder = currentText + "|"; // Add cursor
        currentIndex++;
        animationTimeout = setTimeout(typeWriter, typingSpeed);
      } else {
        // Finished typing - pause then start deleting
        textarea.placeholder = currentText; // Remove cursor
        animationTimeout = setTimeout(() => {
          isTyping = false;
          typeWriter();
        }, pauseDuration);
      }
    } else {
      if (currentText.length > 0) {
        currentText = currentText.substring(0, currentText.length - 1);
        textarea.placeholder = currentText + "|"; // Add cursor
        animationTimeout = setTimeout(typeWriter, deletingSpeed);
      } else {
        // Finished deleting - pause then start typing again
        textarea.placeholder = ""; // Remove cursor
        animationTimeout = setTimeout(() => {
          isTyping = true;
          currentIndex = 0;
          typeWriter();
        }, pauseDuration / 2);
      }
    }
  }

  // Start the animation
  typeWriter();

  // Handle user interaction
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
