import api from "./routes";
import { test, expect, expectTypeOf } from "vitest";

test("api should be defined", () => {
  expect(api).toBeDefined();
});

test("api should be an object", () => {
  expectTypeOf( api).toBeObject()
});


