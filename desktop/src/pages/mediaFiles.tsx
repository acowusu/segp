import React, { useEffect, useState } from 'react';
import { createClient, Video } from 'pexels';

const pexelsApiKey = 'J4nKc6oJDyKJeRJTlC0x5EiQQDZkTuvAyJ1uXt6gC98IGwDleAYqI0RR';
const unsplashAccessKey = 'rlmP_s20oV0tzBO_AJk8lpZXQJluujDLu_OSDAR-aDA';
const queries = ['AI', 'Neural Network', 'Connected', 'City', 'Future'];

export const Media: React.FC = () => {
  const [selectedQuery, setSelectedQuery] = useState<string>(queries[0]);
  const [media, setMedia] = useState<(Video | string)[]>([]);

  useEffect(() => {
    const fetchMedia = async () => {
      const pexelsClient = createClient(pexelsApiKey);

      // Fetch Pexels videos
      const pexelsResponse = await pexelsClient.videos.search({ query: selectedQuery, orientation: 'landscape', per_page: 5 });

      // Fetch Unsplash photos
      const unsplashEndpoint = `https://api.unsplash.com/search/photos?page=1&query=${selectedQuery}&client_id=${unsplashAccessKey}`;
      const unsplashResponse = await fetch(unsplashEndpoint);
      const unsplashData = await unsplashResponse.json();

      const unsplashPhotos = unsplashData.results.map((photo: any) => photo.urls.regular);

      // Combine Pexels videos and Unsplash photos
      setMedia([...pexelsResponse.videos, ...unsplashPhotos]);
    };

    fetchMedia();
  }, [selectedQuery]);

  // Dropdown control
  const handleQueryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedQuery(event.target.value);
  };

  const MediaElement: React.FC<{ media: Video | string }> = ({ media }) => {
    return (
      <div
        className='h-32 transform transition duration-700 ease-in-out hover:scale-105 cursor-pointer flex flex-col items-center justify-between p-2'
      >
        {typeof media === 'string' ? (
          <img
            src={media}
            alt="Unsplash Photo"
            className="h-full w-full object-cover object-center mb-2"
            style={{ maxHeight: '100%', maxWidth: '100%' }}
          />
        ) : (
          <video
            width="100%"
            height="auto"
            controls
            style={{ display: 'block', margin: '0 auto', maxHeight: '100%', maxWidth: '100%' }}
          >
            <source src={media.video_files[0].link} type="video/mp4" />
          </video>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h1 className='font-bold text-2xl p-2'>Media Files</h1>
      <div>
        <label htmlFor="querySelector">Select a category: </label>
        <select id="querySelector" value={selectedQuery} onChange={handleQueryChange} style={{ color: 'black' }}>
          {queries.map(query => (
            <option key={query} value={query}>
              {query}
            </option>
          ))}
        </select>
      </div>
      <div className='grid grid-cols-3 gap-4 overflow-auto no-scrollbar p-2 '>
        {media.map((item, index) => (
          <MediaElement key={index} media={item} />
        ))}
      </div>
    </div>
  );
};