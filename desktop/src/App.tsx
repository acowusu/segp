import "./App.css";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/electron-vite.animate.svg";

import { Route, Routes } from "react-router-dom";
// import { Layout } from "./components/layout";
import { WelcomeLayout } from "./components/welcome-layout";
import { SetVisuals } from "./pages/set-visuals";
import { NotFound } from "./pages/not-found";
import { SetTopic } from "./pages/set-topic";
import { ScriptEditor } from "./pages/script-editor";
import { Upload } from "./pages/upload";
import { ThemeProvider } from "./components/theme";
import { Media } from "./pages/mediaFiles";
import { Editor } from "./pages/editor";
import { LLMDebugger } from "./pages/llm-debugger";
function App() {
  // const [count, setCount] = useState(0);

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Upload />} />
            <Route path="welcome/" element={<WelcomeLayout />}>
              <Route path="set-topic" element={<SetTopic />} />
              <Route path="set-visuals" element={<SetVisuals />} />
              <Route path="script-editor" element={<ScriptEditor />} />
              <Route path="media" element={<Media />} />
              <Route path="debug" element={<LLMDebugger />} />
              <Route path="video-editor" element={<Editor />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </>
  );
}

export default App;
