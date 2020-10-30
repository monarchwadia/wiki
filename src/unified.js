const engine = require("unified-engine");
const remark = require("remark");
const remarkFrontmatter = require("remark-frontmatter");

engine(
  {
    processor: remark().use(remarkFrontmatter),
    files: ["./wiki"],
    extensions: ["md", "markdown", "mkd", "mkdn", "mkdown"],
    color: true,
    treeOut: true,
    // out: true,
    output: "./temp",
    // treeOut: true,
  },
  done
);

function done(error, data) {
  if (error) throw error;
}
