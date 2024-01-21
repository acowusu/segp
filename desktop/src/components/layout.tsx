import { Outlet, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ui/theme-toggle";
import { ScrollArea } from "./ui/scroll-area"

{
  /* <Link to="/">Home</Link> */
}

export function Layout() {
  const location = useLocation();

  return (
    <ScrollArea className="h-svh w-svw" >
      {/* A "layout route" is a good place to put markup you want to
          share across all the pages on your site, like navigation. */}

      <code className=" text-center z-50	bg-pink-500/40 p-2 rounded text-pink-700 monospace fixed top-5 right-5 ">
        Path: {location.pathname} 
      </code>
      <ThemeToggle className="  fixed bottom-5 right-5 " />

      {/* An <Outlet> renders whatever child route is currently active,
          so you can think about this <Outlet> as a placeholder for
          the child routes we defined above. */}
      <Outlet />
    </ScrollArea>
  );
}
