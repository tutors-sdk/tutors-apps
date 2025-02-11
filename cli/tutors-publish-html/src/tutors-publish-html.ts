#!/usr/bin/env node
import * as fs from "fs";
import { Command } from "commander";
import { parseCourse, decorateCourse, generateCourse, version } from "tutors-gen-lib/src/tutors";
import { emitCourse } from "./course-emitter";

const program = new Command();
const versionStr = `tutors-publish-html: ${version}`;

program.version(versionStr).option("-p, --path <string>", "path to publish to").parse();

const options = program.opts();

console.log(versionStr);

if (!fs.existsSync("course.md")) {
  console.log("Cannot locate course.md. Change to course folder and try again. ");
} else {
  if (!options.path) {
    options.path = "html";
  }
  const srcFolder = options.path ? `${process.cwd()}` : process.cwd();
  const destFolder = `${srcFolder}/${options.path}`;
  const lo = parseCourse(srcFolder);
  generateCourse(lo, destFolder);
  decorateCourse(lo);
  emitCourse(destFolder, lo);
}
console.log(versionStr);
