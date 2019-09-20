#!/usr/bin/env node
"use strict";

const fs = require("fs");

const { tallyStream, analyze } = require("../lib/distance-speed");

/**
 * Parses the passed in log file and logs an analysis
 * @param {string[]} argv
 * @return {Promise<void>}
 */
const analyzeLog = async argv => {
  const inputFile = argv[2];

  if (!inputFile) {
    console.log(`Usage: ${argv[1]} logfile.txt`);
    process.exit(1);
  }

  const inputStream = fs.createReadStream(inputFile);

  const totals = await tallyStream(inputStream);

  analyze(totals).map(e =>
    console.log(
      `${e.driver}: ${Math.round(e.miles)} miles${
        e.miles
          ? ` @ ${Math.round(e.mph)} mph ${Math.round(
              e.percentHighway
            )}% highway`
          : ""
      }`
    )
  );
};

analyzeLog(process.argv);
