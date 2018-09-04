#!/usr/bin/env node
const program = require('commander');
const { prompt } = require('inquirer');
var Promise = require('bluebird')
const config = require('app/config')
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const db = mongoose.connect(config.database.connection, {useMongoClient : true});
var colors = require('colors');
var roomTypes = require('../app/modules/helpers/datasets/roomTypes.json')

const UnitModel = require('../app/modules/Unit').UnitModel(mongoose)

class UnitCLI {
    constructor() {

        this.config = {
            quantity: 2
        }

        program
            .version('0.0.1')
            .description('Tenant management system');

        program
            .command('reset:unit')
            .alias('resetunit')
            .description('Reset unit')
            .action(() => {
                this.countUnits().then(count => {
                    if (count) {
                        prompt({
                            type : 'confirm',
                            name : 'drop',
                            message : 'Drop collection and re-insert units?'
                        }).then((data) => {
                            if (data.drop) {
                                this.dropUnits().then(() => this.creatUnits())
                            } else {
                                this.creatUnits()
                            }
                        })
                    } else {
                        this.creatUnits()
                    }
                })
            })

        program.parse(process.argv);
    }


    countUnits() {
        return UnitModel.count()
                    .exec((err, count) => {
                        Promise.resolve(count)
                    });
    }

    insertUnit(i) {
        let unit = new UnitModel()
        unit.unitNumber = i+1

        unit.details = {
            totalFloors: this.randomInt(0, 3),
            basement: this.randomBool(),
            bedrooms:{
                total: this.randomInt(0, 3),
                master: this.randomBool(),
            },
            fullBaths:{
                total: this.randomInt(0, 3),
                master: this.randomBool(),
            },
            halfBaths: this.randomInt(0, 3),
            otherRooms: [],
        }

        unit.rooms = [{
            title: 'Master Bedroom',
            location: 'Front',
            floor: this.randomInt(0, 3),
            items: roomTypes[0].items
        }]

        return unit.save()
    }

    randomInt(min, max) {
        return Math.floor(Math.random() * max) + min
    }

    randomBool() {
        return Math.random() >= 0.5
    }

    dropUnits() {
        return UnitModel.collection.drop();
    }

    async creatUnits() {
        for (let index = 0; index < parseInt(this.config.quantity); index++) {
            let tets = await this.insertUnit(index)
        }

        this.exit()
    }

    exit() {
        program.outputHelp(() => colors.green("Done.."));
        process.exit()
    }
}

return new UnitCLI()
