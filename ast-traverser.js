var unified = require("unified");
var markdown = require("remark-parse");
var remark2rehype = require("remark-rehype");
var doc = require("rehype-document");
var format = require("rehype-format");
var html = require("rehype-stringify");
var report = require("vfile-reporter");
var findDown = require("vfile-find-down");

findDown.all(".md", "./wiki", (err, files) => {
  if (err) {
    console.error(err);
  } else {
    console.log(files);
  }
});

// unified()
//   .use(markdown)
//   .use(remark2rehype)
//   .use(doc, { title: "👋🌍" })
//   .use(format)
//   .use(html)

//   .process("# Hello world!", function (err, file) {
//     console.error(report(err || file));
//     console.log(String(file));
//   });
