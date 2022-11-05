const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs")

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

const generateRandomString = function() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const array = [];
  while (array.length < 6) {
    array.push(alphabet[Math.ceil(Math.random() * 52)])
  }
  return array.join('')
}

const userLookup = function(object, email) {
  for (let i in object) {
    if (email === object[i].email) {
      return email;
    }
  }
  return null
}

// Login method
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  }
  res.render('urls_login', templateVars)
})

app.get('/urls', (req, res)=> {
  const templateVars = { 
    user: users[req.cookies['user_id']],
    urls: urlDatabase }
  res.render("urls_index", templateVars)
})

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id],
    user: users[req.cookies['user_id']] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  };
  res.render('urls_registration', templateVars)
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls')
})

app.post('/login', (req, res) => {
  res.cookie('username', req.body)
  res.redirect('/urls')
})

app.post('/urls', (req, res) => {
  let string = generateRandomString()
  urlDatabase[string] = req.body.longURL
  res.redirect(`/urls/${string}`)
})

app.post('/urls/:id', (req,res) => {
  console.log(req.body)
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect('/urls')
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls')
})

app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email
  const emailExists = userLookup(users, email)
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
