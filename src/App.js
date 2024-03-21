import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {isLoading
          ? "Chargement…"
          : notes?.map((note) => <div>{note.title}</div>)}
      </header>
    </div>
  );
}

export default App;
