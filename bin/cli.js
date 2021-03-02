#!/usr/bin/env node

const yargs = require("yargs");
const { repoTpl } = require("../lib/rept");

const { argv } = yargs
  .option("destination", {
    type: "string",
    description: "destination directory",
    alias: "d",
    demandOption: true,
  })
  .option("repo", {
    type: "string",
    description: "git repo to use",
    alias: "r",
    demandOption: true,
  })
  .option("branch", {
    type: "string",
    description: "git repo branch",
    alias: "b",
    default: "",
  })
  .option("subDir", {
    type: "string",
    description: "sub directory to use",
    alias: "s",
    default: "",
  })
  .option("templateProcessor", {
    type: "string",
    description: "request for custom template processor",
    alias: "t",
    default: "",
  })
  .option("inputProcessor", {
    type: "string",
    description: "request for custom user input processor",
    alias: "i",
    default: "",
  })
  .help()
  .alias("h", "help")
  .strict();

run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

async function run() {
  const {
    destination,
    repo,
    subDir,
    branch,
    templateProcessor,
    inputProcessor,
  } = argv;

  const tpr = templateProcessor
    ? require(templateProcessor)
    : () => ({
        tpl(id) {
          return id;
        },
        filter() {
          return true;
        },
      });

  const ipr = inputProcessor ? require(inputProcessor) : { userInput() {} };
  const userInput = (await ipr.userInput(argv)) || {};

  repoTpl({
    outDir: destination,
    repo: repo,
    internalPath: subDir,
    ...tpr(userInput),
    branch,
  });
}
