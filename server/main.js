import { Meteor } from 'meteor/meteor';
import csv from 'csv';
import fs from 'fs';
import json2csv from 'json2csv';

const getNewCsv = (callback) => {
  const csvPath = "FILENAME"
  const csvFile = Assets.getText(csvPath)
  let newCsv = []

  // Read IAPro CSV which contains multiple officers and uses of force for each FTN
  // Create a new CSV which has one row per use of force
  csv.parse(csvFile, (error, data) => {
    _.each(data, row => {
      const officersRaw = row[3].split("\n")
      const usesOfForce = row[4].split("\n")

      let i = 0
      let currentOfficer

      _.each(usesOfForce, f => {

        // Empty lines are used to indicate that the use of force corresponds to the
        // officer most recently listed in the cell
        if(officersRaw[i]) {
          currentOfficer = officersRaw[i]
        }

        // Create a new row
        // Ignore empty lines
        if(f) {
          const officerRegex = /(?:(OFFICER|SERGEANT|POLICE SERGEANT|POLICE OFFICER|ASSISTANT SUPT OF POLICE|POLICE LIEUTENANT|POLICE RECRUIT FIELD|POLICE CAPTAIN|Reserve Officers)\s(?:\d\s)?)(\w[\s\w]*)/
          const officerMatch = currentOfficer.match(officerRegex)
          let officerName = "Unknown"
          let officerRank = "Unknown"

          if(officerMatch) {
            officerRank = officerMatch[1]
            officerName = officerMatch[2]
          }

          const ftn = {
            pibNum: row[0],
            itemNum: row[8],
            date_occurred: new Date(row[1]),
            officerName,
            officerRank,
            typeOfForce: f,
            location: row[13]
          }
          newCsv.push(ftn)
        }

        i++
      })
    })
    callback(newCsv)
  });
}

Meteor.startup(() => {
  console.log("starting up ftn");

  getNewCsv(newCsv => {
    var result = json2csv({ data: newCsv });

    var csv = json2csv({ data: newCsv });

    fs.writeFile('PATH_TO_FILE', csv, function(err) {
      if (err) throw err;
      console.log('file saved');
    });

  })
});
