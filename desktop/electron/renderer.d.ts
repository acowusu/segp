

import { IAPI } from "./routes";


declare global {
  interface Window {
    api: IAPI,
  }
}