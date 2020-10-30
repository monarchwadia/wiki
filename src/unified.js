const engine = require("unified-engine");
const remark = require("remark");
const remarkFrontmatter = require("remark-frontmatter");
const replaceString = require("./utils/mdast-util-replace-string");
const yaml = require("js-yaml");
const fse = require("fs-extra");
const path = require("path");
const remark2rehype = require("remark-rehype");
const html = require("rehype-stringify");
const doc = require("rehype-document");

const rootUrl = "wiki";
const distDirName = "docs";
const srcDir = path.join(__dirname, "../wiki");
const distDir = path.join(__dirname, "../", distDirName);

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
  const aliasRegistry = {};

  return {
    register: (options) => {
      return (tree, file) => {
        const yamlString = tree.children.find((x) => x.type === "yaml");
        const frontmatter = yaml.load(yamlString.value);
        console.log("FRONTMATTER", frontmatter, frontmatter.title);

        const aliases = [frontmatter.title.toLowerCase()];
        if (frontmatter.aliases) {
          const aliasesTrimmed = frontmatter.aliases.trim();
          aliasesTrimmed
            .split(/\,\s?/)
            .filter((x) => !!x)
            .map((x) => x.toLowerCase())
            .forEach((alias) => {
              aliases.push(alias);
            });
        }

        for (let i = 0; i < aliases.length; i++) {
          const alias = aliases[i];
          if (aliasRegistry[alias]) {
            throw new Error(
              `Alias [${alias}] was already declared. Check for double declarations. Note that declarations are case-insensitive.`
            );
          } else {
            const urlDestination = file.history[file.history.length - 1];
            aliasRegistry[alias] = urlDestination;
          }
        }
      };
    },

    link: (options) => {
      return (tree, file) => {
        // console.log("TREE", tree);
        Object.entries(aliasRegistry).forEach(([alias, urlDestination]) => {
          doReplace(
            tree,
            alias,
            path
              .join("/", rootUrl, path.relative(distDirName, urlDestination))
              .replace(/\.md$/, ".html")
          );
        });
      };
    },
  };
};

// Set up the processor
const decorator = InternalLinkDecorator();

// Process the file
engine(
  {
    processor: remark().use(remarkFrontmatter).use(decorator.register),
    files: [distDir],
    extensions: ["md", "markdown", "mkd", "mkdn", "mkdown"],
    color: true,
    // treeOut: true,
    // out: true,
    output: false,
    // treeOut: true,
  },
  (error, data) => {
    if (error) throw error;
    engine(
      {
        processor: remark()
          .use(remarkFrontmatter)
          .use(decorator.link)
          .use(remark2rehype)
          .use(doc)
          .use(html)
          .use(() => (tree, file) => {
            // rename(file, ".html")
            file.extname = ".html";
          }),
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
  }
);

// Process the file
