
const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();

function deleteAccount(req, res){

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

    // Database checkss

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

        // Delete the user

        db.run("DELETE FROM users WHERE username = ?", [username], (err) => {
            if(err) {
                res.status(500).json({
                    success: false,
                    error: "Internal server error"
                });
                return;
            }

            res.json({
                success: true,
            });
        });

    });

}

module.exports = deleteAccount;