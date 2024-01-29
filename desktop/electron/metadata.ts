import { userStore, getProjectStore } from "./store";
import { sep } from "path";

export function getProjectName(): string {
  return getProjectStore().get("name") as string;
}

export function getProjectPath(): string {
  return getProjectStore().get("path") as string;
}

export function getReportPath(): string {
  return getProjectStore().get("reportPath") as string;
}

export function getDatabasePath(): string {
  return getProjectStore().get("databasePath") as string;
}

export function getLastProject(): string {
  return userStore.get("lastProject") as string;
}

export function getTextReportPath(): string {
  return `${getProjectPath()}${sep}report.txt`;
}
