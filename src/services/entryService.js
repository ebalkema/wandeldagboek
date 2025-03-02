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
 * @param {File} imageFile - De afbeelding die geüpload moet worden
 * @param {string} userId - Firebase user ID
 * @returns {Promise<string>} - URL van de geüploade afbeelding
 */
const uploadImage = async (imageFile, userId) => {
  try {
    console.log("Begin uploadImage functie met bestand:", imageFile.name);
    
    const timestamp = new Date().getTime();
    const storagePath = `images/${userId}/${timestamp}_${imageFile.name}`;
    const storageRef = ref(storage, storagePath);
    
    console.log("Uploading image to Firebase Storage:", storagePath);
    // Extra logging voor debugging
    console.log("Storage reference created:", storageRef);
    
    // Probeer de upload met extra foutafhandeling
    try {
      await uploadBytes(storageRef, imageFile);
      console.log("Image upload successful");
      const downloadURL = await getDownloadURL(storageRef);
      console.log("Image download URL obtained:", downloadURL);
      return downloadURL;
    } catch (uploadError) {
      console.error("Specifieke upload fout:", uploadError);
      // Als de error een CORS error is, toon specifieke melding
      if (uploadError.message && uploadError.message.includes("CORS")) {
        console.error("CORS fout bij uploaden. Zorg dat CORS is ingeschakeld in Firebase console.");
      }
      throw uploadError;
    }
  } catch (error) {
    console.error("Algemene fout in uploadImage:", error);
    throw error;
  }
};

/**
 * Hulpfunctie om audio te uploaden naar Firebase Storage
 * @param {Blob} audioBlob - De audio die geüpload moet worden
 * @param {string} userId - Firebase user ID
 * @returns {Promise<string>} - URL van de geüploade audio
 */
const uploadAudio = async (audioBlob, userId) => {
  try {
    console.log("Begin uploadAudio functie met blob grootte:", audioBlob.size);
    
    const timestamp = new Date().getTime();
    const storagePath = `audio/${userId}/${timestamp}.webm`;
    const storageRef = ref(storage, storagePath);
    
    console.log("Uploading audio to Firebase Storage:", storagePath);
    // Extra logging voor debugging
    console.log("Storage reference created:", storageRef);
    
    // Probeer de upload met extra foutafhandeling
    try {
      await uploadBytes(storageRef, audioBlob);
      console.log("Audio upload successful");
      const downloadURL = await getDownloadURL(storageRef);
      console.log("Audio download URL obtained:", downloadURL);
      return downloadURL;
    } catch (uploadError) {
      console.error("Specifieke upload fout:", uploadError);
      // Als de error een CORS error is, toon specifieke melding
      if (uploadError.message && uploadError.message.includes("CORS")) {
        console.error("CORS fout bij uploaden. Zorg dat CORS is ingeschakeld in Firebase console.");
      }
      throw uploadError;
    }
  } catch (error) {
    console.error("Algemene fout in uploadAudio:", error);
    throw error;
  }
};

/**
 * Hulpfunctie om een afbeelding te verwijderen uit Firebase Storage
 * @param {string} imageUrl - URL van de afbeelding
 * @returns {Promise<void>}
 */
const deleteImage = async (imageUrl) => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

/**
 * Hulpfunctie om audio te verwijderen uit Firebase Storage
 * @param {string} audioUrl - URL van de audio
 * @returns {Promise<void>}
 */
const deleteAudio = async (audioUrl) => {
  try {
    const audioRef = ref(storage, audioUrl);
    await deleteObject(audioRef);
  } catch (error) {
    console.error('Error deleting audio:', error);
  }
}; 