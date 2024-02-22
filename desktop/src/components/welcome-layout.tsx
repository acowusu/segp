// import {  Outlet } from "react-router-dom";
// import { useLocation } from 'react-router-dom';

// {/* <Link to="/">Home</Link> */}

// export function WelcomeLayout() {
//   const location = useLocation();

//   return (
//     <div>
//       {/* A "layout route" is a good place to put markup you want to
//           share across all the pages on your site, like navigation. */}

//       <code className=" text-center	 text-pink-700 monospace">{location.pathname}</code>

//       {/* An <Outlet> renders whatever child route is currently active,
//           so you can think about this <Outlet> as a placeholder for
//           the child routes we defined above. */}
//       <Outlet />
//     </div>
//   );
// }

import { Outlet } from "react-router-dom";

import { Separator } from "../components/ui/separator";
import { SidebarNav } from "../components/ui/sidebar-nav";
import { useEffect, useState } from "react";

const sidebarNavItems = [
  {
    title: "Visuals",
    href: "/welcome/set-visuals",
  },
  {
    title: "Topic",
    href: "/welcome/set-topic",
  },
  {
    title: "Script",
    href: "/welcome/script-editor",
  },

];

export function WelcomeLayout() {
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    const fetchProjectName = async () => {
      try {
        const projectName = await window.api.getProjectName();
        setProjectName(projectName);
      } catch (error) {
        console.error("Failed to fetch project name:", error);
      }
    };

    fetchProjectName();
  }, []);
  return (
    <>
      <div className=" space-y-6 p-10 pb-16 md:block">
        <Outlet />
      </div>
    </>
  );
}