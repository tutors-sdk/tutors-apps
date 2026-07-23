import { assertEquals, assertExists } from "jsr:@std/assert";
import { createCompanions, createWalls, loadPropertyFlags } from "../src/utils/course-utils.ts";
import type { Course, Lo, Composite } from "../src/types/learning-objects.ts";
import type { Properties } from "../src/types/type-utils.ts";

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

function makeCourse(overrides: Partial<Course> = {}): Course {
  return {
    ...makeLo({ type: "course" }),
    courseId: "test-course",
    courseUrl: "https://example.com",
    topicIndex: new Map(),
    loIndex: new Map(),
    properties: {} as Properties,
    authLevel: 0,
    isPortfolio: false,
    isPrivate: false,
    llm: 0,
    pdfOrientation: "landscape",
    areVideosHidden: false,
    areLabStepsAutoNumbered: false,
    hasEnrollment: false,
    hasCalendar: false,
    defaultPdfReader: "adobe",
    footer: "",
    ignorePin: "",
    companions: { show: false, bar: [] },
    wallBar: { show: false, bar: [] },
    los: [],
    toc: [],
    panels: { panelVideos: [], panelTalks: [], panelNotes: [], panelPodcasts: [] },
    units: { units: [], sides: [], standardLos: [] },
    ...overrides,
  } as Course;
}

// --- createCompanions ---

Deno.test("createCompanions creates empty bar when no properties", () => {
  const course = makeCourse({ properties: {} as Properties });
  createCompanions(course);
  assertEquals(course.companions.bar.length, 0);
  assertEquals(course.companions.show, false);
});

Deno.test("createCompanions adds slack companion from properties", () => {
  const props = { slack: "https://slack.example.com" } as unknown as Properties;
  const course = makeCourse({ properties: props });
  createCompanions(course);
  assertEquals(course.companions.bar.length, 1);
  assertEquals(course.companions.bar[0].type, "slack");
  assertEquals(course.companions.bar[0].link, "https://slack.example.com");
  assertEquals(course.companions.bar[0].target, "_blank");
  assertEquals(course.companions.show, true);
});

Deno.test("createCompanions adds multiple companions", () => {
  const props = {
    slack: "https://slack.example.com",
    zoom: "https://zoom.example.com",
    youtube: "https://youtube.com/channel",
  } as unknown as Properties;
  const course = makeCourse({ properties: props });
  createCompanions(course);
  assertEquals(course.companions.bar.length, 3);
  const types = course.companions.bar.map((c) => c.type);
  assertEquals(types.includes("slack"), true);
  assertEquals(types.includes("zoom"), true);
  assertEquals(types.includes("youtube"), true);
});

Deno.test("createCompanions adds teams companion", () => {
  const props = { teams: "https://teams.microsoft.com/join" } as unknown as Properties;
  const course = makeCourse({ properties: props });
  createCompanions(course);
  assertEquals(course.companions.bar.length, 1);
  assertEquals(course.companions.bar[0].type, "teams");
});

// --- createWalls ---

Deno.test("createWalls creates empty walls for course with no Los", () => {
  const course = makeCourse({ los: [] });
  createWalls(course);
  assertExists(course.walls);
  assertEquals(course.walls!.length, 0);
  assertEquals(course.wallBar.bar.length, 0);
});

Deno.test("createWalls creates walls for course with typed Los", () => {
  const los = [
    makeLo({ id: "t1", type: "talk", hide: false }),
    makeLo({ id: "t2", type: "talk", hide: false }),
    makeLo({ id: "l1", type: "lab", hide: false }),
  ];
  const course = makeCourse({ los });
  createWalls(course);
  assertExists(course.walls);
  assertEquals(course.walls!.length > 0, true);
  assertEquals(course.wallBar.bar.length > 0, true);
});

Deno.test("createWalls excludes hidden Los from wallMap", () => {
  const los = [makeLo({ id: "hidden", type: "talk", hide: true })];
  const course = makeCourse({ los });
  createWalls(course);
  assertEquals(course.wallMap?.has("talk"), false);
});

// --- loadPropertyFlags ---

Deno.test("loadPropertyFlags sets default pdfOrientation to landscape", () => {
  const course = makeCourse({ properties: {} as Properties, los: [] });
  loadPropertyFlags(course);
  assertEquals(course.pdfOrientation, "landscape");
});

Deno.test("loadPropertyFlags sets default pdfReader to adobe", () => {
  const course = makeCourse({ properties: {} as Properties, los: [] });
  loadPropertyFlags(course);
  assertEquals(course.defaultPdfReader, "adobe");
});

Deno.test("loadPropertyFlags reads pdfOrientation from properties", () => {
  const props = { pdfOrientation: "portrait" } as unknown as Properties;
  const course = makeCourse({ properties: props, los: [] });
  loadPropertyFlags(course);
  assertEquals(course.pdfOrientation, "portrait");
});

Deno.test("loadPropertyFlags reads defaultPdfReader from properties", () => {
  const props = { defaultPdfReader: "google" } as unknown as Properties;
  const course = makeCourse({ properties: props, los: [] });
  loadPropertyFlags(course);
  assertEquals(course.defaultPdfReader, "google");
});

Deno.test("loadPropertyFlags sets isPortfolio from properties", () => {
  const props = { portfolio: true } as unknown as Properties;
  const course = makeCourse({ properties: props, los: [] });
  loadPropertyFlags(course);
  assertEquals(course.isPortfolio, true);
});

Deno.test("loadPropertyFlags sets isPrivate from properties", () => {
  const props = { private: 1 } as unknown as Properties;
  const course = makeCourse({ properties: props, los: [] });
  loadPropertyFlags(course);
  assertEquals(course.isPrivate, true);
});

Deno.test("loadPropertyFlags sets authLevel from properties", () => {
  const props = { auth: 2 } as unknown as Properties;
  const course = makeCourse({ properties: props, los: [] });
  loadPropertyFlags(course);
  assertEquals(course.authLevel, 2);
});

Deno.test("loadPropertyFlags sets hasEnrollment when enrollment exists", () => {
  const course = makeCourse({ properties: {} as Properties, los: [], enrollment: { students: [] } as any });
  loadPropertyFlags(course);
  assertEquals(course.hasEnrollment, true);
});

Deno.test("loadPropertyFlags sets hasCalendar when calendar exists", () => {
  const course = makeCourse({ properties: {} as Properties, los: [], calendar: { title: "test" } as any });
  loadPropertyFlags(course);
  assertEquals(course.hasCalendar, true);
});
