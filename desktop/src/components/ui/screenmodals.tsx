'use client'
import React from 'react';

interface ModalProps {
  modalVisible: boolean;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = (props) => {
  const {modalVisible, children} = props
  return (
    <div>
        {modalVisible &&
            <div className="bg-black bg-opacity-60 w-screen h-screen z-[300] fixed top-0 flex flex-col items-center justify-center">
                <div className="bg-background rounded-lg w-3/5 h-4/5 p-6 overflow-auto">
                    {children}
                </div>
            </div>
        }
    </div>
)
};

export default Modal;