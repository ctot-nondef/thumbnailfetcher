#!/usr/bin/env node

import {Command} from "commander";

const program = new Command();

import {instance as main} from "../index";

async function run() {
    program
        .name("thumbnailfetcher")
        .description("command line tool to fetch thumbnail images based on VuFinds API input")
        .version("0.0.1");
    program.command("fetch")
        .description("Fetch thumbnail images for a configured vufind query set")
        .argument("<string>", "Name of the query set")
        .action(async (str: string) => {
            console.log(await main.fetch(str));
        });
    program.command("check")
        .description("Check if all thumbnails are missing for the specified query set.")
        .argument("<string>", "Name of the query set")
        .action(async (str: string) => {
            console.log(await main.check(str));
        });
    program.parse();

}

run().catch((e) => {
    console.log("Error", e);
});
