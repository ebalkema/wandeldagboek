'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function PhotoUpload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const router = useRouter();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setSelectedFiles(files);

      // Maak previews
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append(`photo-${index}`, file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        throw new Error('Upload mislukt');
      }
    } catch (error) {
      console.error('Upload fout:', error);
      alert('Er ging iets mis bij het uploaden van de foto\'s');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Voeg foto's toe aan je waarneming</h1>
      
      <div className="bg-white shadow-lg rounded-lg p-6">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="mb-4"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square">
              <Image
                src={preview}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleUpload}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
            disabled={selectedFiles.length === 0}
          >
            Upload Foto's
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
          >
            Overslaan
          </button>
        </div>
      </div>
    </div>
  );
} 