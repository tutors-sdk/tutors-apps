import { assertEquals } from "jsr:@std/assert";
import {
  isCompositeLo,
  simpleTypes,
  loCompositeTypes,
  loTypes,
  preOrder,
} from "../src/types/type-utils.ts";
import type { Lo } from "../src/types/learning-objects.ts";

function makeLo(type: string): Lo {
  return {
    type,
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
  } as Lo;
}

Deno.test("isCompositeLo returns true for composite types", () => {
  for (const type of ["unit", "side", "topic", "course"]) {
    assertEquals(isCompositeLo(makeLo(type)), true, `${type} should be composite`);
  }
});

Deno.test("isCompositeLo returns false for simple types", () => {
  for (const type of ["lab", "talk", "note", "web", "archive", "github", "panelnote", "paneltalk", "panelvideo", "podcast", "tutorial", "book", "notebook"]) {
    assertEquals(isCompositeLo(makeLo(type)), false, `${type} should not be composite`);
  }
});

Deno.test("simpleTypes contains expected types", () => {
  const expected = ["note", "archive", "web", "github", "panelnote", "paneltalk", "panelvideo", "podcast", "talk", "book", "lab", "tutorial", "notebook"];
  assertEquals(simpleTypes.length, expected.length);
  for (const t of expected) {
    assertEquals(simpleTypes.includes(t), true, `simpleTypes should include ${t}`);
  }
});

Deno.test("loCompositeTypes contains unit, side, topic, course", () => {
  assertEquals(loCompositeTypes, ["unit", "side", "topic", "course"]);
});

Deno.test("loTypes is simpleTypes + loCompositeTypes", () => {
  assertEquals(loTypes.length, simpleTypes.length + loCompositeTypes.length);
  for (const t of simpleTypes) {
    assertEquals(loTypes.includes(t), true, `loTypes should include simple type ${t}`);
  }
  for (const t of loCompositeTypes) {
    assertEquals(loTypes.includes(t), true, `loTypes should include composite type ${t}`);
  }
});

Deno.test("preOrder map covers all loTypes", () => {
  for (const t of loTypes) {
    assertEquals(preOrder.has(t), true, `preOrder should have entry for ${t}`);
  }
});

Deno.test("preOrder values are sequential from 0", () => {
  const values = Array.from(preOrder.values()).sort((a, b) => a - b);
  for (let i = 0; i < values.length; i++) {
    assertEquals(values[i], i, `preOrder value at index ${i} should be ${i}`);
  }
});
