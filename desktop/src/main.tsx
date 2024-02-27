// import React from 'react'
import ReactDOM from 'react-dom/client'
import { MemoryRouter } from "react-router-dom";
import { Promisified } from './promisify.ts'
import App from './App.tsx'
import { IAPI } from '../electron/routes.ts';

// import './index.css'

window.api =  new Proxy<Promisified<IAPI>>({} as Promisified<IAPI>, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: (_, property) => (...args: any[]) => window.ipcRenderer.invoke("api:generic", { property, args }) as Promisified<any>
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
    <MemoryRouter>
      <App />
    </MemoryRouter>
  // </React.StrictMode>,
)

// Remove Preload scripts loading
postMessage({ payload: 'removeLoading' }, '*')

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})
