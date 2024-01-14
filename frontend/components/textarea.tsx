import React, { useState } from 'react';

function TextArea({placeholder, content, setContents}: {placeholder: string, content: string, setContents: (contents: string)=>void}) {

  const handleChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    // Update the state variable with the new value when the user types
    console.log(event.target.value.toString())
    setContents(event.target.value.toString());
  };

  return (
    <textarea
      className='bg-inherit w-full h-full overflow-auto no-scrollbar focus:border-none focus:outline-none'
      value={content}
      onChange={handleChange}
      placeholder={placeholder}
      style={{ resize: 'none' }}
    />
  );
}

export default TextArea;
