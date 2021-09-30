const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

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

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL] /* What goes here? */,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
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

  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let deleteURL = req.params.shortURL;
  delete urlDatabase[deleteURL];
  res.redirect("/urls");
});

console.log("HEllo!");

// app.post("/urls/:shortURL", (req, res) => {
//   let submit = req.params.shortURL;
//   res.redirect("/urls");
// });
