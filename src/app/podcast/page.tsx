'use client';

import { useState } from 'react';
import Link from 'next/link';

const episodes = [
  {
    id: 1,
    title: 'Lente in het bos',
    description: 'In deze aflevering bespreken Menno en Erwin de terugkeer van de voorjaarsvogels en wat je allemaal kunt zien tijdens een lentewandeling.',
    date: '1 april 2024',
    audioUrl: 'https://file-examples.com/storage/fee472685c0ad438f81ebe8/2017/11/file_example_MP3_700KB.mp3', // Voorbeeld MP3
    duration: '28:45',
  },
  {
    id: 2,
    title: 'Stadsvogels herkennen',
    description: 'Menno en Erwin leren je hoe je de meest voorkomende stadsvogels kunt herkennen aan hun uiterlijk en zang.',
    date: '15 maart 2024',
    audioUrl: 'https://file-examples.com/storage/fee472685c0ad438f81ebe8/2017/11/file_example_MP3_700KB.mp3', // Voorbeeld MP3
    duration: '32:10',
  },
  {
    id: 3,
    title: 'Natuurfotografie voor beginners',
    description: 'Tips en trucs voor het maken van mooie natuurfoto\'s, zelfs met je smartphone!',
    date: '1 maart 2024',
    audioUrl: 'https://file-examples.com/storage/fee472685c0ad438f81ebe8/2017/11/file_example_MP3_700KB.mp3', // Voorbeeld MP3
    duration: '35:22',
  }
];

export default function PodcastPage() {
  const [currentEpisode, setCurrentEpisode] = useState(episodes[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="space-y-6">
      <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Terug naar home
      </Link>
      
      <h1 className="text-2xl font-bold">Menno & Erwin Podcast</h1>
      
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{currentEpisode.title}</h2>
          <p className="text-gray-600 mt-2">{currentEpisode.description}</p>
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <span>{currentEpisode.date}</span>
            <span className="mx-2">•</span>
            <span>{currentEpisode.duration}</span>
          </div>
        </div>
        
        <div className="w-full">
          <audio 
            src={currentEpisode.audioUrl} 
            controls 
            className="w-full"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            Je browser ondersteunt geen audio element.
          </audio>
        </div>
      </div>
      
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Alle afleveringen</h2>
        <div className="space-y-4">
          {episodes.map((episode) => (
            <div 
              key={episode.id} 
              className={`p-4 rounded-lg cursor-pointer ${
                currentEpisode.id === episode.id 
                  ? 'bg-green-50 border border-green-200' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setCurrentEpisode(episode)}
            >
              <h3 className="font-semibold">{episode.title}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <span>{episode.date}</span>
                <span className="mx-2">•</span>
                <span>{episode.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 