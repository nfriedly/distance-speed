'use strict';

const reLine = /^(Driver) (.*)$|^(Trip) (.*) (\d\d):(\d\d) (\d\d):(\d\d) ([0-9.]]+)$/;

const parseLine = (line) => {
    const parts = line.split(' ');
    const command = parts[0];
    const driver = parts[1];
};