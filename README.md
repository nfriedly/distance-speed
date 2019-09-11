# Driving history analyzer
Tracks the miles driven and total time taken for trips from various drivers. 
Summarizes results with total miles and average speed for each driver.

More info at https://gist.github.com/dan-manges/1e1854d0704cb9132b74

## Prerequisites

* Node.js v10 or newer

## Usage

* Install the dependencies with `npm install`
* Run the script with `node bin/cli.js <logfile>`

## Testing

* Lint and test once: `npm test`
* Watch for changes and automatically re-test: `npx jest --watch`

## Thoughts

I came at this with the goal of supporting a streaming interface and being well-tested. 
I decided on a function approach because I felt that it was well-suited to the challenge and these goals, particularly testing.

The testing goal was accomplished, in large part, by keeping the majority of the code in small functions in the library section.
It's probably slightly more functions that I'd normally use, but I feel like it's a good match for what the challenge was requesting.
The level of JSDoc is probably a bit overkill too, definitely a little more than I'd normally write.

One thing I considered but decided against was supporting other units of distance. 
Baking the `miles` and `mph` into the interface will make that a little more challenging to add, but certainly not impossible, and I prefer the simplicity of the current data model.

The CLI file has very little code, aside from input handling and output formatting. 
It does, currently, handle reading from the filesystem.
I considered putting that into the library but ultimately decided against it since it's just a tiny bit of glue around Node.js's built-in file-streaming code.
If there were more logc around it, I probably would add a `tallyFile()` method to the library.

I initially wrote the `tally()` function, which is the non-streaming interface. 
It helped get the underlying data-wrangling working properly before dealing with streams in the `tallyStream()` function.
Depending on who this codebase was getting distributed to, (e.g. for anything internal) I might get rid of the old `tally()` method, but I decided to keep it around for this exercise. 
I'd probably also keep `tally()` if this were to be a public API, because it's going to be simpler and easier to use.
The benefits of the streaming interface only really matter with very large log files where it would significantly reduce memory usage.

I feel a little dirty about using a regex in `parseLine()`, and I might switch to a proper parser if performance (or data consistency) became an issue. 
But, it seems to work well for the moment, and I suspect it'd be more likely to be IO-limited than compute-limited in a real-world scenario.
This was the first time I've used RegEx named capture groups, which definitely make the experience nicer.

Treating the hours as a float also feels wrong, but work out fine since everything is rounded in the end.

I initially overlooked the "discard trips outside of the 5-100mph range" requirement, and ended up adding that in later. 
I'm not sure it's in the best possible spot in the flow, but I think it works well enough.
