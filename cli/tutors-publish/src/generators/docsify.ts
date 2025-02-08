import { Course } from "tutors-gen-lib/src/models/lo-types";

export function generateDocsify(course: Course, coursepath: string) {
  course.los.forEach((lo) => {
    console.log(lo);
  });
}
