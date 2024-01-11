'use client'
import Toolbar from '@/components/toolbar'
import Image from 'next/image'
import SplitPane, { Pane } from 'split-pane-react';


export default function Home() {

  
  return (
    <main className="flex min-h-screen flex-col">
      <Toolbar />
      
      <div className=''>
        <div>
          Middle section

        </div>
        <div>
          bottom section
        </div>
      </div>
    </main>
  )
}
