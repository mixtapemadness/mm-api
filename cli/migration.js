#!/usr/bin/env node
const program = require("commander");
var Promise = require("bluebird");
const config = require("app/config");
const mongoose = require("mongoose");
var mysql = require("mysql");

mongoose.Promise = global.Promise;
const db = mongoose.connect(
  config.database.connection,
  { useMongoClient: true }
);

mongoose.connection.on("connected", error => {
  console.log(`connection established`);
});

var connection = mysql.createConnection({
  host: "mixtapemadnessdb.cc1bp9jszivw.eu-west-1.rds.amazonaws.com",
  port: 3306,
  user: "mixuser",
  password: "eSlc7_52",
  database: "mixtapemadnessdb"
})

connection.connect(err => {
  if (err) {
    console.error("error connecting: " + err)
    return
  }
})

const artistModel = require("app/modules/artistDetails").artistDetailsModel(
  db,
  mongoose
);

class MigrationCli {
  constructor() {
    program
      .version("0.0.1")
      .description("DB migrations from sql to mongo")
      .command("Artists")
      .alias("artists migration")
      .description("Artists Migration")
      .parse(process.argv)
      .action(() => {
        this.artists(5);
      });

    program
      .version("0.0.1")
      .description("DB migrations from sql to mongo")
      .command("artistsCategorys")
      .alias("migrate Artists Categorys")
      .description("Artists Categorys Migration")
      .parse(process.argv)
      .action(() => {
        this.artistsCategorys(5);
      });

    program
      .parse(process.argv);
  }

  artists(limit) {
    connection.query(`SELECT * FROM artist_detail LIMIT ${limit}`, function(error,results) { 
      if (error) { console.log(error); return }
      results.map(item => {
          const artistDetails = artistModel({...item })
          artistDetails.save(err => {
            if (err) {console.log("err", err); return }
            console.log("saaaaveeeedd")
          })
        })
      })
    }
 
    artistsCategorys(limit) {
      connection.query(`SELECT * FROM artist_categories LIMIT ${limit}`, function(error,results) { 
        if (error) { console.log(error); return }
        console.log('results', results)

        // results.map(item => {
        //     const artistDetails = artistModel({...item })
        //     artistDetails.save(err => {
        //       if (err) {console.log("err", err); return }
        //       console.log("saaaaveeeedd")
        //     })
        //   })
        })
      }

  error(msg) {
    program.outputHelp(() => colors.red(msg));
    process.exit();
  }

  exit() {
    program.outputHelp(() => colors.green("Done.."));
    process.exit();
  }
}

return new MigrationCli()
