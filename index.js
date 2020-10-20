const fs = require("fs-extra");
const path = require("path");
const fm = require("front-matter");

const ROOT = path.join(__dirname, "temp", "pass-1");

class LinkManager {
  constructor() {
    this.links = {};
  }

  registerPage(originalPath) {
    const targetFilepath = path.join(ROOT, originalPath);
    const targetDirpath = path.dirname(targetFilepath);

    const contents = getContents(originalPath);
    const frontMatter = fm(contents);

    const { title } = frontMatter.attributes;

    if (!this.links[title]) {
      this.links[title] = originalPath;
    }
  }

  enrich(_contents) {
    // create a lowercase "map" of the contents on which to do
    // pattern matching.
    let contents = _contents;
    let lcContents = contents.toLowerCase();

    // for each link, do pattern matching.
    Object.entries(this.links).forEach(([term, originalPath]) => {
      const lcTerm = term.toLowerCase();
      // iterate through each character of the content
      for (let index = 0; index < lcContents.length - lcTerm.length; index++) {
        const endIndex = index + lcTerm.length;
        const lcPassage = lcContents.slice(index, endIndex);

        // a match was found.
        if (lcTerm === lcPassage) {
          // modify the original content with the original term
          const newCharacterSequence = `[${term}](${originalPath})`;

          const left = contents.slice(0, index);
          const right = contents.slice(endIndex, contents.length);

          contents = [left, newCharacterSequence, right].join("");
          lcContents = contents.toLowerCase();

          index += newCharacterSequence.length;
        }
      }
    });

    return contents;
  }
}

function main() {
  const linkManager = new LinkManager();

  walkDir("wiki", (originalPath) => {
    const contents = getContents(originalPath);
    linkManager.registerPage(originalPath, contents);
  });

  walkDir("wiki", (originalPath) => {
    console.log("Reading original path", originalPath);
    const contents = getContents(originalPath);

    // TODO: Fix enriching
    const enrichedContents = contents ? linkManager.enrich(contents) : "";
    // const enrichedContents = contents;

    writeFile(originalPath, enrichedContents);
  });
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function writeFile(originalPath, value) {
  const targetFilepath = path.join(ROOT, originalPath);
  const targetDirpath = path.dirname(targetFilepath);

  // console.log("WRITING " + value + " to " + targetFilepath);

  if (!fs.existsSync(targetDirpath)) {
    fs.mkdirSync(targetDirpath, { recursive: true });
  }
  fs.writeFileSync(targetFilepath, value);
}

function getContents(originalPath) {
  return fs.readFileSync(path.join(__dirname, originalPath), "utf-8");
}

// Execution starts here
main();
