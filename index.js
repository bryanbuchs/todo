#!/usr/bin/env node

// const {
//   open,
//   close,
//   readFile,
//   appendFile,
//   writeFile
// } = require('node:fs/promises')
const fs = require('node:fs/promises')
const { resolve } = require('node:path')
const { program } = require('commander')
const chalk = require('chalk')
const inquirer = require('inquirer')

// =============

const todoFile = 'TODO.md'
const todoTemplate = '# TODO\n'

const getTasks = async () => {
  const tasks = []
  const filePath = resolve(todoFile)

  try {
    const file = await fs.open(filePath)
    for await (const line of file.readLines()) {
      tasks.push(line)
    }
  } catch (e) {
    writeFile()
  }

  return tasks
    .filter(line => line.startsWith('- ['))
    .map((line, i) => ({
      name: line.substring(6).trim(),
      value: i,
      short: i,
      checked: line.startsWith('- [x]')
    }))
}

const writeFile = async (contents = todoTemplate) => {
  try {
    await fs.writeFile(todoFile, contents, 'utf8')
    // @TODO: only log Created message if no file exists
    // console.log(chalk.green(`Created new ${todoFile}`))
  } catch (err) {
    console.log(chalk.red(`Could not create ${todoFile}`))
  }
}

program
  .name('todo')
  .description('manage a simple TODO.md file')
  .version('0.1.0')

// program.action(async () => {
//   const tasks = await getTasks()
//   console.log(chalk.bold('TODO'))
//   tasks.forEach(el => {
//     switch (el.checked) {
//       case true:
//         console.log(chalk.strikethrough.cyan(`[x] ${el.name}`))
//         break
//       default:
//         console.log(chalk.white(`[ ] ${el.name}`))
//         break
//     }
//   })
// })

program
  // .command('list')
  .description('list and manage tasks')
  .action(async () => {
    const tasks = await getTasks()

    inquirer
      .prompt([
        {
          type: 'checkbox',
          name: 'checklist',
          message: 'Choose tasks to close',
          choices: tasks
        }
      ])
      .then(async answers => {
        const markdown = []
        markdown.push(todoTemplate)

        tasks.forEach((task, i) => {
          if (answers.checklist.includes(i)) {
            markdown.push(`- [x] ${task.name}`)
          } else {
            markdown.push(`- [ ] ${task.name}`)
          }
        })

        await writeFile(markdown.join('\n'))
        console.log(chalk.green(`Updated ${todoFile}`))
      })
  })

program
  .command('add')
  .description('append a new task')
  .argument('<string>', 'task label, in quotes')
  .action(async str => {
    const tasks = await getTasks()
    await fs.appendFile(todoFile, `\n- [ ] ${str.trim()}`)
    console.log(chalk.green(`Added "${str}" to ${todoFile}`))
  })

program.parseAsync()
// .then(() => {
//   console.log(chalk.red('DONE!'))
// })
