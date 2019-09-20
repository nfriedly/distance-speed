const { PassThrough } = require("stream");
const {
  parseLine,
  calculateHours,
  isSpeedInRange,
  handleCommand,
  tally,
  tallyStream,
  analyze
} = require("../lib/distance-speed");

test("parseLine can parse a Driver command", () => {
  expect(parseLine("Driver Dan")).toEqual({ command: "Driver", driver: "Dan" });
});

test("parseLine can parse a Trip command", () => {
  expect(parseLine("Trip Dan 07:15 07:45 17.3")).toEqual({
    command: "Trip",
    driver: "Dan",
    startHour: 7,
    startMinute: 15,
    endHour: 7,
    endMinute: 45,
    miles: 17.3
  });
});

test("calculateHours with a simple time range", () => {
  expect(
    calculateHours({
      startHour: 7,
      startMinute: 15,
      endHour: 7,
      endMinute: 45
    })
  ).toBe(0.5);
});

test("calculateHours with a more complex time range", () => {
  expect(
    calculateHours({
      startHour: 7,
      startMinute: 45,
      endHour: 9,
      endMinute: 15
    })
  ).toBe(1.5);
});

test.each([
  // miles, hours, expected
  [4.9, 1, false],
  [5, 1, true],
  [100, 1, true],
  [100.1, 1, false]
])("isSpeedInRange %d mph", (miles, hours, expected) => {
  expect(isSpeedInRange(miles, hours)).toBe(expected);
});

test("handleCommand should handle a Driver command", () => {
  const drivers = {};
  const line = { command: "Driver", driver: "Foo" };
  handleCommand(drivers, line);
  expect(drivers).toEqual({
    Foo: { highwayMiles: 0, sideStreetMiles: 0, hours: 0 }
  });
});

test("handleCommand should handle a Trip command", () => {
  const drivers = { Foo: { highwayMiles: 0, sideStreetMiles: 0, hours: 0 } };
  const line = {
    command: "Trip",
    driver: "Foo",
    startHour: 1,
    startMinute: 0,
    endHour: 2,
    endMinute: 0,
    miles: 50
  };
  const actual = handleCommand(drivers, line);
  expect(actual).toEqual({
    Foo: { highwayMiles: 50, sideStreetMiles: 0, hours: 1 }
  });
});

test("handleCommand should discard a Trip with an out-of-range speed", () => {
  const drivers = { Foo: { highwayMiles: 0, sideStreetMiles: 0, hours: 0 } };
  const line = {
    command: "Trip",
    driver: "Foo",
    startHour: 1,
    startMinute: 0,
    endHour: 2,
    endMinute: 0,
    miles: 999
  };
  const actual = handleCommand(drivers, line);
  expect(actual).toEqual({
    Foo: { highwayMiles: 0, sideStreetMiles: 0, hours: 0 }
  });
});

test("tally a simple log file", () => {
  const log = `Driver Dan
Driver Alex
Driver Bob
Trip Dan 07:15 07:45 17.3
Trip Dan 06:12 06:32 21.8
Trip Alex 12:01 13:16 42.0`;
  expect(tally(log)).toEqual({
    Dan: {
      highwayMiles: 21.8,
      sideStreetMiles: 17.3,
      hours: 0.8333333333333333
    },
    Alex: {
      highwayMiles: 0,
      sideStreetMiles: 42,
      hours: 1.25
    },
    Bob: {
      highwayMiles: 0,
      sideStreetMiles: 0,
      hours: 0
    }
  });
});

test("tallyStream a simple log file", async () => {
  const log = `Driver Dan
Driver Alex
Driver Bob
Trip Dan 07:15 07:45 17.3
Trip Dan 06:12 06:32 21.8
Trip Alex 12:01 13:16 42.0`;
  const stream = new PassThrough();
  stream.end(log);
  const actual = await tallyStream(stream);
  expect(actual).toEqual({
    Dan: {
      highwayMiles: 21.8,
      sideStreetMiles: 17.3,
      hours: 0.8333333333333333
    },
    Alex: {
      highwayMiles: 0,
      sideStreetMiles: 42,
      hours: 1.25
    },
    Bob: {
      highwayMiles: 0,
      sideStreetMiles: 0,
      hours: 0
    }
  });
});

test("analyize a simple tally", () => {
  expect(
    analyze({
      Dan: {
        highwayMiles: 21.8,
        sideStreetMiles: 17.3,
        hours: 0.8333333333333333
      },
      Alex: {
        highwayMiles: 0,
        sideStreetMiles: 42,
        hours: 1.25
      },
      Bob: {
        highwayMiles: 0,
        sideStreetMiles: 0,
        hours: 0
      }
    })
  ).toEqual([
    {
      driver: "Alex",
      miles: 42,
      mph: 42 / 1.25,
      percentHighway: 0
    },
    {
      driver: "Dan",
      miles: 39.1,
      mph: 39.1 / 0.8333333333333333,
      percentHighway: (21.8 / (17.3 + 21.8)) * 100
    },
    {
      driver: "Bob",
      miles: 0,
      mph: undefined,
      percentHighway: undefined
    }
  ]);
});
