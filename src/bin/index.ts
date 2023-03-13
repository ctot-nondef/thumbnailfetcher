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
        .requiredOption("-p, --path <string>", "Location of the configuration")
        .option("-s, --set <string>", "Name of the query set")
        .option("-a, --all", "flag to process all sets available under path")
        .action(async (options) => {
            if (!options.all && options.set) {
                console.log(await main.fetch(options.set, options.path));
                return;
            } else if (options.all) {
                console.log(await main.fetch(null, options.path));
            }
        });
    program.command("check")
        .description("Check if thumbnails are missing for the specified query set.")
        .requiredOption("-p, --path <string>", "Location of the configuration")
        .option("-s, --set <string>", "Name of the query set")
        .option("-a, --all", "flag to process all sets available under path")
        .action(async (options) => {
            if (!options.all && options.set) {
                console.log(await main.check(options.set, options.path));
                return;
            } else if (options.all) {
                console.log(await main.check(null, options.path));
            }
        });
    program.parse();

}

run().catch((e) => {
    console.log("Error", e);
});
