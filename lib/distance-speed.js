"use strict";
const readline = require("readline");

const CMD_DRIVER = "Driver";
const CMD_TRIP = "Trip";

const reLine = /^(?<command>Driver|Trip) (?<driver>[^\d]+)( (?<startHour>\d\d):(?<startMinute>\d\d) (?<endHour>\d\d):(?<endMinute>\d\d) (?<miles>[0-9.]+))?$/;

const parseLine = line => {
  const parts = line.match(reLine);
  if (!parts) {
    throw new Error(`Unable to parse line: ${line}`);
  }
  if (parts.groups.command === CMD_DRIVER) {
    return parts.groups;
  }
  return {
    command: parts.groups.command,
    driver: parts.groups.driver,
    startHour: parseInt(parts.groups.startHour, 10),
    startMinute: parseInt(parts.groups.startMinute, 10),
    endHour: parseInt(parts.groups.endHour, 10),
    endMinute: parseInt(parts.groups.endMinute, 10),
    miles: parseFloat(parts.groups.miles)
  };
};

const calculateHours = ({ startHour, startMinute, endHour, endMinute }) =>
  endHour - startHour + (endMinute - startMinute) / 60;

const isSpeedInRange = (miles, hours) => {
  const mph = miles / hours;
  return 5 <= mph && mph <= 100;
};

const handleCommand = (drivers, line) => {
  if (line.command === CMD_DRIVER) {
    drivers[line.driver] = { miles: 0, hours: 0 };
  } else if (line.command === CMD_TRIP) {
    if (!drivers[line.driver]) {
      throw new Error(`Trip supplied for unknown driver: ${line.driver}`);
    }
    const miles = line.miles;
    const hours = calculateHours(line);
    if (isSpeedInRange(miles, hours)) {
      drivers[line.driver].miles += miles;
      drivers[line.driver].hours += hours;
    }
    // else discard this trip
  }
  return drivers;
};

const reNewline = /[\r\n]+/;

const tally = log =>
  log
    .split(reNewline)
    .map(parseLine)
    .reduce(handleCommand, {});

const tallyStream = stream =>
  new Promise((resolve, reject) => {
    stream.on("error", reject);

    const drivers = {};

    const rl = readline.createInterface({
      input: stream
    });
    rl.on("error", reject);
    rl.on("line", line => handleCommand(drivers, parseLine(line)));
    rl.on("close", () => resolve(drivers));
  });

const analyze = drivers =>
  Object.entries(drivers)
    .map(([driver, { miles, hours }]) => ({
      driver,
      miles,
      mph: hours > 0 ? miles / hours : undefined
    }))
    .sort((a, b) => b.miles - a.miles);

module.exports = {
  parseLine,
  calculateHours,
  isSpeedInRange,
  handleCommand,
  tally,
  tallyStream,
  analyze
};
