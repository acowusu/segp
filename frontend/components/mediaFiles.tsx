'use client'
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const MediaFiles: React.FC = () => {

  const [photos, setPhotos] = useState([])

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch(
          'https://api.unsplash.com/photos/random?count=10&client_id=rlmP_s20oV0tzBO_AJk8lpZXQJluujDLu_OSDAR-aDA'
        );

        if (response.ok) {
          const data = await response.json();
          setPhotos(data);
        } else {
          console.error('Failed to fetch photos');
        }
      } catch (error) {
        console.error('Error fetching photos:', error);
      }
    };

    fetchPhotos();
  }, []);

  const MediaElement = ({ photo }) => {
    return (
      <div className='border border-black rounded-lg h-32 transform transition duration-700 ease-in-out hover:scale-105 cursor-pointer flex flex-col items-center justify-between p-2'>
        <img src={photo.urls.small} alt={photo.alt_description || 'Image'} className='w-full h-full object-cover' />
        {/* <p>{photo.description}</p> */}
      </div>
    );
  };
  return (
    <div className="border border-black w-full h-full flex flex-col ">
      <h1 className='font-bold text-2xl p-2 border-black'>Media Files</h1>
      <div className='grid grid-cols-3 gap-4 overflow-auto no-scrollbar p-2 border-t-2 border-black'>
        {photos.map((photo, index) => (
          <MediaElement key={index} photo={photo} />
        ))}
      </div>
    </div>
  );
};

export default MediaFiles;