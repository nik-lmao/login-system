const express = require("express");

const app = express();
app.use(express.json());

// Importing the functions

const register = require("./functions/register");
const login = require("./functions/login");
const reset = require("./functions/reset");
const deleteAccount = require("./functions/deleteAccount");

// API Endpoints


app.get("/", (req, res) => {
    res.send("Hello World");
});

app.post("/register", (req, res) => {
    register(req, res);
});

app.post("/login", (req, res) => {
    login(req, res);
});

app.post("/reset", (req, res) => {
    reset(req, res);
});

app.delete("/delete", (req, res) => {
    deleteAccount(req, res);
});


// Starting the server

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});