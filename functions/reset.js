

const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");


function reset(req, res){

    const db = new sqlite3.Database("./database.db", (err) => {
        if (err) {
            console.error(err.message);
        }
    });

    const { username, password } = req.body;

    // Request checks

    if(!username || !password) {
        res.status(400).json({
            success: false,
            error: "Please provide all required arguments"
        });
        return;
    }

    // Database checks

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if(err){
            res.status(500).json({
                success: false,
                error: "Internal server error"
            })
            return;
        }

        if(!row) {
            res.status(404).json({
                success: false,
                error: "User not found"
            });
            return;
        }

        const passwordHash = row.password;
        const salt = row.salt;

        // Checking the password

        const hash = crypto.createHash("sha256");
        hash.update(password + salt);
        const hashedPassword = hash.digest("hex");

        if(passwordHash != hashedPassword) {
            res.status(401).json({
                success: false,
                error: "Invalid password"
            });
            return;
        }

        // New token

        const token = crypto.randomBytes(16).toString("hex");

        // Update the token

        db.run("UPDATE users SET token = ? WHERE username = ?", [token, username], (err) => {
            if(err) {
                res.status(500).json({
                    success: false,
                    error: "Internal server error"
                });
                return;
            }
        });

        // Response

        res.status(200).json({
            success: true,
            token: token
        });

    });
        
    res.send("You would've logged in");

}

module.exports = reset;