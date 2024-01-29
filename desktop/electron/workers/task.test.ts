import { Task } from "./task";
import { test, expect } from "vitest";

test("Task should resolve when finish is called", async () => {
  const task = new Task();
  const donePromise = task.done;

  task.finish();

  await expect(donePromise).resolves.toBeUndefined();
});

test("Task should reject when fail is called", async () => {
  const task = new Task();
  const donePromise = task.done;

  task.fail();

  await expect(donePromise).rejects.toBeUndefined();
});
