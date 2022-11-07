const express = require("express");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080; // default port 8080

// Exported helper functions
const {
  generateRandomString,
  findUserByEmail,
  findUserUrls,
} = require("./helper_functions");
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    secret: "wawaweezzj",
  })
);

// Example database
const urlDatabase = {};

// Example user database
const users = {};

// GET METHODS
app.get("/", (req, res) => {
  if (!req.session["user_id"]) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

// Login method
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
  };
  if (req.session["user_id"]) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", templateVars);
  }
});

// Registration method
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
  };
  if (req.session["user_id"]) {
    res.redirect("/urls");
  } else {
    res.render("urls_registration", templateVars);
  }
});

// View homepage
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
    urls: findUserUrls(req.session["user_id"], urlDatabase),
  };
  if (!req.session["user_id"]) {
    res.status(403).send("You must login or register");
    return;
  }
  res.render("urls_index", templateVars);
});

// View new url page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
  };
  if (!req.session["user_id"]) {
    res.status(403).send("You must be logged in to add any URLs");
    return;
  }
  res.render("urls_new", templateVars);
});

// View a new URLs page or Edit a url
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(403).send("That tinyURL doesn't exist yet!");
    return;
  }
  if (!req.session["user_id"]) {
    res.status(403).send("You must be logged in to do that!");
    return;
  }
  if (urlDatabase[req.params.id].userID !== req.session["user_id"]) {
    res.status(403).send("This is not your TinyURL!");
    return;
  }
  const templateVars = {
    id: req.params.id,
    longURL: req.params.longURL,
    user: users[req.session["user_id"]],
  };
  res.render("urls_show", templateVars);
});

// Redirect from short url to long url
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).send("That tinyURL doesn't exist yet!");
    return;
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// Any invalid urls
app.get("*", (req, res) => {
  res.status(404).send("Page not found");
});

// POST METHODS \\

// Get registration data
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const findUser = findUserByEmail(users, email);
  const newUser = {
    id: userID,
    email: req.body.email,
    password: hashedPassword,
  };
  if (!newUser.email) {
    res.status(400).send("Must enter an email");
    return;
  }
  if (!req.body.password) {
    res.status(400).send("Must enter a password");
    return;
  }
  if (findUser !== null) {
    res.status(400).send("Email already in use");
    return;
  }
  users[userID] = newUser;
  req.session["user_id"] = userID;
  res.redirect("/urls");
});

// Login process
app.post("/login", (req, res) => {
  const user = findUserByEmail(users, req.body.email);

  if (req.body.email !== user.email) {
    res.status(403).send("This email does not exist, please register");
    return;
  }
  if (
    req.body.email === user.email &&
    bcrypt.compareSync(req.body.password, user.password)
  ) {
    req.session["user_id"] = user.id;
    res.redirect("/urls");
  } else {
    res.status(403).send("Incorrect login info");
  }
});

// Logout user and clear cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Generates short url and appends to database
app.post("/urls", (req, res) => {
  let tinyURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session["user_id"];
  if (!userID) {
    res.status(403).send("Must be logged in to shorten a url");
    return;
  }
  urlDatabase[tinyURL] = { longURL, userID };
  res.redirect(`/urls/${tinyURL}`);
});

// Editing short url
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  if (urlDatabase[id].userID === req.session["user_id"]) {
    urlDatabase[req.params.id].longURL = longURL;
    res.redirect("/urls");
  } else {
    res.status(403).send("This is not your URL to edit");
  }
});

// Deleting a URL
app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id].userID === req.session["user_id"]) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.status(403).send("This is not your URL to delete");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
