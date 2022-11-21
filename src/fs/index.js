import path from "path";
import fs from "fs";

console.log(
  "🚀🚀🚀 / path.format",
  path.format({
    root: "/ignored",
    dir: "/home/user/dir",
    base: "file.txt",
  })
);
