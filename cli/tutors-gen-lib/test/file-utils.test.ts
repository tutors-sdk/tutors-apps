import { assertEquals } from "jsr:@std/assert";
import {
  removeFirstLine,
  findFirstMatchingString,
  findLastMatchingString,
  getFileName,
  getFileType,
  getHeaderFromBody,
  withoutHeaderFromBody,
} from "../src/utils/file-utils.ts";

// --- removeFirstLine ---

Deno.test("removeFirstLine removes the first line", () => {
  assertEquals(removeFirstLine("first\nsecond\nthird"), "second\nthird");
});

Deno.test("removeFirstLine returns empty for single line", () => {
  assertEquals(removeFirstLine("only"), "");
});

Deno.test("removeFirstLine handles empty string", () => {
  assertEquals(removeFirstLine(""), "");
});

// --- getFileName ---

Deno.test("getFileName extracts filename from path", () => {
  assertEquals(getFileName("/home/user/file.txt"), "file.txt");
});

Deno.test("getFileName extracts filename from windows path", () => {
  assertEquals(getFileName("C:\\Users\\test\\file.txt"), "file.txt");
});

Deno.test("getFileName returns filename when no path", () => {
  assertEquals(getFileName("file.txt"), "file.txt");
});

// --- getFileType ---

Deno.test("getFileType returns extension", () => {
  assertEquals(getFileType("file.txt"), "txt");
});

Deno.test("getFileType returns last extension for multiple dots", () => {
  assertEquals(getFileType("file.test.ts"), "ts");
});

Deno.test("getFileType returns empty for no extension", () => {
  assertEquals(getFileType("Makefile"), "");
});

// --- getHeaderFromBody ---

Deno.test("getHeaderFromBody extracts markdown header", () => {
  assertEquals(getHeaderFromBody("# My Title\nSome content"), " My Title");
});

Deno.test("getHeaderFromBody returns first line when no hash", () => {
  assertEquals(getHeaderFromBody("Plain Title\nContent here"), "Plain Title");
});

// --- withoutHeaderFromBody ---

Deno.test("withoutHeaderFromBody returns content after header", () => {
  const body = "# Title\n\nThis is the summary\nMore content";
  const result = withoutHeaderFromBody(body);
  assertEquals(result, "This is the summary");
});

Deno.test("withoutHeaderFromBody trims whitespace around header", () => {
  const body = "# Title\n\nSummary line\nMore content";
  const result = withoutHeaderFromBody(body);
  assertEquals(result, "Summary line");
});

// --- findFirstMatchingString ---

Deno.test("findFirstMatchingString finds matching type", () => {
  const types = ["/topic", "/talk", "/lab"];
  assertEquals(findFirstMatchingString(types, "/root/talk-01", "/root"), "talk");
});

Deno.test("findFirstMatchingString returns unknown for no match", () => {
  const types = ["/topic", "/talk"];
  assertEquals(findFirstMatchingString(types, "/root/something", "/root"), "unknown");
});

Deno.test("findFirstMatchingString returns unknown for nested topic", () => {
  const types = ["/topic", "/talk"];
  assertEquals(findFirstMatchingString(types, "/root/topic/sub/path", "/root"), "unknown");
});

// --- findLastMatchingString ---

Deno.test("findLastMatchingString finds last matching segment", () => {
  const types = ["/topic", "/talk", "/lab"];
  assertEquals(findLastMatchingString(types, "/root/topic-01/lab-01", "/root"), "lab");
});

Deno.test("findLastMatchingString returns unknown for no match", () => {
  const types = ["/topic", "/talk"];
  assertEquals(findLastMatchingString(types, "/root/something/other", "/root"), "unknown");
});
