import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [notes, setNotes] = useState(null);

  const fetchNotes = async () => {
    const response = await fetch("/notes");
    const data = await response.json();

    setNotes(data);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {notes?.map((note) => (
          <div>{note.title}</div>
        ))}
      </header>
    </div>
  );
}

export default App;
