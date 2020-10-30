module.exports = function replaceString(
  targetAst,
  targetText,
  renderer,
  nodeMatcher = () => true
) {
  visit(targetAst);

  function visit(node) {
    // do stuff based on node type

    if (node.children && node.children.length) {
      for (let i = 0; i < node.children.length; i++) {
        const kid = node.children[i];
        const { position } = kid;

        // STEP 1: Replace nodes if needed
        switch (kid.type) {
          // In case of text type, replace stuff if needed
          case "text":
            // As a test, replace all instances of targetText with a link to rickroll video
            const aIndex = kid.value.indexOf(targetText);
            if (aIndex >= 0) {
              const before = {
                type: "text",
                value: kid.value.slice(0, aIndex),
                position,
              };
              const during = renderer(kid);
              const after = {
                type: "text",
                value: kid.value.slice(aIndex + targetText.length),
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
        if (nodeMatcher(kid)) {
          visit(kid);
        }
      }
    }
  }
};
