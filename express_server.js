const express = require("express");
const cookieParser = require("cookie-parser");
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
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", id: "iVyfkz" },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "password",
  },
  user2RandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "password",
  },
};

// GET METHODS
// Login method
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_login", templateVars);
});

// Registration method
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_registration", templateVars);
});

// View homepage
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: findUserUrls(req.cookies["user_id"], urlDatabase),
  };
  if (!req.cookies["user_id"]) {
    res.send("You must login or register");
  } else {
    res.render("urls_index", templateVars);
  }
});

// View new url page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  if (!req.cookies["user_id"]) {
    res.send("You must be logged in to add any URLs");
  } else {
    res.render("urls_new", templateVars);
  }
});

// View a new URLs page or Edit a url
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.send("That tinyURL doesn't exist yet!");
  } else if (!req.cookies["user_id"]) {
    res.send("You must be logged in to do that!");
  } else if (urlDatabase[req.params.id].userID !== req.cookies["user_id"]) {
    res.send("This is not your TinyURL!");
  } else {
    const templateVars = {
      id: req.params.id,
      longURL: req.params.longURL,
      user: users[req.cookies["user_id"]],
    };
    res.render("urls_show", templateVars);
  }
});

// Redirect from short url to long url
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// Any invalid urls
app.get("*", (req, res) => {
  res.status(404).send("Page not found");
});

// POST METHODS
// Get registration data
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const emailExists = findUserByEmail(users, email);
  const newUser = {
    id: userID,
    email: req.body.email,
    password: hashedPassword,
  };
  if (newUser.email === "" || newUser.password === "") {
    res.send("400 ERROR, bad request");
  } else if (emailExists !== null) {
    res.send("400 ERROR, bad request");
  } else {
    users[userID] = newUser;
    res.cookie("user_id", userID);
    res.redirect("/urls");
  }
});

// Login process
app.post("/login", (req, res) => {
  const userEmail = findUserByEmail(users, req.body.email, "e");
  const userPassword = findUserByEmail(users, req.body.email, "p");
  const userID = findUserByEmail(users, req.body.email, "i");

  if (req.body.email !== userEmail) {
    res.send("403: This email does not exist, please register");
  } else if (
    req.body.email === userEmail &&
    bcrypt.compareSync(req.body.password, userPassword)
  ) {
    res.cookie("user_id", userID);
    res.redirect("/urls");
  } else {
    res.send("403: Incorrect login info");
  }
});

// Logout user and clear cookies
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// Generates short url and appends to database
app.post("/urls", (req, res) => {
  let tinyURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.cookies["user_id"];
  if (!userID) {
    res.send("Must be logged in to shorten a url");
  }
  urlDatabase[tinyURL] = { longURL, userID };
  res.redirect(`/urls/${tinyURL}`);
});

// Editing short url
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  if (urlDatabase[id].userID === req.cookies["user_id"]) {
    urlDatabase[req.params.id].longURL = longURL;
    res.redirect("/urls");
  } else {
    res.send("Not permitted");
  }
});

// Deleting a URL
app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id].userID === req.cookies["user_id"]) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.send("That is not allowed!");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
