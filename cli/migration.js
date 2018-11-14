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

const artistModel = require("app/modules/artistDetails").artistDetailsModel(
  db,
  mongoose
);
class MigrationCli {
  constructor() {
    program
      .version("0.0.1")
      .description("DB migrations from sql to mongo")
      .command("migrateArtists")
      .alias("artists migration")
      .description("Artists Migration")
      .parse(process.argv)
      .action(() => {
        this.artists(5);
      });
    program.parse(process.argv);
  }

  artists(limit) {
    var connection = mysql.createConnection({
      host: "mixtapemadnessdb.cc1bp9jszivw.eu-west-1.rds.amazonaws.com",
      port: 3306,
      user: "mixuser",
      password: "eSlc7_52",
      database: "mixtapemadnessdb"
    });

    connection.connect(err => {
      if (err) {
        console.error("error connecting: " + err);
        return;
      }
    });

    connection
      .query(`SELECT * FROM artist_detail LIMIT ${limit}`)
      // .then(item => console.log("item", item));
    , function(
      error,
      results,
      fields
    ) {
      if (error) {
        console.log(error);
        return;
      }
      results.map(item => {
        console.log("item", item.RowDataPacket);

        const artistDetails = artistModel({
          ...item
        });
        artistDetails.save(err => {
          if (err) {
            console.log("err", err);
            return;
          }
          console.log("saaaaveeeedd");
        });
      });
    });
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

return new MigrationCli();
