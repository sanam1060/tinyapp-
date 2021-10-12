
const getUserByEmail = function(email, database) {
  for (let key of Object.keys(database)) {
    if (database[key].email === email) {
      return database[key];
    }
  }
  return undefined;
};

module.exports = {getUserByEmail:getUserByEmail};