import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  deleteDoc, 
  updateDoc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

// Collection naam
const ENTRIES_COLLECTION = 'entries';

/**
 * Haal alle wandelnotities op voor een specifieke gebruiker
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Array>} - Lijst met wandelnotities
 */
export const fetchEntries = async (userId) => {
  try {
    console.log('Start fetchEntries voor gebruiker:', userId);
    
    // Valideer userId
    if (!userId) {
      console.error('fetchEntries aangeroepen zonder geldige userId');
      return [];
    }
    
    const entriesRef = collection(db, ENTRIES_COLLECTION);
    console.log('Query uitvoeren op collection:', ENTRIES_COLLECTION);
    
    const q = query(
      entriesRef, 
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    console.log('Query parameters:', { 
      collection: ENTRIES_COLLECTION, 
      userId: userId,
      orderBy: 'createdAt' 
    });
    
    const querySnapshot = await getDocs(q);
    console.log(`Query resultaat: ${querySnapshot.size} documenten gevonden`);
    
    const entries = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`Document gevonden: ${doc.id}`, data);
      
      // Controleer of alle noodzakelijke velden aanwezig zijn
      if (!data.createdAt) {
        console.warn(`Document ${doc.id} heeft geen createdAt veld`);
      }
      
      entries.push({
        id: doc.id,
        ...data,
        // Zorg ervoor dat timestamps correct worden geconverteerd voor display
        createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt) : new Date(),
        updatedAt: data.updatedAt ? (data.updatedAt.toDate ? data.updatedAt.toDate() : data.updatedAt) : new Date()
      });
    });
    
    console.log(`fetchEntries voltooid: ${entries.length} notities geladen`);
    return entries;
  } catch (error) {
    console.error('Error fetching entries:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'permission-denied') {
      console.error('TOEGANG GEWEIGERD: Controleer Firestore beveiligingsregels!');
    }
    
    throw error;
  }
};

/**
 * Voeg een nieuwe wandelnotitie toe
 * @param {Object} entry - De wandelnotitie data
 * @param {string} userId - Firebase user ID
 * @param {File} imageFile - Eventuele afbeelding (optioneel)
 * @param {Blob} audioBlob - Eventuele audio-opname (optioneel)
 * @returns {Promise<Object>} - De nieuwe wandelnotitie met ID
 */
