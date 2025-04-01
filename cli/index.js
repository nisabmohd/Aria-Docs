#!/usr/bin/env node

import inquirer from "inquirer";
import { program } from "commander";
import degit from "degit";
import path from "path";
import ora from "ora";
import chalk from "chalk";

const templateOptions = {
  "nextjs-base": chalk.blue("Next.js Base"),
  "nextjs-i18n": chalk.green("Next.js i18n"),
  "nextjs-minimal": chalk.yellow("Next.js Minimal"),
  "nextjs-versioning": chalk.cyan("Next.js Versioning"),
  "react-router-base": chalk.magenta("React Router Base"),
  "tanstack-start-base": chalk.red("TanStack Start Base"),
};

program
  .version("1.0.0")
  .description("CLI to create a new Ariadocs project")
  .argument(
    "<project-directory>",
    "Directory to create the new Ariadocs project"
  )
  .action(async (projectDirectory) => {
    // Prompt user to choose template
    const { template } = await inquirer.prompt([
      {
        type: "list",
        name: "template",
        message:
          "Which version of the Ariadocs template would you like to use?",
        choices: Object.values(templateOptions),
      },
    ]);

    // Map user choice to folder
    const folder =
      Object.keys(templateOptions).find(
        (key) => templateOptions[key] === template
      ) || "nextjs-base"; // Fallback to nextjs-base if no folder found

    // Correct repo URL for degit
    const repo = `github:nisabmohd/Aria-Docs/${folder}`;
    const emitter = degit(repo);
    const projectPath = path.resolve(process.cwd(), projectDirectory);

    console.log(
      `Creating a new Ariadocs project in ${projectPath} from the ${folder} folder...`
    );

    // Create spinner
    const spinner = ora(`Cloning ${chalk.magenta(folder)}...`).start();

    try {
      await emitter.clone(projectPath);
      spinner.succeed(
        `Ariadocs project successfully created in ${projectPath}!`
      );

      // Prompt user to run npm commands
      console.log(chalk.blue("\nNext steps:"));
      console.log(`1. Navigate to your project directory:`);
      console.log(`   cd ${projectDirectory}`);
      console.log(`2. Install dependencies:`);
      console.log(`   npm install`);
      console.log(`3. Start the development server:`);
      console.log(`   npm run dev`);
    } catch (err) {
      spinner.fail("Error creating project:");
      console.error(err.message);
    }
  });

program.parse(process.argv);
