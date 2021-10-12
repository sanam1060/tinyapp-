const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require('bcryptjs');
const users = {
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

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { redirect } = require("statuses");
const cookieSession = require("cookie-session");

app.set("view engine", "ejs");

// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

app.use(bodyParser.urlencoded({ extended: true }));

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const generateRandomString = function (length) {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ48lW" },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  console.log("user_id", req.session);
  let emailtemp = {};
  if (users[req.session["user_id"]]) {
    emailtemp = users[req.session["user_id"]].email;
  }

  let urlsDb = urlsForUser(req.session["user_id"]);
  const templateVars = {
    urls: urlsDb,
    email: emailtemp,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  // res.cookie("user_id", req.session["user_id"]);
  if (req.session["user_id"] === undefined) {
    return res.redirect("/login");
  }
  let emailtemp = "";
  if (users[req.session["user_id"]]) {
    emailtemp = users[req.session["user_id"]].email;
  }
  res.render("urls_new", { email: emailtemp });
});

app.get("/urls/:shortURL", (req, res) => {
  let user = users[req.session["user_id"]];
  if (user === undefined) {
    console.log("The user needs to login first");
    return res.status(403).end();
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const valURL = urlDatabase[req.params.shortURL];
  console.log("redirecting", valURL["longURL"]);
  res.redirect("https://" + valURL["longURL"]);
});

app.get("/register", (req, res) => {
  res.render("urls_reg");
});

app.get("/login", (req, res) => {
  let emailtemp = "";
  if (users[req.session["user_id"]]) {
    emailtemp = users[req.session["user_id"]].email;
  }
  res.render("urls_login", { email: emailtemp });
  // return res.redirect("/urls");
});

app.get("/logout", (req, res) => {
  // console.log("logout");
  // res.clearCookie("username");
  res.clearCookie("user_id");
  req.session = null;

  return res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls", (req, res) => {
  let user = users[req.session["user_id"]];
  if (user === undefined) {
    console.log("The user needs to login first");
    return res.status(403).end();
  }
  console.log(req.body); // Log the POST request body to the console
  let shortURLt = generateRandomString(6);
  urlDatabase[shortURLt] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"],
  };
  console.log(urlDatabase);
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  const templateVars = { shortURL: shortURLt, longURL: req.body.longURL };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let user = users[req.session["user_id"]];
  if (user === undefined) {
    console.log("The user needs to login first");
    return res.status(403).end();
  }

  let deleteURL = req.params.shortURL;
  if (urlDatabase[deleteURL].userID === req.session["user_id"]) {
    delete urlDatabase[deleteURL];
  }
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  // const typedName = req.body.username;
  const emailUsr = req.body.email;
  const passUsr = req.body.password;
  console.log(emailUsr, "userEmail");
  if (checkEmail(emailUsr)) {
    for (let key of Object.keys(users)) {
      // console.log(users[key]);
      if (users[key].email === emailUsr) {
        if (bcrypt.compareSync(passUsr, users[key].password)) {
        // if (users[key].password === passUsr) {
          // res.cookie("user_id", users[key].id);
          req.session.user_id = users[key].id;
        } else {
          return res.status(403).end();
        }
      }
    }
  } else {
    return res.status(403).end();
  }
  // res.cookie("username", typedName);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  // console.log("logout");
  // res.clearCookie("username");
  res.clearCookie("user_id");
  req.session = null;
  return res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const password = req.body.password;
  if (!userEmail || !password) {
    return res.status(400).end();
  }
  if (checkEmail(userEmail)) {
    return res.status(400).end();
  }
  let ID = generateRandomString(6);
  // console.log(email);

  const hashedPassword = bcrypt.hashSync(password, 10);
  users[ID] = { id: ID, email: userEmail, password: hashedPassword };
  // res.cookie("user_id", ID);
  req.session.user_id = ID;
  return res.redirect("/urls");
});

const checkEmail = function (emailTemp) {
  for (let key of Object.keys(users)) {
    console.log(users[key]);
    if (users[key].email === emailTemp) {
      return true;
    }
  }

  return false;
};

const getUserByEmail = function(email, database) {
  for (let key of Object.keys(database)) {
    if (database[key].email === email) {
      return database[key];
    }
  }
};


const urlsForUser = function (id) {
  let idUrls = {};
  for (let url of Object.keys(urlDatabase)) {
    if (urlDatabase[url].userID === id) {
      idUrls[url] = {
        longURL: urlDatabase[url].longURL,
        userID: urlDatabase[url].userID,
      };
    }
  }
  return idUrls;
};
