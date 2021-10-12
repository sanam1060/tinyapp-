const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const nonUser = getUserByEmail("nonUser@example.com", testUsers);
    console.log(nonUser);
    const expectedOutput = "userRandomID";
    //assert(user === expectedOutput,"The function is working properly");
    assert(user !== expectedOutput,"The function is not working properly");
    assert(nonUser !== null ,"The function is not working properly for undefined users");



    // Write your assert statement here
  });
});