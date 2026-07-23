import { assertEquals, assertExists } from "jsr:@std/assert";
import {
  flattenLos,
  filterByType,
  removeLeadingHashes,
  sortLos,
  injectCourseUrl,
  removeUnknownLos,
  allVideoLos,
  getPanels,
  getUnits,
  crumbs,
  loadIcon,
  fixRoutePaths,
} from "../src/utils/lo-utils.ts";
import type { Lo, Composite } from "../src/types/learning-objects.ts";

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

function makeCompositeLo(type: string, los: Lo[]): Composite {
  return {
    ...makeLo({ type }),
    los,
    toc: [],
    panels: { panelVideos: [], panelTalks: [], panelNotes: [], panelPodcasts: [] },
    units: { units: [], sides: [], standardLos: [] },
  } as unknown as Composite;
}

// --- flattenLos ---

Deno.test("flattenLos returns empty for empty array", () => {
  assertEquals(flattenLos([]), []);
});

Deno.test("flattenLos returns same array for flat list", () => {
  const los = [makeLo({ id: "a" }), makeLo({ id: "b" })];
  const result = flattenLos(los);
  assertEquals(result.length, 2);
  assertEquals(result[0].id, "a");
  assertEquals(result[1].id, "b");
});

Deno.test("flattenLos flattens nested composite Los", () => {
  const child1 = makeLo({ id: "child1", type: "note" });
  const child2 = makeLo({ id: "child2", type: "lab" });
  const parent = makeCompositeLo("topic", [child1, child2]);
  parent.id = "parent";

  const result = flattenLos([parent]);
  assertEquals(result.length, 3);
  assertEquals(result[0].id, "parent");
  assertEquals(result[1].id, "child1");
  assertEquals(result[2].id, "child2");
});

Deno.test("flattenLos handles deeply nested structures", () => {
  const leaf = makeLo({ id: "leaf", type: "note" });
  const inner = makeCompositeLo("unit", [leaf]);
  inner.id = "inner";
  const outer = makeCompositeLo("topic", [inner as unknown as Lo]);
  outer.id = "outer";

  const result = flattenLos([outer]);
  assertEquals(result.length, 3);
  assertEquals(result[0].id, "outer");
  assertEquals(result[1].id, "inner");
  assertEquals(result[2].id, "leaf");
});

// --- filterByType ---

Deno.test("filterByType returns matching Los", () => {
  const los = [
    makeLo({ id: "a", type: "note" }),
    makeLo({ id: "b", type: "lab" }),
    makeLo({ id: "c", type: "note" }),
  ];
  const result = filterByType(los, "note");
  assertEquals(result.length, 2);
  assertEquals(result[0].id, "a");
  assertEquals(result[1].id, "c");
});

Deno.test("filterByType returns empty for no matches", () => {
  const los = [makeLo({ type: "note" }), makeLo({ type: "lab" })];
  assertEquals(filterByType(los, "talk").length, 0);
});

Deno.test("filterByType finds nested Los by type", () => {
  const nested = makeLo({ id: "nested-lab", type: "lab" });
  const parent = makeCompositeLo("topic", [nested]);
  parent.id = "topic";

  const result = filterByType([parent], "lab");
  assertEquals(result.length, 1);
  assertEquals(result[0].id, "nested-lab");
});

// --- removeLeadingHashes ---

Deno.test("removeLeadingHashes with no hashes returns original", () => {
  assertEquals(removeLeadingHashes("hello"), "hello");
});

Deno.test("removeLeadingHashes removes single hash prefix", () => {
  assertEquals(removeLeadingHashes("#title"), "title");
});

Deno.test("removeLeadingHashes removes multiple hash prefixes", () => {
  assertEquals(removeLeadingHashes("###title"), "title");
});

Deno.test("removeLeadingHashes handles hash in middle", () => {
  assertEquals(removeLeadingHashes("foo#bar"), "bar");
});

// --- sortLos ---

Deno.test("sortLos places ordered items before unordered", () => {
  const los = [
    makeLo({ id: "unordered", frontMatter: {} }),
    makeLo({ id: "ordered2", frontMatter: { order: 2 } as any }),
    makeLo({ id: "ordered1", frontMatter: { order: 1 } as any }),
  ];
  const result = sortLos(los);
  assertEquals(result[0].id, "ordered1");
  assertEquals(result[1].id, "ordered2");
  assertEquals(result[2].id, "unordered");
});

Deno.test("sortLos returns unordered items in original order", () => {
  const los = [
    makeLo({ id: "a" }),
    makeLo({ id: "b" }),
    makeLo({ id: "c" }),
  ];
  const result = sortLos(los);
  assertEquals(result[0].id, "a");
  assertEquals(result[1].id, "b");
  assertEquals(result[2].id, "c");
});

// --- removeUnknownLos ---

Deno.test("removeUnknownLos removes unknown type", () => {
  const los = [
    makeLo({ id: "a", type: "note" }),
    makeLo({ id: "b", type: "unknown" }),
    makeLo({ id: "c", type: "lab" }),
  ];
  removeUnknownLos(los);
  assertEquals(los.length, 2);
  assertEquals(los[0].id, "a");
  assertEquals(los[1].id, "c");
});

Deno.test("removeUnknownLos leaves array unchanged if no unknowns", () => {
  const los = [makeLo({ type: "note" }), makeLo({ type: "lab" })];
  removeUnknownLos(los);
  assertEquals(los.length, 2);
});

// --- allVideoLos ---

