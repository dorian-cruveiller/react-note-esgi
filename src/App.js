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
  const [error, setError] = useState(null); // État pour suivre les erreurs
  const [userName, setUserName] = useState(""); // État pour stocker le nom de l'utilisateur
  const [checkedNotes, setCheckedNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
    fetchUserName(); // Appel de la fonction pour récupérer le nom de l'utilisateur
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchUserName = async () => {
    try {
      const response = await fetch("http://localhost:4000/profile");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération du nom de l'utilisateur");
      }
      const userData = await response.json();
      setUserName(userData.name);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/notes?_page=${page}`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des notes");
      }
      const data = await response.json();
      const notesWithCheckedState = data.data.map(note => ({ ...note }));
      setNotes([...notes, ...notesWithCheckedState]);
      setIsLoading(false);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const createNote = async () => {
    try {
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
      if (!response.ok) {
        throw new Error("Erreur lors de la création d'une note");
      }
      const newNote = await response.json();
      setNotes([newNote, ...notes]);
      setNewNoteId(newNote.id);
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteNote = async (id) => {
    try {
      const response = await fetch(`/notes/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la note");
      }
      setNotes(notes.filter((note) => note.id !== id));
      if (selectedNoteId === id) setSelectedNoteId(null);
    } catch (error) {
      setError(error.message);
    }
  };

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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const loadMoreNotes = () => {
    setPage(page + 1);
  };

  const toggleNoteCheckedState = async (id) => {
    try {
      const updatedNotes = notes.map((note) =>
        note.id === id ? { ...note, isChecked: !note.isChecked } : note
      );
      setNotes(updatedNotes);
  
      const checkedNoteIds = updatedNotes
        .filter((note) => note.isChecked)
        .map((note) => note.id);
      setCheckedNotes(checkedNoteIds);
  
      // Mettre à jour la note côté serveur
      const response = await fetch(`/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedNotes.find((note) => note.id === id)),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de l'état de la note");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const selectedNote = notes.find((note) => note.id === selectedNoteId);

  const filteredNotes = notes
    .filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt));

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
                className={`Note-button ${selectedNoteId === note.id ? "Note-button-selected" : ""}`}
                onClick={() => {
                  setSelectedNoteId(note.id);
                }}
              >
                {note.title}
              </button>
              <input
                type="checkbox"
                checked={note.isChecked}
                onChange={() => toggleNoteCheckedState(note.id)}
              />
            </div>
          ))
        )}
        {error && <p className="Error-message">{error}</p>} {/* Afficher le message d'erreur s'il y en a */}
        <div className="Load-more-wrapper">
          {filteredNotes.length === 10 * page && (
            <Button onClick={loadMoreNotes}>Voir plus</Button>
          )}
        </div>
      </aside>
      <main className="Main">
      <p className="username">Nom de l'utilisateur : {userName}</p>
        {selectedNote ? (
          <Note
            id={selectedNote.id}
            title={selectedNote.title}
            content={selectedNote.content}
            isChecked={selectedNote.isChecked}
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
