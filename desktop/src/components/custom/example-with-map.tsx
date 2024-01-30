import React, { useState } from 'react';
import { Button } from '../ui/button';
export const ExampleWithMap: React.FC = () => {
    const [files, setFiles] = useState<Map<string, string>>(new Map());

    // Add a file to the map
    const addFile = (name: string, content: string) => {
        const newFiles = new Map(files);
        newFiles.set(name, content);
        setFiles(newFiles);
    };

    // Remove a file from the map
    const removeFile = (name: string) => {
        const newFiles = new Map(files);
        newFiles.delete(name);
        setFiles(newFiles);
    };

    return (
        <div>
            <h1>Example with Map</h1>
            <Button onClick={() => addFile('file1', 'File 1 content')}>Add File 1</Button>
            <Button onClick={() => addFile('file2', 'File 2 content')}>Add File 2</Button>
            <Button onClick={() => removeFile('file1')}>Remove File 1</Button>
            <Button onClick={() => removeFile('file2')}>Remove File 2</Button>
            <ul>
                {Array.from(files.entries()).map(([name, content]) => (
                    <li key={name}>
                        <strong>{name}:</strong> {content}
                    </li>
                ))}
            </ul>
        </div>
    );
};

