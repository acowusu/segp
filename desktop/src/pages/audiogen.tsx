import React, { useState } from 'react';
import { ScriptData } from '../../electron/mockData/data';
import { Progress } from '../components/ui/progress';


// AudioGenerator passes an array of a script and returns an array of AudioInfo

export const AudioGenerator: React.FC = () => {


  return (
    <div>
     <Progress value={33} />

    </div>
  );
};
