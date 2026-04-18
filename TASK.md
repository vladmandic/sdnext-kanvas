# INSTRUCTIONS

create repository instructions that can be used by ai agent such as yourself to perform tasks related to the repository. The instructions should be clear and concise.

this is a pure typescript repository with a custom ci/cd pipeline.
all code is located in the `src` directory

## Build and Lint

The repository uses pnpm as the package manager and has the following scripts defined in package.json:
- prod: builds the project using custom build script
- lint: runs eslint to check for code quality issues

each edit should run `lint` and `prod` tasks to ensure that the code is correct and can be built successfully. If there are any errors during linting or building, they should be fixed before proceeding with the next edit.

## Code Style

- Prefer existing project patterns over strict generic style rules;
