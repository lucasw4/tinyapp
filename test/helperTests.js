const { assert } = require("chai");

const {
  findUserByEmail,
  generateRandomString,
  findUserUrls,
} = require("../helper_functions");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const testDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
};

describe("findUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = findUserByEmail(testUsers, "user@example.com");
    const expectedEmail = "user@example.com";
    // Write your assert statement here
    assert.equal(expectedEmail, user.email);
  });
  it("should return a user's pass with valid email", function () {
    const user = findUserByEmail(testUsers, "user2@example.com");
    const expectedPass = "dishwasher-funk";

    assert.equal(expectedPass, user.password);
  });
  it("should return a user's userID with valid email", function () {
    const user = findUserByEmail(testUsers, "user2@example.com");
    const expectedID = "user2RandomID";

    assert.equal(expectedID, user.id);
  });
  it("should return null with invalid email", function () {
    const user = findUserByEmail(testUsers, "user243@example.com", "p");
    const expectedResult = null;

    assert.equal(expectedResult, user);
  });
});

describe("generateRandomString", function () {
  it("should generate a random 6 letter string", function () {
    const result = generateRandomString();
    const expectedLength = 6;
    assert.equal(result.length, expectedLength);
  });
  it("should generate a random string, this test has a 1/52 chance of failing", function () {
    const result = generateRandomString();
    assert.isFalse(result[0] === "P");
  });
});

describe("findUserUrls", function () {
  it("should find all the urls in a database that belong to a userID", function () {
    const result = findUserUrls("userRandomID", testDatabase);
    const expectedResult = testDatabase["b2xVn2"].longURL;
    assert.equal(result["b2xVn2"].longURL, expectedResult);
  });
});
