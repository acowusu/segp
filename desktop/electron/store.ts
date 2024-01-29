import Store from "electron-store";

export const userStore = new Store();

export let projectStore: Store | undefined;

export const createProjectStore = (projectPath: string) => {
  projectStore = new Store({
    name: "metadata",
    cwd: projectPath,
  });
};

export const getProjectStore = () => {
  if (!projectStore) {
    throw new Error("Project store not created");
  }
  return projectStore as Store;
};

// interface UserStore {
//   lastProject: string;
// }

// interface ProjectStore {
//   name: string;
//   cwd: string;
//   reportPath: string;
//   databasePath: string;
// }
