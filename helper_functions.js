const generateRandomString = function() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const array = [];
  while (array.length < 6) {
    array.push(alphabet[Math.ceil(Math.random() * 52)])
  }
  return array.join('')
}

// Helper function that finds either the email, userID or password using the third paramater, "e": email, "p": password, "i": userID
const findUserByEmail = function(object, email, variable) {
  for (let keys in object) {
    if (email === object[keys].email && variable === "e") {
      return email;
    } else if (email === object[keys].email && variable === "p") {
      return object[keys].password
    } else if (email === object[keys].email && variable === "i") {
      return object[keys].id
    }
  }
  return null
}

const findUserUrls = function (userID, urlDatabase) {
  const urls = {};
  for (let url in urlDatabase) {
    if (userID === urlDatabase[url].userID) {
      urls[url] = urlDatabase[url]
    }
  }
  return urls
}

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", id: "iVyfkz"}
};
 

console.log(findUserUrls("iVyfkz", urlDatabase))

module.exports = { generateRandomString, findUserByEmail, findUserUrls }