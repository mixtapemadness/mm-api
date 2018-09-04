#!/usr/bin/env node
const program = require('commander');
const { prompt } = require('inquirer');
var Promise = require('bluebird')
const config = require('app/config')
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const db = mongoose.connect(config.database.connection, {useMongoClient : true});
var colors = require('colors');

const TenantModel = require('../app/modules/tenant').TenantModel(mongoose)

class TenantCLI {
    constructor() {

        program
            .version('0.0.1')
            .description('Tenant management system')
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

    checkAreas(code) {
        TenantModel.findOne({'lease.inviteCode': code})
            .then((tenant) => {
                const leases = tenant.lease.map(lease => {
                    if(lease.inviteCode == code) {
                        lease.rooms = lease.rooms.map(room => {
                            room.items = room.items.map(item => {
                                if(!item.selectCondition) {
                                    item.selectCondition = "N/A"
                                }
                                return item
                            })
                            return room
                        })
                    }
                    return lease
                })
                tenant.lease = leases
                return tenant.save()
            })
            .then((tenant) => {
                const leases = tenant.lease.map(lease => {
                    if(lease.inviteCode == code) {
                        lease.rooms = lease.rooms.map(room => {
                            room.progress = this.calculateRoomProgress(room)
                            return room
                        })
                    }
                    return lease
                })
                tenant.lease = leases
                return tenant.save()
            })
            .then(tenant => {
                const leases = tenant.lease.map(lease => {
                if(lease.inviteCode == code) {
                    lease.progress = this.calculateLeaseProgress(lease)
                    }
                    return lease
                })
                tenant.lease = leases
                return tenant.save()
            })
            .then(tenant => {
                this.exit()
            })
            .catch(this.error)
    }

    calculateLeaseProgress(lease) {
		let progress = 0

		const sumCompleted = lease.rooms.length*100

		function sum(prev, next){
			return prev + next;
		}
		function amount(item){
			return item.progress;
		}

		const completed = lease.rooms.map(amount).reduce(sum);

		progress = parseInt(completed/sumCompleted * 100)

		return progress
	}

	calculateRoomProgress(room) {
		let progress = 0

		const sum = room.items.length
		let completed = 0
		room.items.map(item => {
			if(item.selectedOption || item.images.length > 0) {
				completed += 1
			}
		})
		progress = parseInt(completed/sum * 100)
		return progress
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

return new TenantCLI()
