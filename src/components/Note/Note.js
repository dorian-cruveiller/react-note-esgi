import { useEffect, useState } from "react";
import { Button } from "../Button/Button";
import "./Note.css";

export function Note({
  id,
  title: initialTitle,
  content: initialContent,
  onSubmit,
  onDelete, // Ajout de la fonction onDelete pour supprimer la note
}) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isModified, setIsModified] = useState(false);
  const [isSaved, setIsSaved] = useState(false); // Nouvel état pour suivre si la note a été récemment enregistrée

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
  }, [id, initialTitle, initialContent]);

  const updateNote = async () => {

    const response = await fetch(`/notes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        content,
        lastUpdatedAt: new Date(),
      }),
    });

    if (response.status === 404) {
      return
    }

    const updatedNote = await response.json();
    onSubmit(id, updatedNote);
    setIsSaved(true); // Marquer la note comme récemment enregistrée après la mise à jour
    setIsModified(false); // Réinitialiser le statut de modification après l'enregistrement
  };

  const deleteNote = async () => {
    await onDelete(id); // Appeler la fonction onDelete avec l'ID de la note
  };

  return (
    <form
      className="Form"
      onSubmit={(event) => {
        event.preventDefault();
        updateNote();
      }}
    >
      <input
        className="Note-editable Note-title"
        type="text"
        value={title}
        onChange={(event) => {
          setTitle(event.target.value);
          setIsModified(true); // Marquer la note comme modifiée lors de la saisie dans le champ de titre
          setIsSaved(false); // Réinitialiser le statut de sauvegarde lors de la modification
        }}
      />
      <textarea
        className="Note-editable Note-content"
        value={content}
        onChange={(event) => {
          setContent(event.target.value);
          setIsModified(true); // Marquer la note comme modifiée lors de la saisie dans le champ de contenu
          setIsSaved(false); // Réinitialiser le statut de sauvegarde lors de la modification
        }}
      />
      <div className="Note-actions">
        <Button>Enregistrer</Button>
        {isSaved && <p>Enregistré</p>} {/* Afficher "Enregistré" si la note est récemment enregistrée */}
        <Button onClick={deleteNote}>Supprimer</Button>
      </div>
    </form>
  );
}
