#!/usr/bin/env node

'use strict'

const fs = require('node:fs/promises')
const { resolve } = require('node:path')
const { program } = require('commander')
const chalk = require('chalk')
const prompts = require('prompts')

// =============

const todoFile = 'TODO.md'
const todoTemplate = '# TODO\n'

// read todoFile
// get lines that are a markdown checklist
// map an array of objects `{ title, value, selected }`
const getTasks = async () => {
  const tasks = []
  const filePath = resolve(todoFile)

  try {
    const file = await fs.open(filePath)
    for await (const line of file.readLines()) {
      tasks.push(line)
    }
  } catch (e) {
    // if no file, create one
    writeFile()
  }

  return tasks
    .filter(line => line.startsWith('- ['))
    .map((line, i) => ({
      title: line.substring(6).trim(),
      value: i,
      selected: line.startsWith('- [x]')
    }))
}

// write the contents argument value to todoFile
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

program
  // .command('list')
  .description('list and manage tasks')
  .action(async () => {
    const tasks = await getTasks()

    const answers = await prompts({
      type: 'multiselect',
      name: 'tasks',
      message: 'Choose tasks to close',
      choices: tasks,
      instructions: false,
      hint: '- Space to select. Return to submit'
    })

    if (answers && 'tasks' in answers) {
      const markdown = []
      markdown.push(todoTemplate)

      tasks.forEach((task, i) => {
        task.state = answers.tasks.includes(i) ? '- [x]' : '- [ ]'
        markdown.push(`${task.state} ${task.title}`)
      })
      markdown.push('')

      await writeFile(markdown.join('\n'))
      console.log(chalk.green(`Updated ${todoFile}`))
    }
  })

program
  .command('add')
  .description('append a new task')
  .argument('[string]', 'task label, in quotes')
  .action(async task => {
    if (!task) {
      const prompt = await prompts({
        type: 'text',
        name: 'task',
        message: 'Task:'
      })
      task = prompt.task
    }

    if (task) {
      const tasks = await getTasks()
      await fs.appendFile(todoFile, `- [ ] ${task.trim()}\n`)
      console.log(chalk.green(`Added "${task}" to ${todoFile}`))
    }
  })

program.parseAsync()
