/**
 * Initialiseert de localStorage met lege arrays voor walks en observations als deze nog niet bestaan.
 * Dit zorgt ervoor dat de app correct werkt, zelfs als er nog geen data is opgeslagen.
 */
export function initStorage() {
  if (typeof window !== 'undefined') {
    // Controleer of walks al bestaat in localStorage
    if (!localStorage.getItem('walks')) {
      localStorage.setItem('walks', JSON.stringify([]));
    }
    
    // Controleer of observations al bestaat in localStorage
    if (!localStorage.getItem('observations')) {
      localStorage.setItem('observations', JSON.stringify([]));
    }
  }
} 