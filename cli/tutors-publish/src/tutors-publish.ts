#!/usr/bin/env node
import * as fs from "fs";
import { parseCourse, generateCourse, version } from "tutors-gen-lib/src/tutors";
import { Command } from "commander";
import { generateDocsify } from "./generators/docsify";

const versionStr = `tutors-publish: ${version}`;
console.log(versionStr);

const program = new Command();

program.version(versionStr).option("-d, --docsify <string>", "publish docsify version").parse();

const options = program.opts();

if (!fs.existsSync("course.md")) {
  console.log("Cannot locate course.md. Please Change to course folder and try again. ");
} else {
  const srcFolder = process.cwd();
  const destFolder = `${srcFolder}/json`;
  const lo = parseCourse(srcFolder);
  generateCourse(lo, destFolder);
  if (options.docsify) {
    generateDocsify(lo, options.docsify);
  }
}
console.log(versionStr);
