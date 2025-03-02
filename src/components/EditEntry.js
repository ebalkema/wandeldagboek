import React, { useState, useEffect, useMemo } from 'react';

const EditEntry = ({ entry, onSave, onCancel }) => {
  // State voor het formulier
  const [formState, setFormState] = useState({
    notes: '',
    category: '',
    customCategory: ''
  });
  
  // Vooraf ingevulde categorieën
  const categories = useMemo(() => ['natuur', 'stad', 'strand', 'bos'], []);
  
  // Entry data laden in het formulier
  useEffect(() => {
    if (entry) {
      setFormState({
        notes: entry.notes || '',
        category: entry.category || '',
        customCategory: !categories.includes(entry.category) ? entry.category : ''
      });
    }
  }, [entry, categories]);
  
  // Verwerk wijzigingen in inputvelden
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Verwerk categorie selectie
  const handleCategorySelect = (category) => {
    setFormState((prev) => ({
      ...prev,
      category: prev.category === category ? '' : category,
      // Reset customCategory als een standaard categorie geselecteerd wordt
      customCategory: prev.category === category ? prev.customCategory : ''
    }));
  };
  
  // Formulier verzenden
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Bepaal de uiteindelijke categorie (standaard of aangepast)
    const finalCategory = formState.customCategory || formState.category;
    
    // Bereid de update voor
    const updatedEntry = {
      ...entry,
      notes: formState.notes,
      category: finalCategory,
      updatedAt: new Date() // Timestamp voor update
    };
    
    // Stuur de update naar de parent component
    onSave(updatedEntry);
  };
  
  return (
    <div className="edit-form card">
      <h2>Wandelnotitie bewerken</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Informatie over de wandelnotitie die niet gewijzigd kan worden */}
        <div className="form-row entry-meta">
          <p><strong>Datum:</strong> {entry?.timestamp?.toDate ? entry.timestamp.toDate().toLocaleString('nl-NL') : 'Onbekend'}</p>
          <p><strong>Locatie:</strong> {entry?.location?.name || `${entry?.location?.latitude.toFixed(4)}, ${entry?.location?.longitude.toFixed(4)}` || 'Onbekend'}</p>
        </div>
        
        {/* Bewerkbare velden */}
        <div className="form-row">
          <label htmlFor="notes">Aantekeningen:</label>
          <textarea 
            id="notes"
            name="notes"
            value={formState.notes}
            onChange={handleInputChange}
            rows="4"
            placeholder="Voeg aantekeningen over je wandeling toe..."
          />
        </div>
        
        <div className="form-row">
          <label>Categorie:</label>
          <div className="category-select">
            {categories.map((category) => (
              <div 
                key={category}
                className={`category-option ${formState.category === category ? 'selected' : ''}`}
                onClick={() => handleCategorySelect(category)}
              >
                {category}
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-row">
          <label htmlFor="customCategory">Of voeg een eigen categorie toe:</label>
          <input
            type="text"
            id="customCategory"
            name="customCategory"
            value={formState.customCategory}
            onChange={handleInputChange}
            placeholder="Eigen categorie..."
            disabled={!!formState.category}
          />
        </div>
        
        <div className="form-actions">
          <button type="button" className="secondary-btn" onClick={onCancel}>
            Annuleren
          </button>
          <button type="submit" className="primary-btn">
            Opslaan
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEntry; 