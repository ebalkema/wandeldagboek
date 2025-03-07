import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialiseer de OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Geen audiobestand ontvangen' },
        { status: 400 }
      );
    }
    
    // Converteer het bestand naar een ArrayBuffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Maak een tijdelijk bestand
    const tempFilePath = `/tmp/audio-${Date.now()}.webm`;
    
    // Simuleer transcriptie (in een echte app zou je hier OpenAI API gebruiken)
    // const transcription = await openai.audio.transcriptions.create({
    //   file: buffer,
    //   model: 'whisper-1',
    // });
    
    // Voor nu simuleren we een transcriptie
    const transcription = {
      text: "Dit is een voorbeeld van een getranscribeerde tekst. In een echte app zou dit het resultaat zijn van de OpenAI Whisper API."
    };
    
    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error('Fout bij transcriptie:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het transcriberen' },
      { status: 500 }
    );
  }
} 