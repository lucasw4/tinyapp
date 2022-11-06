// Takes 6 random letters from the alphabet to create a random string
const generateRandomString = function () {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const array = [];
  while (array.length < 6) {
    array.push(alphabet[Math.ceil(Math.random() * 52)]);
  }
  return array.join("");
};

// Helper function that finds either the email, userID or password using the third paramater, "e": email, "p": password, "i": userID
const findUserByEmail = function (object, email, variable) {
  for (let keys in object) {
    if (object[keys].email === email) {
      return object[keys];
    }
  }
  return null;
};

// Browses urlDatabase and finds all urls that match the userID provided
const findUserUrls = function (userID, urlDatabase) {
  const urls = {};
  for (let url in urlDatabase) {
    if (userID === urlDatabase[url].userID) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
};

module.exports = { generateRandomString, findUserByEmail, findUserUrls };
