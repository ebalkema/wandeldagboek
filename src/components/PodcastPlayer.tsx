'use client';

import { useState, useEffect } from 'react';

interface PodcastEpisode {
  id: string;
  title: string;
  audioUrl: string;
  description: string;
  publishDate: string;
}

export default function PodcastPlayer() {
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // TODO: Implementeer echte API call
    setEpisode({
      id: '1',
      title: 'Lente in het bos',
      audioUrl: '/dummy-podcast.mp3',
      description: 'In deze aflevering bespreken we de voorjaarsvogels',
      publishDate: '2024-04-01'
    });
  }, []);

  if (!episode) return <div>Laden...</div>;

  return (
    <section className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Laatste Podcast</h2>
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold">{episode.title}</h3>
          <p className="text-sm text-gray-600">{episode.description}</p>
          <p className="text-xs text-gray-500 mt-2">
            Gepubliceerd op: {new Date(episode.publishDate).toLocaleDateString('nl-NL')}
          </p>
        </div>
        <audio
          controls
          className="w-full"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={episode.audioUrl} type="audio/mpeg" />
          Je browser ondersteunt geen audio element.
        </audio>
      </div>
    </section>
  );
} 