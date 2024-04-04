import "./App.css";
import { useEffect, useState } from "react";
import { Button } from "./components/Button/Button";
import { Note } from "./components/Note/Note";
import { Loading } from "./components/Loading/Loading";

// Cycle de vie du composant App :
// Initialement : `notes` vaut `null`, donc pas d'affichage dans le header
// Après le rendu initial : lancement de la requête au serveur (GET /notes)
// À la réponse du serveur : `notes` devient la réponse du serveur, rafraîchissement de l'affichage

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState(null);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [newNoteId, setNewNoteId] = useState(null); // État pour stocker l'ID de la nouvelle note

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
    setNewNoteId(newNote.id); // Mettre à jour l'état avec l'ID de la note nouvellement créée
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
      setSelectedNoteId(newNoteId); // Rediriger vers la note nouvellement créée
    }
  }, [newNoteId]);

  const selectedNote =
    notes && notes.find((note) => note.id === selectedNoteId);

  return (
    <>
      <aside className="Side">
        <div className="Create-note-wrapper">
          <Button onClick={createNote}>+ Create new note</Button>
        </div>
        {isLoading ? (
          <div className="Loading-wrapper">
            <Loading />
          </div>
        ) : (
          notes?.map((note) => (
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
