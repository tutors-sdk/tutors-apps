export const imageTypes = ["png", "jpg", "jpeg", "gif", "PNG", "JPG", "JPEG", "GIF"];
export const assetTypes = imageTypes.concat(["pdf", "zip"]);

export type WeekType = {
  title: string;
  type: string;
  date: string;
  dateObj: Date;
};

export type Calendar = {
  title: string;
  weeks: WeekType[];
  currentWeek: WeekType;
};

export type VideoIdentifier = {
  service: string;
  id: string;
};

export type VideoIdentifiers = {
  videoid: string;
  videoIds: VideoIdentifier[];
};

export type LearningResource = {
  courseRoot: string;
  route: string;
  id: string;
  lrs: LearningResource[];
  files: Array<string>;
  type: string;
};

export class Properties {
  [key: string]: string;
}

export type IconType = {
  type: string;
  color: string;
};

export type IconNav = {
  link: string;
  icon: string;
  tip: string;
  target: string;
};

export type IconNavBar = {
  show: boolean;
  bar: IconNav[];
};

export type Lo = {
  type: string;
  id: string; // folder name containing the lo
  title: string; // first line of markdown
  summary: string; // second three lines of markdown
  contentMd: string; // complete contents of markdown
  frontMatter: Properties; // frontmatter properties if present in markdown
  contentHtml?: string; // html generated by markdown conversion
  route: string; // url to the lo

  img: string; // url to the image for the lo
  imgFile: string; // the image file name
  icon?: IconType; // icon to be used of no image file found, extracteed from frontmatter in markdown

  video: string; // video id for the lo
  videoids: VideoIdentifiers; // video name/value pairs if present

  hide: boolean; // hide flag, for ignore feature

  // dynamic properties, created by decorator
  parentLo?: Lo; // immediate parent lo
  parentTopic?: Topic;
  parentCourse?: Course; // parent course
  breadCrumbs?: Lo[]; // all los from course to this lo
};

export type LabStep = {
  title: string;
  shortTitle: string;
  contentMd: string;
  contentHtml?: string;
  route: string;
  id: string;
  parentLo: Lab;
};

export type Lab = Lo & {
  type: "lab";
  los: LabStep[];
};

export type Talk = Lo & {
  type: "talk";
  pdf: string; // route to pdf for the lo
  pdfFile: string; // pdf file name
};

export type Archive = Lo & {
  type: "archive";
  archiveFile?: string; // archive file in the lo
};

export type Web = Lo & {
  type: "web";
};

export type Github = Lo & {
  type: "github";
};

export type Note = Lo & {
  type: "note";
};

export type PanelNote = Lo & {
  type: "panelnote";
};

export type PanelTalk = Talk & {
  type: "paneltalk";
};

export type PanelVideo = Lo & {
  type: "panelvideo";
};

export type Panels = {
  panelVideos: Lo[];
  panelTalks: Lo[];
  panelNotes: Lo[];
};

export type Units = {
  units: Unit[];
  sides: Side[];
  standardLos: Lo[];
};

export type Composite = Lo & {
  los: Lo[]; // child los
  panels: Panels; // child panel los - paneltalks, panelvideos, panelnotes.
  units: Units; // child units, including side units
};

export type Topic = Composite & {
  toc: Lo[];
  type: "topic";
};

export type Unit = Composite & {
  type: "unit";
};

export type Side = Composite & {
  type: "side";
};

export type Course = Composite & {
  type: "course";
  courseId: string;
  courseUrl: string;
  topicIndex: Map<string, Lo>;
  loIndex: Map<string, Lo>;
  walls?: Lo[][];
  wallMap?: Map<string, Lo[]>;
  properties: Properties; // contents of properties.yaml
  calendar?: Properties; // contents of calendar.yaml
  courseCalendar?: Calendar;
  authLevel: number;
  isPortfolio: boolean;
  areVideosHidden: boolean;
  areLabStepsAutoNumbered: boolean;
  hasEnrollment: boolean;
  hasWhiteList: boolean;
  ignorePin: string;
  companions: IconNavBar;
  wallBar: IconNavBar;
};

export const simpleTypes = ["note", "archive", "web", "github", "panelnote", "paneltalk", "panelvideo", "talk", "book", "lab"];
export const loCompositeTypes = ["unit", "side", "topic", "course"];
export const loTypes = simpleTypes.concat(loCompositeTypes);
export type LoType = (typeof loTypes)[number];
export function isCompositeLo(lo: Lo) {
  return loCompositeTypes.includes(lo.type);
}

export const preOrder = new Map([
  ["unit", 1],
  ["side", 2],
  ["talk", 3],
  ["lab", 4],
  ["note", 5],
  ["web", 6],
  ["github", 7],
  ["panelnote", 8],
  ["paneltalk", 9],
  ["archive", 10],
  ["panelvideo", 11],
  ["topic", 12],
  ["unknown", 13],
  ["", 0]
]);