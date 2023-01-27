#! /usr/bin/env node

import boxen from 'boxen'
const figlet = require('figlet')
const chalk = require('chalk')
const yargs = require('yargs')
const { linkController } = require('./controller/link.controller')
const clui = require('clui')

const spinner = new clui.Spinner('please wait...', ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'])

figlet.text(
    'SG Link',
    {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 80,
        whitespaceBreak: true
    },
    function (err, data) {
        if (err) {
            console.log('Something went wrong...')
            console.dir(err)
            return
        }
        console.log(
            boxen(chalk.green(data), {
                padding: {
                    right: 2,
                    left: 2,
                    top: 1,
                    bottom: 1
                },
                dimBorder: false,
                borderColor: 'green'
            })
        )
    }
)

yargs
    .usage('$0 <cmd> [args]')
    .command(
        'link',
        'generate links for your apps',
        () => {},
        async () => {
            spinner.start()
            await linkController()
            spinner.stop()
            console.log(chalk.white('finished...'))
        }
    )
    .help()
    .version().argv
