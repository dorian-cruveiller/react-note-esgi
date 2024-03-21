import "./App.css";
import { useEffect, useState } from "react";
import { Button } from "./components/Button/Button";

// Cycle de vie du composant App :
// Initialement : `notes` vaut `null`, donc pas d'affichage dans le header
// Après le rendu initial : lancement de la requête au serveur (GET /notes)
// À la réponse du serveur : `notes` devient la réponse du serveur, rafraîchissement de l'affichage

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState(null);

  const fetchNotes = async () => {
    const response = await fetch("/notes");
    const data = await response.json();

    setNotes(data);
    setIsLoading(false);
  };

  const createNote = () => {
    fetch("/notes", {
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
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <>
      <aside className="Side">
        <div className="Create-note-wrapper">
          <Button onClick={createNote}>+ Create new note</Button>
        </div>
        {isLoading
          ? "Chargement…"
          : notes?.map((note) => (
              <button className="Note-button" key={note.id}>
                {note.title}
              </button>
            ))}
      </aside>
      <main className="Main"></main>
    </>
  );
}

export default App;
