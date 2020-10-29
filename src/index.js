const findDown = require("vfile-find-down");
const promisify = require("./utils/promisify");
const toVfile = require("to-vfile");
const fs = require("fs");
var matter = require("vfile-matter");

const main = async () => {
  // read directory and get vfiles (just provides paths. does not populate contents)
  const filePaths = await promisify(findDown.all, ".md", "./wiki");

  const vfiles = filePaths
    // populate vfiles with data
    .map((fpath) => {
      // not sure why this array is called history, and why it's an array.
      const filename = fpath.history[0];
      return toVfile.readSync(filename);
    })
    // populates vfiles with frontmatter
    .map((vfile) => matter(vfile, { strip: true }));

  // TODO: Remove
  console.log(vfiles);
};

main();
