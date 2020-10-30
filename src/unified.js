const engine = require("unified-engine");
const remark = require("remark");
const remarkFrontmatter = require("remark-frontmatter");
const replaceString = require("./utils/mdast-util-replace-string");
const yaml = require("js-yaml");
const fse = require("fs-extra");
const path = require("path");

const srcDir = path.join(__dirname, "../wiki");
const distDir = path.join(__dirname, "../dist");

// PHASE 1 - Prepare ========================================================================
// Clean the directory and create the initial dist dir.
// This dist dir has not yet been parsed by our unified-engine
fse.removeSync(distDir);
fse.copySync(srcDir, distDir, {}, function (err) {
  if (err) {
    console.error("ERROR", err);
  } else {
    console.log("success!");
  }
});

// PHASE 2 - Process ========================================================================
// Now that the dist dir has been created, parse it with the actual output
const doReplace = (tree, token, url) => {
  replaceString(
    tree,
    token,
    (kid) => ({
      type: "link",
      title: null,
      url,
      position: kid.position,
      children: [
        {
          type: "text",
          value: token,
          position: kid.position,
        },
      ],
    }),
    (kid) => kid.type !== "link"
  );
};

// This component registers all the aliases, then interpolates them with the proper output.
const InternalLinkDecorator = () => {
  const files = {};

  return {
    register: (options) => {
      return (tree, file) => {
        const yamlString = tree.children.find((x) => x.type === "yaml");
        const frontmatter = yaml.load(yamlString.value);
        console.log(frontmatter, file);
      };
    },

    link: (options) => {
      return (tree, file) => {
        // console.log("TREE", tree);
        doReplace(tree, " a ", "https://www.youtube.com/watch?v=oHg5SJYRHA0");
      };
    },
  };
};

// Set up the processor
const decorator = InternalLinkDecorator();
const processor = remark()
  .use(remarkFrontmatter)
  .use(decorator.register)
  .use(decorator.link);

// Process the file
engine(
  {
    processor,
    files: [distDir],
    extensions: ["md", "markdown", "mkd", "mkdn", "mkdown"],
    color: true,
    // treeOut: true,
    // out: true,
    output: true,
    // treeOut: true,
  },
  (error, data) => {
    if (error) throw error;
  }
);