Deno.test("allVideoLos returns only Los with video", () => {
  const los = [
    makeLo({ id: "a", video: "https://youtube.com/123" }),
    makeLo({ id: "b", video: "" }),
    makeLo({ id: "c", video: "https://youtube.com/456" }),
  ];
  const result = allVideoLos(los);
  assertEquals(result.length, 2);
  assertEquals(result[0].id, "a");
  assertEquals(result[1].id, "c");
});

Deno.test("allVideoLos returns empty for no videos", () => {
  const los = [makeLo({ video: "" }), makeLo({ video: "" })];
  assertEquals(allVideoLos(los).length, 0);
});

// --- getPanels ---

Deno.test("getPanels partitions Los into panel types", () => {
  const los = [
    makeLo({ id: "pv", type: "panelvideo" }),
    makeLo({ id: "pt", type: "paneltalk" }),
    makeLo({ id: "pn", type: "panelnote" }),
    makeLo({ id: "pp", type: "podcast" }),
    makeLo({ id: "other", type: "note" }),
  ];
  const panels = getPanels(los);
  assertEquals(panels.panelVideos.length, 1);
  assertEquals(panels.panelTalks.length, 1);
  assertEquals(panels.panelNotes.length, 1);
  assertEquals(panels.panelPodcasts.length, 1);
});

Deno.test("getPanels returns empty arrays when no panel types", () => {
  const los = [makeLo({ type: "note" }), makeLo({ type: "lab" })];
  const panels = getPanels(los);
  assertEquals(panels.panelVideos.length, 0);
  assertEquals(panels.panelTalks.length, 0);
  assertEquals(panels.panelNotes.length, 0);
  assertEquals(panels.panelPodcasts.length, 0);
});

// --- getUnits ---

Deno.test("getUnits separates units, sides, and standard Los", () => {
  const los = [
    makeLo({ id: "u", type: "unit" }),
    makeLo({ id: "s", type: "side" }),
    makeLo({ id: "n", type: "note" }),
    makeLo({ id: "l", type: "lab" }),
  ];
  const units = getUnits(los);
  assertEquals(units.units.length, 1);
  assertEquals(units.sides.length, 1);
  assertEquals(units.standardLos.length, 2);
});

Deno.test("getUnits excludes panel types from standardLos", () => {
  const los = [
    makeLo({ type: "panelvideo" }),
    makeLo({ type: "paneltalk" }),
    makeLo({ type: "panelnote" }),
    makeLo({ type: "podcast" }),
    makeLo({ id: "note1", type: "note" }),
  ];
  const units = getUnits(los);
  assertEquals(units.standardLos.length, 1);
  assertEquals(units.standardLos[0].id, "note1");
});

// --- loadIcon ---

Deno.test("loadIcon returns undefined when no frontMatter icon", () => {
  const lo = makeLo({ frontMatter: {} });
  assertEquals(loadIcon(lo), undefined);
});

Deno.test("loadIcon returns IconType when frontMatter has icon", () => {
  const lo = makeLo({ frontMatter: { icon: { type: "mdi-book", color: "red" } } as any });
  const icon = loadIcon(lo);
  assertExists(icon);
  assertEquals(icon!.type, "mdi-book");
  assertEquals(icon!.color, "red");
});

// --- crumbs ---

Deno.test("crumbs builds breadcrumb chain from parent links", () => {
  const grandparent = makeLo({ id: "course", title: "Course", route: "/course" });
  const parent = makeLo({ id: "topic", title: "Topic", route: "/topic", parentLo: grandparent });
  const child = makeLo({ id: "lab", title: "Lab", route: "/lab", parentLo: parent });

  const result: Lo[] = [];
  crumbs(child, result);
  assertEquals(result.length, 3);
  assertEquals(result[0].id, "course");
  assertEquals(result[1].id, "topic");
  assertEquals(result[2].id, "lab");
});

Deno.test("crumbs handles undefined lo", () => {
  const result: Lo[] = [];
  crumbs(undefined, result);
  assertEquals(result.length, 0);
});

Deno.test("crumbs strips trailing slash from route", () => {
  const lo = makeLo({ route: "/test/" });
  const result: Lo[] = [];
  crumbs(lo, result);
  assertEquals(result[0].route, "/test");
});

// --- fixRoutePaths ---

Deno.test("fixRoutePaths replaces leading # with / in route", () => {
  const lo = makeLo({ route: "#lab/test" });
  fixRoutePaths(lo);
  assertEquals(lo.route, "/lab/test");
});

Deno.test("fixRoutePaths replaces leading # with / in video", () => {
  const lo = makeLo({ route: "/ok", video: "#video/test" });
  fixRoutePaths(lo);
  assertEquals(lo.video, "/video/test");
});

// --- injectCourseUrl ---

Deno.test("injectCourseUrl replaces {{COURSEURL}} in route", () => {
  const lo = makeLo({ id: "n", type: "note", route: "/note/{{COURSEURL}}/topic-01" });
  injectCourseUrl([lo], "course-id", "https://example.com/course");
  assertEquals(lo.route.includes("{{COURSEURL}}"), false);
  assertEquals(lo.route.includes("course-id"), true);
});

Deno.test("injectCourseUrl replaces {{COURSEURL}} in img", () => {
  const lo = makeLo({ img: "https://{{COURSEURL}}/img/main.png" });
  injectCourseUrl([lo], "id", "https://example.com");
  assertEquals(lo.img, "https://https://example.com/img/main.png");
});
