import React from 'react';

export const About: React.FC = () => {
  return (
    <div className="bg-gray-200 min-h-screen">
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800">Welcome to My Website</h1>
        <p className="text-gray-600 mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc id aliquam lacinia, nunc nunc lacinia nunc, id aliquam nunc nunc id nunc. Sed id aliquam nunc, id aliquam nunc.</p>
      </main>
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4">
          <p className="text-center">© 2022 My Website. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};


