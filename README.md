# TODO

- `npm i -g bryanbuchs/todo`

CLI to manage a `TODO.md` file. Tasks can be added or toggled completed via interactive prompts. A task can also be added using a cli argument.

## Usage

`> todo`

...will list the todos in your file as a multiselect prompt. Choose the tasks to complete, and then save back to the file

`> todo add`

...will open a prompt to add a new task

`> todo add "do this thing"`

...will append a new task to the end of your file

When running any action, if the `TODO.md` file does not exist one will be created.

`TODO.md` is a markdown file, which can be edited manually outside of this CLI.
