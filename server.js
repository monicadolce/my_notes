
const express = require('express');
const path = require('path');
const fs = require('fs');

const { readFromFile, readAndAppend, writeToFile } = require('./helpers/fsUtils');
const uuid = require('./helpers/uuid');



const PORT = process.env.PORT || 3001;

const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use(express.static('public'));

// GET Route for homepage: `GET *` should return the `index.html` file.
app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

// GET Route for notes page: `GET /notes` should return the `notes.html` file.
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// GET Route for: `GET /api/notes` should read the `db.json` file and return all saved notes as JSON.
app.get('/api/notes', (req, res) => {
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

// POST Route for: `POST /api/notes` should receive a new note to save on the request body, add it to the `db.json` file, 
// and then return the new note to the client. You'll need to find a way to give each note a unique id when it's saved 
// (look into npm packages that could do this for you).

// First attempt:
app.post('/api/notes', (req, res) => {
    // Log that a POST request was received
    console.info(`${req.body} request received to add note`);
    const note = req.body;
    if (note) {
        const newNote = {
            title: note.title,
            text: note.text,
            id: uuid(),
        };

        readAndAppend(newNote, './db/db.json');

        const response = {
            status: 'success',
            body: newNote,
        };

        res.json(response);
    } else {
        res.json('Error in adding note');
    }
});
// query paramater true passed into otherwise it doesn't
app.delete('/api/notes/:id', (req, res) => {
    readFromFile('./db/db.json').then((data) => {
        const notes =  JSON.parse(data)
        const newNotes = notes.filter( note => note.id !== req.params.id)
        console.log(newNotes);
        writeToFile('./db/db.json', newNotes) 
        res.send(200).status(200)
    })
})


app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT} 🚀`)
);
