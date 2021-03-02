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
  .option("reptFile", {
    type: "boolean",
    description: "should get template params from rept.config",
    default: true,
  })
  .help()
  .alias("h", "help")
  .strict();

repoTpl(argv).catch((e) => {
  process.exitCode = 1;
  console.error(e);
});
