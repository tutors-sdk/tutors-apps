import MarkdownIt from "markdown-it";
import latex from "@iktakahiro/markdown-it-katex";
import anchor from "markdown-it-anchor";
import toc from "markdown-it-table-of-contents";
import { full as emoji } from "markdown-it-emoji";
import sub from "markdown-it-sub";
import sup from "markdown-it-sup";
import mark from "markdown-it-mark";
import footnote from "markdown-it-footnote";
import deflist from "markdown-it-deflist";
import { addCopyButton } from "shiki-transformer-copy-button";
import type { Course, Lab, Lo, Note } from "../types/index.ts";
import { filter, link_open, quote_close, quote_open, videoPlayer } from "./markdown-plugins.ts";

const options = {
  // delay time from "copied" state back to normal state
  toggle: 2000,
};

let currentTheme = "ayu-dark";

let customHighlighter: any;

export function initHighlighter(codeHighlighter: any) {
  customHighlighter = codeHighlighter;
}

export const markdownIt: MarkdownIt = new MarkdownIt({
  html: true, // Enable HTML tags in source
  xhtmlOut: false, // Use '/' to close single tags (<br />).
  breaks: false, // Convert '\n' in paragraphs into <br>
  langPrefix: "language-", // CSS language prefix for fenced blocks. Can be
  linkify: false, // Autoconvert URL-like text to links
  typographer: true,
  quotes: "“”‘’",
  highlight: function (str: string, lang: string) {
    try {
      return customHighlighter?.codeToHtml(str, { lang, theme: currentTheme, transformers: [addCopyButton(options)] });
    } catch (e) {
      return customHighlighter?.codeToHtml(str, {
        lang: "",
        theme: currentTheme,
        transformers: [addCopyButton(options)],
      });
    }
  },
});

const tocOptions = { includeLevel: [1, 2, 3] };
markdownIt.use(latex);
markdownIt.use(anchor, {
  permalink: anchor.permalink.headerLink(),
});

markdownIt.use(toc, tocOptions);
markdownIt.use(emoji);
markdownIt.use(sub);
markdownIt.use(sup);
markdownIt.use(mark);
markdownIt.use(footnote);
markdownIt.use(deflist);
markdownIt.use(videoPlayer);
markdownIt.renderer.rules.blockquote_open = quote_open;
markdownIt.renderer.rules.blockquote_close = quote_close;
markdownIt.renderer.rules.link_open = link_open;

export function convertMdToHtml(md: string, codeTheme: string = "ayu-dark"): string {
  currentTheme = codeTheme;
  return markdownIt.render(md);
}

export function convertLabToHtml(course: Course, lab: Lab, protocol: string = "https://") {
  lab.summary = markdownIt.render(lab.summary);
  const url = lab.route.replace(`/lab/${course.courseId}`, course.courseUrl);
  lab.los?.forEach((step) => {
    if (course.courseUrl) {
      step.contentMd = filter(step.contentMd, url, protocol);
    }
    step.contentHtml = markdownIt.render(step.contentMd);
    step.parentLo = lab;
    step.type = "step";
  });
}

export function convertNoteToHtml(course: Course, note: Note, protocol: string = "https://") {
  note.summary = convertMdToHtml(note.summary);
  const url = note.route.replace(`/note/${course.courseId}`, course.courseUrl);
  if (course.courseUrl) {
    note.contentMd = filter(note.contentMd, url, protocol);
  }
  note.contentHtml = convertMdToHtml(note.contentMd);
}


export function convertLoToHtml(course: Course, lo: Lo, protocol: string = "https://") {
  if (lo.type === "lab") {
    convertLabToHtml(course, lo as Lab);
  }else if (lo.type == "note") {
    convertNoteToHtml(course, lo as Note);
  } else {
    if (lo.summary) lo.summary = convertMdToHtml(lo.summary);
    let md = lo.contentMd;
    if (md) {
      if (course.courseUrl) {
        const url = lo.route.replace(`/${lo.type}/${course.courseId}`, course.courseUrl);
        md = filter(md, url, protocol);
      }
      lo.contentHtml = convertMdToHtml(md);
    }
  }
}


