import { Meteor } from 'meteor/meteor';
import fs from 'fs';
import json2csv from 'json2csv';

import { getNewCsv } from '../imports/iapro-flatten-by-officer.js';
import { mergeGovIAPro } from '../imports/merge-datadotgov-iapro.js';

// merge-datadotgov-iapro
const nolaDotGovPath = "NOLADOTGOV_UoF2016.csv";
const iaproPath = "Reformated_1485549336347_IAPRO_UoF2016_Format2.csv";

// iapro-flatten-by-officer
const csvPath = "IAPRO_UoF2016_Format2.csv"
const outPath = "/media/sf_Jakob_Rosenzweig/UoF/2016/Reformated_" + new Date().getTime() + "_" + csvPath;

Meteor.startup(() => {
  console.log("Starting up.");

  // getNewCsv(csvPath, newCsv => {
  //   const csv = json2csv({ data: newCsv });

  //   fs.writeFile(outPath, csv, function(err) {
  //     if (err) throw err;
  //     console.log('File saved to ' + outPath);
  //   });

  // });

  mergeGovIAPro(iaproPath, nolaDotGovPath, );
});

