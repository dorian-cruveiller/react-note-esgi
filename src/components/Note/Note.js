import { useEffect, useState } from "react";
import { Button } from "../Button/Button";
import "./Note.css";
import { useDebouncedEffect } from "../../hooks/useDebouncedEffect"; // Importer le hook personnalisé

export function Note({
  id,
  title: initialTitle,
  content: initialContent,
  isChecked,
  isPinned,
  onSubmit,
  onDelete,
}) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isModified, setIsModified] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
  }, [id, initialTitle, initialContent]);

  // Utiliser le hook personnalisé pour la sauvegarde automatique des modifications
  useDebouncedEffect(
    () => {
      if (isModified) {
        saveNote();
      }
    },
    [title, content, isModified], // Dépendances à surveiller
    1000 // Délai de 1 seconde
  );

  const saveNote = async () => {
    try {
      const response = await fetch(`/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          lastUpdatedAt: new Date(),
          isChecked: isChecked,
          isPinned: isPinned
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde de la note");
      }

      const updatedNote = await response.json();
      onSubmit(id, updatedNote);
      setIsSaved(true);
      setIsModified(false);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteNote = async () => {
    try {
      const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cette note ?");
      if (confirmDelete) {
        await onDelete(id);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form
      className="Form"
      onSubmit={(event) => {
        event.preventDefault();
        saveNote(); // Sauvegarde manuelle au cas où l'utilisateur soumettrait le formulaire
      }}
    >
      <input
        className="Note-editable Note-title"
        type="text"
        value={title}
        onChange={(event) => {
          setTitle(event.target.value);
          setIsModified(true);
          setIsSaved(false);
        }}
      />
      <textarea
        className="Note-editable Note-content"
        value={content}
        onChange={(event) => {
          setContent(event.target.value);
          setIsModified(true);
          setIsSaved(false);
        }}
      />
      <div className="Note-actions">
        <Button>Enregistrer</Button>
        {isSaved && <p>Enregistré</p>}
        <Button onClick={handleDeleteNote}>Supprimer</Button>
        {error && <p className="Error-message">{error}</p>}
      </div>
    </form>
  );
}
