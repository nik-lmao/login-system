
const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();


function register(req, res) {
    const db = new sqlite3.Database("./database.db", (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log("Connected to the database.");
        }
    });

    const { username, password, name } = req.body;

    // Request checks

    if(!username || !password || !name) {
        res.status(400).json({
            success: false,
            error: "Please provide all required arguments"
        });
        return;
    }

    // Database checks

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if(err) {
            res.status(500).json({
                success: false,
                error: "Internal server error"
            });
            return;
        }

        if(row) {
            res.status(409).json({
                success: false,
                error: "Username already exists"
            });
            return;
        }
    });

    // Hashing

    const hash = crypto.createHash("sha256");
    const salt = crypto.randomBytes(16).toString("hex");
    hash.update(password + salt);
    const hashedPassword = hash.digest("hex");

    const token = crypto.randomBytes(16).toString("hex");

    // Insert into the database

    db.run("INSERT INTO users (username, password, salt, token, name) VALUES (?, ?, ?, ?, ?)", [username, hashedPassword, salt, token, name,], (err) => {
        if(err) {
            res.status(500).json({
                success: false,
                error: "Internal server error"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "User registered successfully"
        });
    });
}

module.exports = register;