"use strict";

const reLine = /^(?<command>Driver|Trip) (?<driver>[^\d]+)( (?<startHour>\d\d):(?<startMinute>\d\d) (?<endHour>\d\d):(?<endMinute>\d\d) (?<distance>[0-9.]]+))?$/;

const parseLine = line => {
  const parts = line.match(reLine);
  if (!parts) {
    throw new Error(`Unable to parse line: ${line}`);
  }
  if (parts.groups.command === "Driver") {
    return parts.groups;
  }
  return {
    command: parts.groups.command,
    driver: parts.groups.driver,
    startHour: parseInt(parts.groups.startHour, 10),
    startMinute: parseInt(parts.groups.startMinute, 10),
    endHour: parseInt(parts.groups.endHour, 10),
    endMinute: parseInt(parts.groups.endMinute, 10),
    distance: parseFloat(parts.groups.distance),
  };
};

module.exports = {
  parseLine
};
