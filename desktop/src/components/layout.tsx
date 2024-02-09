import { Outlet, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ui/theme-toggle";
import { ScrollArea } from "./ui/scroll-area";
import { Toaster } from "./ui/sonner";
import { useState, useMemo } from "react";

export function Layout() {
  const location = useLocation();
  const [isDev, setIsDev] = useState(false);

  useMemo(async () => {
    setIsDev(await window.api.getIsDev());
  }, []);

  return (
    <ScrollArea className="h-svh w-svw">
      {/* A "layout route" is a good place to put markup you want to
          share across all the pages on your site, like navigation. */}

      {isDev && (
        <code className=" text-center z-50	bg-pink-500/40 p-2 rounded text-pink-700 monospace fixed top-5 right-5 ">
          Path: {location.pathname}
        </code>
      )}
      <ThemeToggle className="z-10  fixed bottom-5 right-5 " />
      <Toaster />
      <Outlet />
    </ScrollArea>
  );
}
