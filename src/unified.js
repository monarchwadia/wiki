const engine = require("unified-engine");
const remark = require("remark");
const remarkFrontmatter = require("remark-frontmatter");
const replaceString = require("./utils/mdast-util-replace-string");

function link(options) {
  return function transformer(tree, file) {
    replaceString(
      tree,
      " a ",
      (kid) => ({
        type: "link",
        title: null,
        url: "https://www.youtube.com/watch?v=oHg5SJYRHA0",
        position: kid.position,
        children: [
          {
            type: "text",
            value: " a ",
            position: kid.position,
          },
        ],
      }),
      (kid) => kid.type !== "link"
    );
  };
}

const processor = remark().use(remarkFrontmatter).use(link);

engine(
  {
    processor,
    files: ["./wiki"],
    extensions: ["md", "markdown", "mkd", "mkdn", "mkdown"],
    color: true,
    // treeOut: true,
    // out: true,
    output: "./temp",
    // treeOut: true,
  },
  done
);

function done(error, data) {
  if (error) throw error;
}
