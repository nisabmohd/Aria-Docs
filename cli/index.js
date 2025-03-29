#!/usr/bin/env node

import inquirer from "inquirer";
import { program } from "commander";
import degit from "degit";
import path from "path";
import ora from "ora";
import chalk from "chalk";

const templateOptions = {
  master: chalk.blue("Advanced Docs"),
  "minimal-docs": chalk.green("Minimal Docs"),
  version_docs: chalk.yellow("Versioned Docs"),
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
    const { version } = await inquirer.prompt([
      {
        type: "list",
        name: "version",
        message:
          "Which version of the Ariadocs template would you like to use?",
        choices: Object.values(templateOptions),
      },
    ]);

    // Map user choice to branch
    const branch =
      Object.keys(templateOptions).find(
        (key) => templateOptions[key] === version
      ) || "master"; // Fallback to master if no branch found

    // Correct repo URL for degit
    const repo = `github:nisabmohd/Aria-Docs#${branch}`;
    const emitter = degit(repo);
    const projectPath = path.resolve(process.cwd(), projectDirectory);

    console.log(
      `Creating a new Ariadocs project in ${projectPath} from the ${branch} branch...`
    );

    // Create spinner
    const spinner = ora(`Cloning ${chalk.magenta(branch)}...`).start();

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
