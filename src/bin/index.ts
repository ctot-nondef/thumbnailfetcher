#!/usr/bin/env node

import {Command} from "commander";

const program = new Command();

import {instance as main} from "../index";

async function run() {
    program
        .name("thumbnailfetcher")
        .description("command line tool to fetch thumbnail images based on API input")
        .version("0.0.1");
    program.command("fetch")
        .description("Fetch thumbnail images for a configured vufind query set")
        .argument("<configpath>", "Location of the configuration")
        .argument("<setname>", "Name of the query set")
        .option("--all", "fetch all sets in the referenced config")
        .action(async (configpath: string, set: string, options) => {
            if (!options.all && set) {
                console.log(await main.fetch(set, configpath));
                return;
            } else {
                console.log(await main.fetch(null, configpath));
            }
        });
    program.command("check")
        .description("Check if thumbnails are missing for the specified query set.")
        .argument("<configpath>", "Location of the configuration")
        .argument("<setname>", "Name of the query set")
        .option("--all", "fetch all sets in the referenced config")
        .action(async (configpath: string, set: string, options) => {
            if (!options.all && set) {
                console.log(await main.fetch(set, configpath));
                return;
            } else {
                console.log(await main.fetch(null, configpath));
            }
        });
    program.parse();

}

run().catch((e) => {
    console.log("Error", e);
});
