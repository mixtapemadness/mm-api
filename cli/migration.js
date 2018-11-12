#!/usr/bin/env node
const program = require('commander');
var Promise = require('bluebird')
const config = require('app/config')
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const db = mongoose.connect(config.database.connection, {useMongoClient : true});

class MigrationCli {
    constructor() {
        program
            .version('0.0.1')
            .description('DB migrations from sql to mongo')
            .command('area:check')
            .option('-c, --code', 'Invite Code')
            .alias('areacheck')
            .description('Area Check')
            .parse(process.argv)
            .action((code) => {
                if(!code || !parseInt(code)) {
                    return this.error("Invite code is required!")
                }
                this.checkAreas(code)
            })
        program.parse(process.argv);
    }

    users(){
        console.log("migrate Users")
    }

    error(msg) {
        program.outputHelp(() => colors.red(msg));
        process.exit()
    }

    exit() {
        program.outputHelp(() => colors.green("Done.."));
        process.exit()
    }
}

return new MigrationCli()