export const addEntry = async (entry, userId, imageFile = null, audioBlob = null) => {
  try {
    console.log('Begin addEntry functie:', { entry, userId });
    console.log('Bestanden om te uploaden:', { 
      heeftAfbeelding: !!imageFile, 
      heeftAudio: !!audioBlob 
    });
    
    // Basisgegevens van de wandelnotitie
    let newEntry = {
      ...entry,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Afbeelding uploaden indien aanwezig
    if (imageFile) {
      console.log('Start afbeelding uploaden...');
      try {
        const imageUrl = await uploadImage(imageFile, userId);
        newEntry.imageUrl = imageUrl;
        console.log('Afbeelding geüpload naar:', imageUrl);
      } catch (imgError) {
        console.error('Fout bij uploaden afbeelding:', imgError);
        throw imgError;
      }
    }
    
    // Audio uploaden indien aanwezig
    if (audioBlob) {
      console.log('Start audio uploaden...');
      try {
        const audioUrl = await uploadAudio(audioBlob, userId);
        newEntry.audioUrl = audioUrl;
        console.log('Audio geüpload naar:', audioUrl);
      } catch (audioError) {
        console.error('Fout bij uploaden audio:', audioError);
        throw audioError;
      }
    }
    
    // Document toevoegen aan Firestore
    console.log('Toevoegen aan Firestore database...');
    try {
      console.log('Probeer document toe te voegen met gegevens:', JSON.stringify(newEntry, null, 2));
      const docRef = await addDoc(collection(db, ENTRIES_COLLECTION), newEntry);
      console.log('Document toegevoegd met ID:', docRef.id);
      
      return { 
        id: docRef.id, 
        ...newEntry,
        createdAt: new Date(), // Lokale datum toevoegen omdat serverTimestamp() nog niet direct een waarde heeft
        updatedAt: new Date()
      };
    } catch (firestoreError) {
      console.error('Gedetailleerde Firestore fout:', firestoreError);
      console.error('Foutcode:', firestoreError.code);
      console.error('Foutbericht:', firestoreError.message);
      
      if (firestoreError.code === 'permission-denied') {
        console.error('TOEGANG GEWEIGERD: Controleer je Firestore beveiligingsregels!');
      }
      
      throw firestoreError;
    }
  } catch (error) {
    console.error('Error adding entry:', error);
    throw error;
  }
};

/**
 * Update een bestaande wandelnotitie
 * @param {string} entryId - ID van de wandelnotitie
 * @param {Object} updates - Velden die geüpdatet moeten worden
 * @returns {Promise<void>}
 */
export const updateEntry = async (updatedEntry) => {
  try {
    // Controleer of alle benodigde data aanwezig is
    if (!updatedEntry || !updatedEntry.id) {
      throw new Error('Ongeldige notitie data voor update');
    }
    
    console.log('Notitie bijwerken in Firestore:', updatedEntry.id);
    
    // Zorg ervoor dat we een bijgewerkt timestamp hebben
    if (!updatedEntry.updatedAt) {
      updatedEntry.updatedAt = new Date();
    }
    
    // Bereid de data voor om naar Firestore te schrijven
    // We verwijderen het 'id' veld omdat dit niet in het document hoeft te worden opgeslagen
    const { id, ...entryDataWithoutId } = updatedEntry;
    
    // Update de entry in Firestore
    const entryRef = doc(db, 'entries', id);
    await updateDoc(entryRef, entryDataWithoutId);
    
    console.log('Notitie succesvol bijgewerkt in Firestore');
    
    // Geef de bijgewerkte entry terug
    return updatedEntry;
  } catch (error) {
    console.error('Fout bij bijwerken van notitie in Firestore:', error);
    
    // Gooi de fout door zodat de aanroepende component deze kan afhandelen
    throw error;
  }
};

/**
 * Verwijder een wandelnotitie
 * @param {string} entryId - ID van de wandelnotitie
 * @param {Object} entry - De volledige entry data (nodig voor het verwijderen van bestanden)
 * @returns {Promise<void>}
 */
export const deleteEntry = async (entryId, entry) => {
  try {
    // Verwijder de afbeelding indien aanwezig
    if (entry.imageUrl) {
      await deleteImage(entry.imageUrl);
    }
    
    // Verwijder de audio indien aanwezig
    if (entry.audioUrl) {
      await deleteAudio(entry.audioUrl);
    }
    
    // Document verwijderen uit Firestore
    const entryRef = doc(db, ENTRIES_COLLECTION, entryId);
    await deleteDoc(entryRef);
  } catch (error) {
    console.error('Error deleting entry:', error);
    throw error;
  }
};

/**
 * Hulpfunctie om een afbeelding te uploaden naar Firebase Storage
 * @param {File} imageFile - Het afbeeldingsbestand dat geüpload moet worden
 * @param {string} userId - Firebase user ID
 * @returns {Promise<string>} - URL van de geüploade afbeelding
 */
const uploadImage = async (imageFile, userId) => {
  try {
    console.log("Begin uploadImage functie met bestand:", imageFile.name, "grootte:", imageFile.size, "type:", imageFile.type);
    
    // Controleer of het bestand geldig is
    if (!imageFile || imageFile.size === 0) {
      throw new Error("Ongeldig afbeeldingsbestand: bestand is leeg of niet gedefinieerd");
    }
    
    // Controleer of storage is geïnitialiseerd
    if (!storage) {
      console.error("Firebase Storage is niet geïnitialiseerd!");
      throw new Error("Firebase Storage is niet beschikbaar");
    }
    
    // Genereer een unieke bestandsnaam met timestamp
    const timestamp = new Date().getTime();
    const storagePath = `images/${userId}/${timestamp}_${imageFile.name}`;
    console.log("Storage pad voor upload:", storagePath);
    
    // Maak een reference naar de locatie in Firebase Storage
    const storageRef = ref(storage, storagePath);
    console.log("Storage reference aangemaakt:", storageRef);
    
    // Upload de afbeelding
    console.log("Start uploadBytes...");
    const snapshot = await uploadBytes(storageRef, imageFile);
    console.log("Afbeelding geüpload, snapshot:", snapshot);
    
    // Haal de download URL op
    console.log("Download URL ophalen...");
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("Download URL verkregen:", downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error("Fout bij uploaden afbeelding:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Error details:", error);
    throw error;
  }
};

/**
 * Hulpfunctie om een audio bestand te uploaden naar Firebase Storage
 * @param {Blob} audioBlob - De audio blob die geüpload moet worden
 * @param {string} userId - Firebase user ID
 * @returns {Promise<string>} - URL van het geüploade audio bestand
 */
const uploadAudio = async (audioBlob, userId) => {
  try {
    console.log("Begin uploadAudio functie met blob size:", audioBlob.size, "type:", audioBlob.type);
    
    // Controleer of de blob geldig is
    if (!audioBlob || audioBlob.size === 0) {
      throw new Error("Ongeldige audio blob: blob is leeg of niet gedefinieerd");
    }
    
    // Controleer of storage is geïnitialiseerd
    if (!storage) {
      console.error("Firebase Storage is niet geïnitialiseerd!");
      throw new Error("Firebase Storage is niet beschikbaar");
    }
    
    const timestamp = new Date().getTime();
    const storagePath = `audio/${userId}/${timestamp}_audio.webm`;
    console.log("Storage pad voor upload:", storagePath);
    
    // Maak een reference naar de locatie in Firebase Storage
    const storageRef = ref(storage, storagePath);
    console.log("Storage reference aangemaakt:", storageRef);
    
    // Upload de audio blob
    console.log("Start uploadBytes...");
    const snapshot = await uploadBytes(storageRef, audioBlob);
    console.log("Audio geüpload, snapshot:", snapshot);
    
    // Haal de download URL op
    console.log("Download URL ophalen...");
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("Download URL verkregen:", downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error("Fout bij uploaden audio:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Error details:", error);
    throw error;
  }
};

/**
 * Hulpfunctie om een afbeelding te verwijderen uit Firebase Storage
 * @param {string} imageUrl - De URL van de afbeelding die verwijderd moet worden
 * @returns {Promise<void>}
 */
const deleteImage = async (imageUrl) => {
  try {
    // Haal de storage path uit de URL
    const urlObj = new URL(imageUrl);
    const pathWithToken = urlObj.pathname;
    
    // Verwijder de token parameters en het voorvoegsel '/v0/b/[project-id].appspot.com/o/'
    const encodedPath = pathWithToken.split('/o/')[1].split('?')[0];
    
    // Decode de URL om de echte path te krijgen
    const path = decodeURIComponent(encodedPath);
    
    console.log("Verwijderen afbeelding uit storage:", path);
    
    // Maak een reference naar het bestand
    const imageRef = ref(storage, path);
    
    // Verwijder het bestand
    await deleteObject(imageRef);
    console.log("Afbeelding succesvol verwijderd");
  } catch (error) {
    console.error("Fout bij verwijderen afbeelding:", error);
    // We gooien de fout niet door, omdat we niet willen dat het verwijderen van de entry faalt
    // als het verwijderen van de afbeelding mislukt
  }
};

/**
 * Hulpfunctie om een audio bestand te verwijderen uit Firebase Storage
 * @param {string} audioUrl - De URL van het audio bestand dat verwijderd moet worden
 * @returns {Promise<void>}
 */
const deleteAudio = async (audioUrl) => {
  try {
    // Haal de storage path uit de URL
    const urlObj = new URL(audioUrl);
    const pathWithToken = urlObj.pathname;
    
    // Verwijder de token parameters en het voorvoegsel '/v0/b/[project-id].appspot.com/o/'
    const encodedPath = pathWithToken.split('/o/')[1].split('?')[0];
    
    // Decode de URL om de echte path te krijgen
    const path = decodeURIComponent(encodedPath);
    
    console.log("Verwijderen audio uit storage:", path);
    
    // Maak een reference naar het bestand
    const audioRef = ref(storage, path);
    
    // Verwijder het bestand
    await deleteObject(audioRef);
    console.log("Audio succesvol verwijderd");
  } catch (error) {
    console.error("Fout bij verwijderen audio:", error);
    // We gooien de fout niet door, omdat we niet willen dat het verwijderen van de entry faalt
    // als het verwijderen van de audio mislukt
  }
}; 