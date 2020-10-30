const engine = require("unified-engine");
const remark = require("remark");
const remarkFrontmatter = require("remark-frontmatter");

function walk(node) {
  // do stuff based on node type
  switch (node.type) {
    default:
      break;
  }

  if (node.children && node.children.length) {
    for (let i = 0; i < node.children.length; i++) {
      const kid = node.children[i];
      const { position } = kid;

      // STEP 1: Replace nodes if needed
      switch (kid.type) {
        // In case of text type, replace stuff if needed
        case "text":
          // As a test, replace all instances of the word " a " with a link to rickroll video
          const aIndex = kid.value.indexOf(" a ");
          if (aIndex >= 0) {
            const before = {
              type: "text",
              value: kid.value.slice(0, aIndex),
              position,
            };
            const during = {
              type: "link",
              title: null,
              url: "https://www.youtube.com/watch?v=oHg5SJYRHA0",
              position,
              children: [
                {
                  type: "text",
                  value: " a ",
                  position,
                },
              ],
            };
            const after = {
              type: "text",
              value: kid.value.slice(aIndex + " a ".length),
              position,
            };

            node.children.splice(i, 1, before);
            node.children.splice(i + 1, 0, during);
            node.children.splice(i + 2, 0, after);
          }
          break;
        default:
          break;
      }
    }

    // STEP 2: recurse in
    for (let i = 0; i < node.children.length; i++) {
      const kid = node.children[i];
      switch (kid.type) {
        case "link":
          break;
        default:
          walk(kid);
          break;
      }
    }
    // node.children.forEach((kid) => walk(kid));
  }
}

function link(options) {
  return function transformer(tree, file) {
    if (file.history[0] === "wiki/team/monarch-wadia.md") {
      walk(tree);
    }
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
