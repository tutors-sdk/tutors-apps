import { assertEquals } from "jsr:@std/assert";
import { getRoute, getId, removeLeadingHashes } from "../src/utils/lr-utils.ts";
import type { LearningResource } from "../src/types/types.ts";

function makeLr(overrides: Partial<LearningResource> = {}): LearningResource {
  return {
    type: "note",
    id: "test-note",
    route: "/root/topic-01/note-01",
    courseRoot: "/root",
    files: [],
    lrs: [],
    ...overrides,
  } as LearningResource;
}

// --- getRoute ---

Deno.test("getRoute builds route with COURSEURL placeholder", () => {
  const lr = makeLr({ type: "note", route: "/root/topic-01/note-01", courseRoot: "/root" });
  const result = getRoute(lr);
  assertEquals(result, "/note/{{COURSEURL}}/topic-01/note-01");
});

Deno.test("getRoute strips courseRoot from path", () => {
  const lr = makeLr({ type: "lab", route: "/my-course/topic-01/lab-01", courseRoot: "/my-course" });
  const result = getRoute(lr);
  assertEquals(result.includes("/my-course"), false);
  assertEquals(result.startsWith("/lab/{{COURSEURL}}"), true);
});

// --- getId ---

Deno.test("getId returns basename of route", () => {
  const lr = makeLr({ route: "/root/topic-01/note-01" });
  assertEquals(getId(lr), "note-01");
});

Deno.test("getId handles route with single segment", () => {
  const lr = makeLr({ route: "/course" });
  assertEquals(getId(lr), "course");
});

// --- removeLeadingHashes ---

Deno.test("removeLeadingHashes with no hashes returns original", () => {
  assertEquals(removeLeadingHashes("hello"), "hello");
});

Deno.test("removeLeadingHashes removes single hash", () => {
  assertEquals(removeLeadingHashes("#title"), "title");
});

Deno.test("removeLeadingHashes removes multiple hashes", () => {
  assertEquals(removeLeadingHashes("###heading"), "heading");
});
