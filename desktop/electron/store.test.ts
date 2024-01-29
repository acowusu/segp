import os from "os";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createProjectStore,
  getProjectStore,
  projectStore,
  userStore,
} from "./store";

describe("store", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should throw an error if project store is not created", () => {
    expect(getProjectStore).toThrowError("Project store not created");
  });

  it("should create a project store", () => {
    const projectPath = os.tmpdir();
    createProjectStore(projectPath);
    expect(getProjectStore()).toBeDefined();
  });

  it("should return the project store", () => {
    const projectPath = os.tmpdir();
    createProjectStore(projectPath);
    const store = getProjectStore();
    expect(store).toBe(projectStore);
  });

  it("should return the user store", () => {
    const store = userStore;
    expect(store).toBeDefined();
  });
});
