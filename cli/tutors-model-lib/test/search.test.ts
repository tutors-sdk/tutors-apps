import { assertEquals } from "jsr:@std/assert";
import { searchHits, extractPath, isValid } from "../src/services/search.ts";
import type { Lo } from "../src/types/learning-objects.ts";

function makeLo(overrides: Partial<Lo> = {}): Lo {
  return {
    type: "note",
    id: "test",
    title: "Test",
    summary: "",
    contentMd: "",
    frontMatter: {},
    route: "/test",
    authLevel: 0,
    img: "",
    imgFile: "",
    video: "",
    videoids: { videoid: "", videoIds: [] },
    hide: false,
    ...overrides,
  } as Lo;
}

// --- isValid ---

Deno.test("isValid returns true for non-empty string", () => {
  assertEquals(isValid("hello"), true);
});

Deno.test("isValid returns false for whitespace-only string", () => {
  assertEquals(isValid("   "), false);
});

Deno.test("isValid returns false for empty string", () => {
  assertEquals(isValid(""), false);
});

Deno.test("isValid returns true for string with mixed content", () => {
  assertEquals(isValid("  hello  "), true);
});

// --- extractPath ---

Deno.test("extractPath inserts / after #", () => {
  const input = '<a href="#lab/topic-01/lab-01">Lab 01</a>';
  const result = extractPath(input);
  assertEquals(result.startsWith("#/"), true);
});

Deno.test("extractPath extracts path from href", () => {
  const input = '<a href="#lab/topic-01/lab-01">Lab 01</a>';
  const result = extractPath(input);
  assertEquals(result, "#/lab/topic-01/lab-01");
});

// --- searchHits ---

Deno.test("searchHits returns empty for no matches", () => {
  const los = [makeLo({ contentMd: "hello world\nfoo bar" })];
  const results = searchHits(los, "zzzzz");
  assertEquals(results.length, 0);
});

Deno.test("searchHits finds term in contentMd", () => {
  const los = [makeLo({ contentMd: "hello world\nfoo bar\nbaz qux", route: "/test", parentLo: makeLo({ title: "Parent" }) })];
  const results = searchHits(los, "foo");
  assertEquals(results.length > 0, true);
  assertEquals(results[0].contentMd.includes("foo"), true);
});

Deno.test("searchHits finds multiple occurrences", () => {
  const los = [makeLo({
    contentMd: "apple banana\napple cherry\norange apple",
    route: "/test",
    parentLo: makeLo({ title: "Parent" }),
  })];
  const results = searchHits(los, "apple");
  assertEquals(results.length, 3);
});

Deno.test("searchHits respects max 100 hits limit", () => {
  const lines = Array.from({ length: 150 }, (_, i) => `match${i} target`).join("\n");
  const los = [makeLo({ contentMd: lines, route: "/test", parentLo: makeLo({ title: "P" }) })];
  const results = searchHits(los, "target");
  assertEquals(results.length <= 100, true);
});

Deno.test("searchHits skips Los without contentMd", () => {
  const los = [makeLo({ contentMd: "" })];
  const results = searchHits(los, "anything");
  assertEquals(results.length, 0);
});

Deno.test("searchHits detects fenced code blocks", () => {
  const content = "some text\n```javascript\nconst x = searchterm;\n```\nmore text";
  const los = [makeLo({ contentMd: content, route: "/test", parentLo: makeLo({ title: "P" }) })];
  const results = searchHits(los, "searchterm");
  assertEquals(results.length > 0, true);
  assertEquals(results[0].fenced, true);
  assertEquals(results[0].language, "javascript");
});

Deno.test("searchHits marks unfenced content", () => {
  const content = "some plain text with keyword here\nno fences at all";
  const los = [makeLo({ contentMd: content, route: "/test", parentLo: makeLo({ title: "P" }) })];
  const results = searchHits(los, "keyword");
  assertEquals(results.length > 0, true);
  assertEquals(results[0].fenced, false);
});
