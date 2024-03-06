import { Outlet, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ui/theme-toggle";
import { ScrollArea } from "./ui/scroll-area";
import { Toaster } from "./ui/sonner";
import { toast } from "sonner";
import {
  UpdateIcon,
  DoubleArrowRightIcon,
  DoubleArrowLeftIcon,
} from "@radix-ui/react-icons";
import { useState, useMemo, useEffect } from "react";
import { Badge } from "./ui/badge";
import { Status } from "../../electron/mockData/data";
import { motion, AnimatePresence } from "framer-motion";

export function Layout() {
  const location = useLocation();
  const [isDev, setIsDev] = useState(false);
  const [status, setStatus] = useState<Status[]>([]);
  const [showStatus, setShowStatus] = useState(false);
  useMemo(async () => {
    setIsDev(await window.api.getIsDev());
  }, []);
  const updateStatuses = async () => {
    const statuses = await window.api.getServiceStatus();
    setStatus(statuses);
  };
  const toggleService = async (currentStatus: Status) => {
    let promise;
    let message = "";
    if (currentStatus.status === "Online") {
      promise = window.api.shutdownService(currentStatus.name);
      message = `Shutting down ${currentStatus.name}...`;
    } else {
      promise = window.api.launchService(currentStatus.name);
      message = `Launching ${currentStatus.name}...`;
    }
    toast.promise(promise, {
      loading: message,
      success: `Done`,
      error: `${message} failed. Please try again.`,
    });
  };

  useEffect(() => {
    //Implementing the setInterval method
    const interval = setInterval(updateStatuses, 60000);

    //Clearing the interval
    return () => clearInterval(interval);
  }, [status]);
  return (
    <ScrollArea className="h-svh w-svw">
      {/* A "layout route" is a good place to put markup you want to
          share across all the pages on your site, like navigation. */}
      <div className="fixed top-3 left-5 text-xs flex items-center ">
        <AnimatePresence>
          {showStatus && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Badge
                className="mr-4"
                variant={"secondary"}
                onClick={() =>
                  toast.promise(updateStatuses, {
                    loading: `Checking status...`,
                    success: `Done`,
                    error: `Failed to check status. Please try again.`,
                  })
                }
              >
                <UpdateIcon />
              </Badge>

              {status.map((s, index) => (
                <Badge
                  onClick={async () => await toggleService(s)}
                  className="mr-4"
                  key={index}
                  variant={
                    s.status === "Online"
                      ? "cloud"
                      : s.status === "Offline"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {s.name}
                </Badge>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <Badge
          onClick={() => setShowStatus(!showStatus)}
          className="mr-4"
          variant={"secondary"}
        >
          {showStatus ? <DoubleArrowLeftIcon /> : <DoubleArrowRightIcon />}
        </Badge>
      </div>
      {isDev && (
        <code className=" text-center z-50	bg-pink-500/40 p-2 rounded text-pink-700 monospace fixed top-5 right-5 ">
          Path: {location.pathname}
        </code>
      )}
      <ThemeToggle className="z-10  fixed bottom-5 right-5 " />
      <Toaster />
      <div className="px-8 py-4">
        <Outlet />
      </div>
    </ScrollArea>
  );
}
