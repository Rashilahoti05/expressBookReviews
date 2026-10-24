const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    let usersWithSameName = users.filter((user) => user.username === username);
    return usersWithSameName.length > 0;
};

const authenticatedUser = (username, password) => {
    let validUsers = users.filter((user) => user.username === username && user.password === password);
    return validUsers.length > 0;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in: Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            username: username
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken,
            username
        };

        return res.status(200).send("Customer successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review || req.body.review;
    const username = req.session.authorization ? req.session.authorization.username : (req.user ? req.user.username : null);

    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review content cannot be empty" });
    }

    if (books[isbn]) {
        books[isbn].reviews[username] = review;
        return res.status(200).json({
            message: `The review for the book with ISBN ${isbn} has been added/updated.`,
            reviews: books[isbn].reviews
        });
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization ? req.session.authorization.username : (req.user ? req.user.username : null);

    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    if (books[isbn]) {
        if (books[isbn].reviews[username]) {
            delete books[isbn].reviews[username];
            return res.status(200).send(`Reviews for the ISBN ${isbn} posted by the user ${username} deleted.`);
        } else {
            return res.status(404).json({ message: `No review found for user ${username} under ISBN ${isbn}` });
        }
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
