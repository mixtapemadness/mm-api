#!/usr/bin/env node
const program = require('commander');
const { prompt } = require('inquirer');
var Promise = require('bluebird')
const config = require('app/config')
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const db = mongoose.connect(config.database.connection, {useMongoClient : true});
var colors = require('colors');
var UserModel = require('../app/modules/user').UserModel(mongoose)

function error(msg) {
  program.outputHelp(() => colors.red(msg));
  process.exit()
}

function exit(message) {
  program.outputHelp(() => colors.green(message));
  process.exit()
}


class UserCLI {

  constructor() {

    program
      .version('0.0.1')
      .description('Set user super admin')
      .command('set:admin <email> <isadmin>')
      .alias('setadmin')
      .parse(process.argv)
      .action((email, isadmin) => {
          if (!email) {
            return error("Email is required as argument  ex : setadmin --beka@tomashvili.com")
          }
          this.setAdmin(email, isadmin)

      })
      program.parse(process.argv);
  }

  setAdmin(email, isadmin) {
    UserModel.findOne({ 'email': email })
    .then((user) => {
        user.isSuperAdmin = isadmin
        return user.save()
    })
    .then(user => {
       console.log('user : >>> ', user)
       exit(`Email ${user.email} is Done!!`)
    })
    .catch(err => {
      exit("Something bad happened or user not found :", err)
    })
  }

}

return new UserCLI()
