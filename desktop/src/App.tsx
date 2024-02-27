import "./App.css";

import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout";
import { SetVisuals } from "./pages/set-visuals";
import { NotFound } from "./pages/not-found";
import { SetTopic } from "./pages/set-topic";
import { ScriptEditor } from "./pages/script-editor";
import { Upload } from "./pages/upload";
import { ThemeProvider } from "./components/theme";
import { VideoGenerator } from "./pages/videogen";
function App() {

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Upload />} />
            <Route path="set-visuals" element={<SetVisuals />} />
            <Route path="set-topic" element={<SetTopic />} />
            <Route path="script-editor" element={<ScriptEditor />} />
            <Route path="get-video" element={<VideoGenerator />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </>
  );
}

export default App;
