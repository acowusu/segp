import { copyFile, writeFile } from "node:fs/promises";
import { sep } from "path";
// import { closeDatabase, getDatabase } from "./database";
import { dialog } from "electron";
import { BrowserWindow } from "electron";
import { win } from "./main";
import { mkdir } from "node:fs/promises";
import { userStore, createProjectStore, getProjectStore } from "./store";
import { extractTextFromPDF } from "./reportProcessing";
import { getProjectPath, getReportPath } from "./metadata";
// This file is responsible for new project flow and open project flow

export async function createProject(
  name: string,
  projectPath: string,
  reportPath: string
): Promise<void> {
  const projectDir = `${projectPath}${sep}${name}`;
  console.log(projectDir);
  await mkdir(projectDir);
  await copyFile(reportPath, `${projectPath}${sep}${name}${sep}report.pdf`);
  // createProjectStore(projectDir);
  // userStore.set("lastProject", projectDir);
  await openProject(projectDir);
  const projectStore = getProjectStore();
  // closeDatabase();
  // getDatabase(`${projectDir}${sep}project.db`);
  projectStore.set("name", name);
  projectStore.set("path", projectDir);
  projectStore.set("reportPath", `${projectDir}${sep}report.pdf`);
  // projectStore.set("databasePath", `${projectDir}${sep}project.db`);
}

export async function openProject(projectPath: string): Promise<void> {
  // closeDatabase();
  createProjectStore(projectPath);
  userStore.set("lastProject", projectPath);
  if(!userStore.has("recentProjects")) {
    userStore.set("recentProjects", [projectPath]);
  } else {
    const recentProjects = userStore.get("recentProjects") as string[];
    if(!recentProjects.includes(projectPath)) {
      recentProjects.push(projectPath);
      if (recentProjects.length > 5) {
        recentProjects.shift();
      }
      userStore.set("recentProjects", recentProjects);
    }
  }
  // getDatabase(`${projectPath}${sep}project.db`);
}

export async function getDirectory(): Promise<string> {
  const { canceled, filePaths } = await dialog.showOpenDialog(win!, {
    properties: ["openDirectory"],
  });
  let path = "";
  if (!canceled) {
    path = filePaths[0];
  }
  return path;
}

export async function getFile(): Promise<string> {
  const { canceled, filePaths } = await dialog.showOpenDialog(
    win as BrowserWindow
  );
  let path = "";
  if (!canceled) {
    path = filePaths[0];
  }
  console.log("GOT PATH", path);
  return path;
}

export async function loadReport(): Promise<void> {
  const report = getReportPath();
  const text = await extractTextFromPDF(report);
  const reportTextPath = `${getProjectPath()}${sep}report.txt`;
  await writeFile(reportTextPath, text);
}
