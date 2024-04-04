import "./App.css";
import { useEffect, useState } from "react";
import { Button } from "./components/Button/Button";
import { Note } from "./components/Note/Note";
import { Loading } from "./components/Loading/Loading";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState(null);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [newNoteId, setNewNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // État pour stocker la valeur de recherche

  const fetchNotes = async () => {
    const response = await fetch("/notes");
    const data = await response.json();

    setNotes(data);
    setIsLoading(false);
  };

  const createNote = async () => {
    const response = await fetch("/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Nouvelle note",
        content: "",
        lastUpdatedAt: new Date(),
      }),
    });
    const newNote = await response.json();
    setNotes([newNote, ...notes]);
    setNewNoteId(newNote.id);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const refreshNote = (id, { title, content, lastUpdatedAt }) => {
    setNotes(
      notes.map((note) =>
        note.id === id ? { id, title, content, lastUpdatedAt } : note
      )
    );
  };

  useEffect(() => {
    if (newNoteId) {
      setSelectedNoteId(newNoteId);
    }
  }, [newNoteId]);

  const selectedNote = notes && notes.find((note) => note.id === selectedNoteId);

  // Filtrer les notes en fonction de la valeur de recherche
  const filteredNotes = notes
    ? notes.filter((note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      <aside className="Side">
        <div className="Create-note-wrapper">
          <Button onClick={createNote}>+ Create new note</Button>
        </div>
        <div className="Search-wrapper">
          <input
            type="text"
            placeholder="Search notes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="Clear-button"
              onClick={() => setSearchQuery("")}
            >
              X
            </button>
          )}
        </div>
        {isLoading ? (
          <div className="Loading-wrapper">
            <Loading />
          </div>
        ) : (
          filteredNotes.map((note) => (
            <button
              className={`Note-button ${
                selectedNoteId === note.id ? "Note-button-selected" : ""
              }`}
              key={note.id}
              onClick={() => {
                setSelectedNoteId(note.id);
              }}
            >
              {note.title}
            </button>
          ))
        )}
      </aside>
      <main className="Main">
        {selectedNote ? (
          <Note
            id={selectedNote.id}
            title={selectedNote.title}
            content={selectedNote.content}
            onSubmit={refreshNote}
          />
        ) : null}
      </main>
    </>
  );
}

export default App;
