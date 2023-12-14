const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection URI
const uri =
  "mongodb+srv://mahith1babloo:mahith1206@cluster0.bvsbz9f.mongodb.net/?retryWrites=true&w=majority";

// Connect to MongoDB
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connect() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

connect();

// API to get all notes
app.get("/api/notes", async (req, res) => {
  try {
    console.log("get api hit");
    const database = client.db("notes");
    const notesCollection = database.collection("notes_info");
    const notes = await notesCollection.find().toArray();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API to add a note
app.post("/api/notes", async (req, res) => {
  const { title, content } = req.body;
  console.log("post api hit");

  try {
    const database = client.db("notes");
    const notesCollection = database.collection("notes_info");
    const newNote = { title, content };
    const result = await notesCollection.insertOne(newNote);
    newNote._id = result.insertedId;
    res.json(newNote);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API to delete a note
app.delete("/api/notes/:id", async (req, res) => {
  const { id } = req.params;

  try {
    console.log("delete api hit");
    const database = client.db("notes");
    const notesCollection = database.collection("notes_info");
    const objectId = new ObjectId(id);
    console.log("id: ", id);
    console.log("id object ", objectId);
    await notesCollection.deleteOne({ _id: objectId });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API to update a note
app.put("/api/notes/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const database = client.db("notes");
    const notesCollection = database.collection("notes_info");
    const result = await notesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, content } }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    res.json({ _id: id, title, content });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
