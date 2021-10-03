const express = require("express");
const app = express();
const PORT = 8080;
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

app.set("view engine", "ejs");

app.use(cookieParser());

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
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  console.log("user_id", req.cookies["user_id"]);
  let emailtemp = {};
  if (users[req.cookies["user_id"]]) {
    emailtemp = users[req.cookies["user_id"]].email;
  }
  const templateVars = {
    urls: urlDatabase,
    email: emailtemp,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.cookie("user_id", req.cookies["user_id"]);
  let user = users[req.cookies["user_id"]];
  let emailtemp = "";
  if (users[req.cookies["user_id"]]) {
    emailtemp = users[req.cookies["user_id"]].email;
  }
  res.render("urls_new", { email: emailtemp });
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render("urls_reg");
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.get("/logout", (req, res) => {
  // console.log("logout");
  // res.clearCookie("username");
  res.clearCookie("user_id");
  return res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let shortURLt = generateRandomString(6);
  urlDatabase[shortURLt] = req.body.longURL;
  // console.log(urlDatabase);
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  const templateVars = { shortURL: shortURLt, longURL: req.body.longURL };
  res.cookie("user_id", req.body.user_id);

  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let deleteURL = req.params.shortURL;
  delete urlDatabase[deleteURL];
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
        if (users[key].password === passUsr) {
          res.cookie("user_id", users[key].id);
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

  users[ID] = { id: ID, email: userEmail, password: password };
  res.cookie("user_id", ID);
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
