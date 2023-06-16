const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");
const Notes = require("../models/Notes");

//Route-1: Add notes using POST path: /api/notes/addNote (Login is required)
router.post(
  "/addNote",
  [
    body("title").isLength({ min: 3 }),
    body("description").isLength({ min: 5 }),
  ],
  fetchUser,
  async (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      //Takig the email and password from body
      const { title, description, tag } = req.body;
      try {
        const notes = new Notes({
          title,
          description,
          tag,
          user: req.user.id,
        });

        const savedNotes = await notes.save();
        res.send(savedNotes);
      } catch (error) {
        console.log(error);
        res.status(500).send("Server error");
      }
    } else {
      res.send({ errors: result.array() });
    }
  }
);

//Route-2: Fetch all notes using GET path: /api/notes/fetchAllNotes (Login is required)
router.get("/fetchAllNotes", fetchUser, async (req, res) => {
  try {
    // Check the user ID
    const notes = await Notes.find({ user: req.user.id });
    // Check the fetched notes
    res.json(notes);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
});

//Router-3: Updatig the notes using PUT path: /api/auth/updateNote (Login is required)
router.put("/updateNote/:id", fetchUser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    //find the note that has to update

    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found");
    }
    if (note.user && note.user.toString() !== req.user.id) {
      return res.status(401).send("Unauthorized");
    }

    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json(note);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
});

//  DEL path: /api/notes/deleteNote 
router.delete("/deleteNote/:id", fetchUser, async (req, res) => {
  try {
    //find the note that has to delete

    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found");
    }
    if (note.user && note.user.toString() !== req.user.id) {
      return res.status(401).send("Unauthorized");
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.json("Success note has been deleted");
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
