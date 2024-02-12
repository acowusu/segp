import "./App.css";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/electron-vite.animate.svg";

import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout";
import { WelcomeLayout } from "./components/welcome-layout";
import { SetVisuals } from "./pages/set-visuals";
import { NotFound } from "./pages/not-found";
import { SetAudience } from "./pages/set-audience";
import { SetTopic } from "./pages/set-topic";
import { SetVoiceover } from "./pages/set-voiceover";
import { ScriptEditor } from "./pages/script-editor";
import { Upload } from "./pages/upload";
import { ThemeProvider } from "./components/theme";
import { Media } from "./pages/mediaFiles";
import { Editor } from "./pages/editor";
import { Button } from "./components/ui/button";
import { Topic } from "../../electron/mockData/data";

function DummyButton() {
  // const topic: Topic = {topic: "topic", summary: "summary"};
  return (<>
  <Button onClick={() => {
      // window.api.setTopic(topic);
      window.api.convertWebmToMp4("in-path", "out-path");

    }
  }> Hello </Button>
  </>)
}

function App() {
  // const [count, setCount] = useState(0);

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Routes>
          <Route path="/" element={<DummyButton />}>
            <Route index element={<Upload />} />
            <Route path="welcome/" element={<WelcomeLayout />}>
              <Route path="set-topic" element={<SetTopic />} />
              <Route path="set-audience" element={<SetAudience />} />
              <Route path="set-voiceover" element={<SetVoiceover />} />
              <Route path="set-visuals" element={<SetVisuals />} />
              <Route path="script-editor" element={<ScriptEditor />} />
              <Route path="media" element={<Media />} />
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
