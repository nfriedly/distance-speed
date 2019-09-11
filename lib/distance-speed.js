"use strict";
const readline = require("readline");

const CMD_DRIVER = "Driver";
const CMD_TRIP = "Trip";

// note: RegExp named capture groups require node.js 10 or newer - see https://node.green/#ES2018-features--RegExp-named-capture-groups
const reLine = /^(?<command>Driver|Trip) (?<driver>[^\d]+)( (?<startHour>\d\d):(?<startMinute>\d\d) (?<endHour>\d\d):(?<endMinute>\d\d) (?<miles>[0-9.]+))?$/;

/**
 * Parses a line of a log file into an object with named fields
 * @param {string} line - e.g.'Driver Dan' or 'Trip Dan 07:15 07:45 17.3'
 * @return {{command: 'string', driver: string}|{command: string, driver: string, startHour: number, startMinute: number, endHour: number, endMinute: number, miles: number}}
 */
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

/**
 * Calculate number of hours (as a float) between start and end times
 * @param {number} startHour
 * @param {number} startMinute
 * @param {number} endHour
 * @param {number} endMinute
 * @return {number}
 */
const calculateHours = ({ startHour, startMinute, endHour, endMinute }) =>
  endHour - startHour + (endMinute - startMinute) / 60;

/**
 * Is the driver in the 5-100mph speed range?
 * @param {number} miles
 * @param {number} hours
 * @return {boolean}
 */
const isSpeedInRange = (miles, hours) => {
  const mph = miles / hours;
  return 5 <= mph && mph <= 100;
};

/**
 * Reducer to add a parsed line to the results object (drivers)
 * @param {object} drivers
 * @param {object} line
 * @return {object} drivers
 */
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

/**
 * Calculate all time and miles for each driver in a log synchronously
 * @param {string} log
 * @return {object}
 */
const tally = log =>
  log
    .split(reNewline)
    .map(parseLine)
    .reduce(handleCommand, {});

/**
 * Calculate all time and miles for each driver in a log asynchronously
 * @param {Stream} stream
 * @return {Promise<object>}
 */
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

/**
 * Sort drivers by miles driven and calculate average speed
 * @param {object} drivers
 * @return {{driver: *, mph: *, miles: *}[]}
 */
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
