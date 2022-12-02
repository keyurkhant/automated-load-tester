import { test, expect, Page } from "@playwright/test";
import { generateEntry } from "../src/utils/jsonGenerator";
import { writeFile } from "fs";

test.describe("assas", () => {
  test("aa", () => {
    writeFile('sample.json', JSON.stringify(generateEntry(10, 30000)), (err) => {
        if(err) {
            return err
        }
    })
  });
});
