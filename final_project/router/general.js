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

// Helper Promise: Get all books (Task 10)
const getAllBooksPromise = () => {
    return new Promise((resolve) => {
        resolve(books);
    });
};

// Task 1 & Task 10: Get the book list available in the shop using async/await with Promise
public_users.get('/', async function (req, res) {
    try {
        const bookList = await getAllBooksPromise();
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Error fetching book list", error: error.message });
    }
});

// Helper Promise: Get book by ISBN (Task 11)
const getBookByISBNPromise = (isbn) => {
    return new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject({ status: 404, message: `Book with ISBN ${isbn} not found` });
        }
    });
};

// Task 3 & Task 11: Get book details based on ISBN using Promise callbacks (.then/.catch)
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getBookByISBNPromise(isbn)
        .then((book) => {
            return res.status(200).send(JSON.stringify(book, null, 4));
        })
        .catch((err) => {
            return res.status(err.status || 404).json({ message: err.message });
        });
});

// Helper Promise: Get books by Author (Task 12)
const getBooksByAuthorPromise = (author) => {
    return new Promise((resolve, reject) => {
        const matchingBooks = {};
        for (let id in books) {
            if (books[id].author.toLowerCase() === author.toLowerCase()) {
                matchingBooks[id] = books[id];
            }
        }
        if (Object.keys(matchingBooks).length > 0) {
            resolve(matchingBooks);
        } else {
            reject({ status: 404, message: `No books found by author ${author}` });
        }
    });
};

// Task 4 & Task 12: Get book details based on author using async/await
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const authorBooks = await getBooksByAuthorPromise(author);
        return res.status(200).send(JSON.stringify(authorBooks, null, 4));
    } catch (err) {
        return res.status(err.status || 404).json({ message: err.message });
    }
});

// Helper Promise: Get books by Title (Task 13)
const getBooksByTitlePromise = (title) => {
    return new Promise((resolve, reject) => {
        const matchingBooks = {};
        for (let id in books) {
            if (books[id].title.toLowerCase() === title.toLowerCase()) {
                matchingBooks[id] = books[id];
            }
        }
        if (Object.keys(matchingBooks).length > 0) {
            resolve(matchingBooks);
        } else {
            reject({ status: 404, message: `No books found with title ${title}` });
        }
    });
};

// Task 5 & Task 13: Get all books based on title using Promise callbacks (.then/.catch)
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    getBooksByTitlePromise(title)
        .then((titleBooks) => {
            return res.status(200).send(JSON.stringify(titleBooks, null, 4));
        })
        .catch((err) => {
            return res.status(err.status || 404).json({ message: err.message });
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

// ============================================================================
// Tasks 10-13 Axios Alternative Implementations (Self-Invoking Reference)
// ============================================================================

// Task 10 with Axios: Get all books using async/await
async function getBooksWithAxios(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Axios error getting books:", error.message);
    }
}

// Task 11 with Axios: Get book by ISBN using Promise (.then)
function getBookByISBNWithAxios(url, isbn) {
    return axios.get(`${url}/isbn/${isbn}`)
        .then(response => response.data)
        .catch(error => console.error("Axios error getting book by ISBN:", error.message));
}

// Task 12 with Axios: Get book by Author using async/await
async function getBooksByAuthorWithAxios(url, author) {
    try {
        const response = await axios.get(`${url}/author/${encodeURIComponent(author)}`);
        return response.data;
    } catch (error) {
        console.error("Axios error getting books by author:", error.message);
    }
}

// Task 13 with Axios: Get book by Title using Promise (.then)
function getBooksByTitleWithAxios(url, title) {
    return axios.get(`${url}/title/${encodeURIComponent(title)}`)
        .then(response => response.data)
        .catch(error => console.error("Axios error getting books by title:", error.message));
}

module.exports.general = public_users;
module.exports.getBooksWithAxios = getBooksWithAxios;
module.exports.getBookByISBNWithAxios = getBookByISBNWithAxios;
module.exports.getBooksByAuthorWithAxios = getBooksByAuthorWithAxios;
module.exports.getBooksByTitleWithAxios = getBooksByTitleWithAxios;
