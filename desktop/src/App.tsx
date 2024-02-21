import "./App.css";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/electron-vite.animate.svg";

import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout";
import { WelcomeLayout } from "./components/welcome-layout";
import { NotFound } from "./pages/not-found";

import { Upload } from "./pages/upload";
import { ThemeProvider } from "./components/theme";

function App() {
  // const [count, setCount] = useState(0);

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index  element={<Upload />} />
            <Route path="setupProject" element={<WelcomeLayout />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </>
  );
}

export default App;
