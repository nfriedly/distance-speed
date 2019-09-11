const { PassThrough } = require("stream");
const {
  parseLine,
  calculateHours,
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

test("tally a simple log file", () => {
  const log = `Driver Dan
Driver Alex
Driver Bob
Trip Dan 07:15 07:45 17.3
Trip Dan 06:12 06:32 21.8
Trip Alex 12:01 13:16 42.0`;
  expect(tally(log)).toEqual({
    Dan: {
      miles: 39.1,
      hours: 0.8333333333333333
    },
    Alex: {
      miles: 42,
      hours: 1.25
    },
    Bob: {
      miles: 0,
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
      miles: 39.1,
      hours: 0.8333333333333333
    },
    Alex: {
      miles: 42,
      hours: 1.25
    },
    Bob: {
      miles: 0,
      hours: 0
    }
  });
});

test("analyize a simple tally", () => {
  expect(
    analyze({
      Dan: {
        miles: 39.1,
        hours: 0.8333
      },
      Alex: {
        miles: 42,
        hours: 1.23
      },
      Bob: {
        miles: 0,
        hours: 0
      }
    })
  ).toEqual([
    {
      driver: "Alex",
      miles: 42,
      mph: 34.146341463414636
    },
    {
      driver: "Dan",
      miles: 39.1,
      mph: 46.921876875075
    },
    {
      driver: "Bob",
      miles: 0,
      mph: undefined
    }
  ]);
});
