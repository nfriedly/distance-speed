"use strict";
const path = require("path");
const cp = require("child_process");

test("it analyzes a logfile", () => {
  const expected = `Alex: 42 miles @ 34 mph 0% highway 1 invalid trips
Dan: 39 miles @ 47 mph 56% highway
Bob: 0 miles
`;
  const script = path.join(__dirname, "../bin/cli.js");
  const logfile = path.join(__dirname, "log.txt");
  const { stdout, stderr } = cp.spawnSync("node", [script, logfile], {
    encoding: "utf8"
  });
  expect(stderr).toBe("");
  expect(stdout).toBe(expected);
});
