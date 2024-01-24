import React, { createContext } from "react";
import { MediaStore } from "./mediaStore";

export const MediaStoreContext = createContext(new MediaStore());

export function MediaStoreProvider(props: { children: React.ReactNode }) {
  const [store] = React.useState(new MediaStore());
  return (
    <MediaStoreContext.Provider value={store}>
      {props.children}
    </MediaStoreContext.Provider>
  );
}