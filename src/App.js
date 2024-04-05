import "./App.css";
import { useEffect, useState } from "react";
import { Button } from "./components/Button/Button";
import { Note } from "./components/Note/Note";
import { Loading } from "./components/Loading/Loading";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [newNoteId, setNewNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [page, setPage] = useState(1);

  const fetchNotes = async () => {
    console.log(page)
    const response = await fetch(`/notes?_page=${page}`);
    const data = await response.json();
    setNotes([...notes, ...data.data]);
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

  const deleteNote = async (id) => {
    const response = await fetch(`/notes/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setNotes(notes.filter((note) => note.id !== id));
      if (selectedNoteId === id) setSelectedNoteId(null);
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

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

  const selectedNote = notes.find((note) => note.id === selectedNoteId);

  const filteredNotes = notes
    .filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt));

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const loadMoreNotes = () => {
    setPage(page + 1);
  };

  return (
    <div className={`App ${!isDarkMode ? "light-mode" : ""}`}>
      <aside className={`Side ${!isDarkMode ? "Side-dark" : ""}`}>
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
            <div key={note.id} className="Note-button-container">
              <button
                className={`Note-button ${
                  selectedNoteId === note.id ? "Note-button-selected" : ""
                }`}
                onClick={() => {
                  setSelectedNoteId(note.id);
                }}
              >
                {note.title}
              </button>
            </div>
          ))
        )}
        <div className="Load-more-wrapper">
          {filteredNotes.length === (10 * page) && (
            <Button onClick={loadMoreNotes}>Voir plus</Button>
          )}
        </div>
      </aside>
      <main className="Main">
        {selectedNote ? (
          <Note
            id={selectedNote.id}
            title={selectedNote.title}
            content={selectedNote.content}
            onSubmit={refreshNote}
            onDelete={deleteNote}
          />
        ) : null}
      </main>
      <div className="theme-switch">
        <Button onClick={toggleDarkMode}>
          {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </Button>
      </div>
    </div>
  );
}

export default App;
