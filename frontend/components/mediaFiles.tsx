'use client'
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const MediaFiles: React.FC = () => {

  // array of promts for images to generate/look-up
  const searchTerms = ['AI', 'Neural Network', 'Layers', 'Connected', 'Line Graph', 'Future'];
  const [selectedTerm, setSelectedTerm] = useState(searchTerms[0]);
  const [termPhotos, setTermPhotos] = useState<{ [key: string]: any[] }>({});
  const [photos, setPhotos] = useState([]);

  const getPhotos = async () => {
    try {
      // get 10 photos for each search term
      const termPhotoMap = searchTerms.map(async (term) => {
        const response = await fetch(
          `https://api.unsplash.com/photos/random?query=${term}&count=10&client_id=uojJeEAyDSw-BFUiVGM8H6Nh4xxfaOusbBUHnOLev5Y`
        );

        if (response.ok) {
          const data = await response.json();
          return { term, photos: data };
        } else {
          console.error(`Failed to fetch photos for term "${term}"`);
          return null;
        }
      });

      const resolvedTermPhotos = await Promise.all(termPhotoMap);
      const termPhotosMap: { [key: string]: any[] } = {};

      resolvedTermPhotos.forEach(({ term, photos }) => {
        termPhotosMap[term] = photos;
      });

      setTermPhotos(termPhotosMap);
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const handleTermChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTerm(e.target.value);
    setPhotos(termPhotos[e.target.value]);
  };

  useEffect(() => {
    getPhotos();
  }, []);

  const MediaElement = ({ photo }) => {
    return (
      <div className='border border-black rounded-lg h-32 transform transition duration-700 ease-in-out hover:scale-105 cursor-pointer flex flex-col items-center justify-between p-2'>
        <img src={photo.urls.small} alt={photo.alt_description || 'Image'} className='w-full h-full object-cover' />
      </div>
    );
  };

  return (
    <div className="border border-black w-full h-full flex flex-col ">
      <h1 className='font-bold text-2xl p-2 border-black'>Media Files</h1>
      <div className='flex p-2'>
        <label htmlFor='termDropdown' className='mr-2'>Select Term:</label>
        <select id='termDropdown' onChange={handleTermChange} value={selectedTerm} style={{color: 'black'}}>
          {searchTerms.map((term, index) => (
            <option key={index} value={term}>{term}</option>
          ))}
        </select>
      </div>
      <div className='grid grid-cols-3 gap-4 overflow-auto no-scrollbar p-2 border-t-2 border-black'>
        {photos.map((photo, index) => (
          <MediaElement key={index} photo={photo} />
        ))}
      </div>
    </div>
  );
};

export default MediaFiles;