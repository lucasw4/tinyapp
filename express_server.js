const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

const { generateRandomString, findUserByEmail, findUserUrls } = require('./helper_functions')

app.set("view engine", "ejs")

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", id: "iVyfkz"}
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "password"
  },
  user2RandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "password"
  }
}

// Login method
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  }
  res.render('urls_login', templateVars)
})

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  };
  res.render('urls_registration', templateVars)
})


app.get('/urls', (req, res)=> {
  const templateVars = { 
    user: req.cookies['user_id'],
    urls: findUserUrls(req.cookies['user_id'], urlDatabase)
  }
  if (!req.cookies['user_id']) {
    res.redirect('/login')
  } else {
    res.render("urls_index", templateVars)
  }
})

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  }
  if (!req.cookies['user_id']) {
    res.send('You must be logged in to add any URLs')
  } else {
    res.render('urls_new', templateVars)
  }
});

app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.send('That tinyURL doesn\'t exist yet!')
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL,
    user: users[req.cookies['user_id']] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL
  res.redirect(longURL);
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/login')
})

app.post('/login', (req, res) => {
  const userEmail = findUserByEmail(users, req.body.email, "e")
  const userPassword = findUserByEmail(users, req.body.email, "p")
  const userID = findUserByEmail(users, req.body.email, "i")
  if (req.body.email !== userEmail) {
    res.send("403: This email does not exist, please register")
  } else if (req.body.email === userEmail && req.body.password === userPassword){
    res.cookie('user_id', userID)
    res.redirect('/urls')
  } else {
    res.send("403: Incorrect login info")
  }
})

app.post('/urls', (req, res) => {
  let tinyURL = generateRandomString()
  const longURL = req.body.longURL
  const userID = req.cookies["user_id"]
  if(!userID) {
    res.send('Must be logged in to shorten a url')
  }
  urlDatabase[tinyURL] = {longURL, userID}
  res.redirect(`/urls/${tinyURL}`)
})

app.post('/urls/:id', (req,res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL
  res.redirect('/urls')
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls')
})

app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email
  const emailExists = findUserByEmail(users, email)
  const newUser = {
    id: userID,
    email: req.body.email,
    password: req.body.password,
  };
  if (newUser.email === "" || newUser.password === "") {
    res.send("400 ERROR, bad request")
  } else if (emailExists !== null) {
    res.send("400 ERROR, bad request")
  } else {
    users[userID] = newUser;
    res.cookie("user_id", userID)
    res.redirect('/urls')
  }

})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
