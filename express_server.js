const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = function() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const array = [];
  while (array.length < 6) {
    array.push(alphabet[Math.ceil(Math.random() * 52)])
  }
  return array.join('')
}

app.get('/urls', (req, res )=> {
  const templateVars = { urls: urlDatabase }
  res.render("urls_index", templateVars)
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls')
})

app.post('/urls', (req, res) => {
  let string = generateRandomString()
  urlDatabase[string] = req.body.longURL
  res.redirect(`/urls/${string}`)
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
