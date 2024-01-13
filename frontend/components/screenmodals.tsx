'use client'
import React from 'react';
import Image from 'next/image';

interface ModalProps {
  isOpen: boolean;
  cancelCallback: ()=>void;
  content: string
}

const LoadingModal: React.FC<ModalProps> = (props) => {
  const {isOpen, cancelCallback, content} = props
  const modalStyle = isOpen ? 'block' : 'hidden';

  return (
    <div className={`fixed inset-0 bg-white bg-opacity-50 h-screen w-screen ${modalStyle}`}>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black p-4 rounded-lg shadow-lg">
        {content}
        <button onClick={cancelCallback} className="absolute top-0 right-0 m-2 p-2">
          Close
        </button>
      </div>
    </div>
  );
};

export default LoadingModal;