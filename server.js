// Packages needed for this application
const express = require('express');
const fs = require('fs');

// Reference path library
const path = require('path');

// Helper method to read data from a given a file, append content, write data to the JSON file
const { readFromFile, readAndAppend, writeToFile } = require('./helpers/fsUtils');

// Helper method for generating unique ids
const uuid = require('./helpers/uuid');

// Heroku uses a process.env.PORT variable that is accessible by any program running on Heroku's machine
// so if that variable exists, it will be used, otherwise port 3001 will be used
const PORT = process.env.PORT || 3001;

// Initialize app variable by setting it to the value of express()
const app = express();

// Middleware for parsing application/json 
app.use(express.json());

// Middleware for urlecoded data; `urlencoded` data represents a URL encoded form. 
// This middleware will parse a string into an object containing key value pairs
app.use(express.urlencoded({ extended: true }));


// Access all contents of public folder (css files, js files)
app.use(express.static('public'));

// GET Route for homepage: `GET` returns the `index.html` file.
app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

// GET Route for notes page: `GET /notes` returns the `notes.html` file.
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// GET Route for: `GET /api/notes` reads the `db.json` file and returns all saved notes as JSON.
app.get('/api/notes', (req, res) => {
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

// POST Route for: `POST /api/notes` receives a new note to save on the request body, adds it to the `db.json` file, 
// and then returns the new note to the client. Each note has a unique id when it is saved. 
app.post('/api/notes', (req, res) => {
    // Log that a POST request was received
    console.info(`${req.body} request received to add note`);
    const note = req.body;
    if (note) {
        // Variable for the object that will be saved
        const newNote = {
            title: note.title,
            text: note.text,
            id: uuid(),
        };

        readAndAppend(newNote, './db/db.json');
        // Check if there is anything in the response body
        const response = {
            status: 'success',
            body: newNote,
        };

        res.json(response);
    } else {
        res.json('Error in adding note');
    }
});
// `DELETE /api/notes/:id` receives a query parameter that contains the id of a note to delete. 
// To delete a note, notes are read from the `db.json` file, then the note with the given `id` property is removed, 
// and finally the notes are rewritten to the `db.json` file.
app.delete('/api/notes/:id', (req, res) => {
    // Obtain existing notes
    readFromFile('./db/db.json').then((data) => {

        const notes = JSON.parse(data)
        const newNotes = notes.filter(note => note.id !== req.params.id)
        console.log(newNotes);
        // Write the string to a file
        writeToFile('./db/db.json', newNotes)
        res.send(200).status(200)
    })
})

// Listen for connections
app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT} 🚀`)
);
