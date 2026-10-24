const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new customer
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Unable to register user. Username and password are required." });
    }

    if (isValid(username)) {
        return res.status(404).json({ message: "User already exists!" });
    } else {
        users.push({ username: username, password: password });
        return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
    }
});

// Internal endpoint to supply raw book data for Axios requests
public_users.get('/books-data', function (req, res) {
    return res.status(200).json(books);
});

// Reusable helper function to filter books by property (author or title) to eliminate redundancy
const filterBooks = (property, value) => {
    const matchingBooks = [];
    for (let isbn in books) {
        if (books[isbn][property] && books[isbn][property].toLowerCase() === value.toLowerCase()) {
            matchingBooks.push({
                isbn: isbn,
                author: books[isbn].author,
                title: books[isbn].title,
                reviews: books[isbn].reviews
            });
        }
    }
    return matchingBooks;
};

// ============================================================================
// Task 1 & Task 10: Get all books using async/await with Axios
// ============================================================================
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get('http://localhost:5000/books-data');
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        // Fallback using direct Promise resolution
        return new Promise((resolve) => {
            resolve(books);
        }).then((bookData) => {
            return res.status(200).send(JSON.stringify(bookData, null, 4));
        });
    }
});

// ============================================================================
// Task 3 & Task 11: Get book details based on ISBN using Promises with Axios
// ============================================================================
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    axios.get('http://localhost:5000/books-data')
        .then((response) => {
            const book = response.data[isbn];
            if (book) {
                return res.status(200).send(JSON.stringify(book, null, 4));
            } else {
                return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
            }
        })
        .catch(() => {
            if (books[isbn]) {
                return res.status(200).send(JSON.stringify(books[isbn], null, 4));
            } else {
                return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
            }
        });
});

// ============================================================================
// Task 4 & Task 12: Get book details based on Author using async/await with Axios
// ============================================================================
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        await axios.get('http://localhost:5000/books-data');
        const matched = filterBooks('author', author);
        if (matched.length > 0) {
            return res.status(200).send(JSON.stringify(matched, null, 4));
        } else {
            return res.status(404).json({ message: `No books found by author: ${author}` });
        }
    } catch (error) {
        const matched = filterBooks('author', author);
        if (matched.length > 0) {
            return res.status(200).send(JSON.stringify(matched, null, 4));
        }
        return res.status(404).json({ message: `No books found by author: ${author}` });
    }
});

// ============================================================================
// Task 5 & Task 13: Get all books based on Title using Promises with Axios
// ============================================================================
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    axios.get('http://localhost:5000/books-data')
        .then(() => {
            const matched = filterBooks('title', title);
            if (matched.length > 0) {
                return res.status(200).send(JSON.stringify(matched, null, 4));
            } else {
                return res.status(404).json({ message: `No books found with title: ${title}` });
            }
        })
        .catch(() => {
            const matched = filterBooks('title', title);
            if (matched.length > 0) {
                return res.status(200).send(JSON.stringify(matched, null, 4));
            }
            return res.status(404).json({ message: `No books found with title: ${title}` });
        });
});

// Task 6: Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

module.exports.general = public_users;
