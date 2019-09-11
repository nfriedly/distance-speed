const { parseLine } = require("./distance-speed");

test("parseLine can parse a Driver command", () => {
  expect(parseLine("Driver Dan")).toEqual({ command: "Driver", driver: "Dan" });
});

test("parseLine can parse a Trip command", () => {
  expect(parseLine("Trip Dan 07:15 07:45 17.3")).toEqual({ command: "Trip", driver: "Dan", });
});