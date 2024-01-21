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

const sidebarNavItems = [
  {
    title: "Topic",
    href: "/welcome/set-topic",
  },
  {
    title: "Audience",
    href: "/welcome/set-audience",
  },
  {
    title: "Voiceover",
    href: "/welcome/set-voiceover",
  },
  {
    title: "Visuals",
    href: "/welcome/set-visuals",
  },
];

export function WelcomeLayout() {
  return (
    <>

      <div className=" space-y-6 p-10 pb-16 md:block">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and set e-mail preferences.
          </p>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex-1 lg:max-w-2xl">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}