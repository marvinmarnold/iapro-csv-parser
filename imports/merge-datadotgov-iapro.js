import { Meteor } from 'meteor/meteor';
import csv from 'csv';

export const mergeGovIAPro = (iaproPath, govPath, callback) => {

  buildIAProObj(iaproPath, Meteor.bindEnvironment(iObj => {
    mergeGovIObj(govPath, iObj, callback);
  }));
}

const buildIAProObj = (iaproPath, callback) => {
  const csvFile = Assets.getText(iaproPath)
  let iObj = {};

  // Read IAPro CSV which contains multiple officers and uses of force for each FTN
  // Create a new CSV which has one row per use of force
  csv.parse(csvFile, (error, data) => {
    _.each(data, row => {

      const ftn = row[0].trim();
      const name = row[3].trim();
      const forceType = row[6].trim();
      const summary = row[8].trim();
      const extraInfo = { name } //, summary }

      if(!iObj[ftn]) {
        iObj[ftn] = {}
      }

      if(iObj[ftn][forceType]) {
        iObj[ftn][forceType].push(extraInfo) 
      } else {
        iObj[ftn][forceType] = [extraInfo];
      }

      // if(ftn === "FTN2016-0001") {
      //   console.log(iObj[ftn])
      //   console.log(iObj[ftn]['CEW Exhibited/Laser'])
      // }
      
    });
    callback(iObj);
  });
}

const mergeGovIObj = (govPath, iObj, callback) => {
  const csvFile = Assets.getText(govPath)

  let matchCount = 0;
  let ambigCount = 0;
  let forceCount = 0;
  let ftnCount = 0;

  csv.parse(csvFile, (error, data) => {
    _.each(data, row => {

      const ftn = row[0].trim();
      const forceType = row[13].trim();

      const ftnMatch = iObj[ftn];
      if(ftnMatch) {
        const forceMatch = ftnMatch[forceType];

        if(forceMatch) {

          if(forceMatch.length === 1) {
            matchCount++;
            console.log("Matched: " + forceMatch[0].name + " to FTN=" + ftn + " and forceType=" + forceType);
          } else {
            ambigCount++;
            // console.log("Ambiguous result. Multiple matching officers with FTN=" + ftn + " and forceType=" + forceType);
          }
          
        } else {
          forceCount++;
          // if(ftn === "FTN2016-0001") {
            console.log("No FTN found in IAPro data with FTN=" + ftn + " and forceType=" + forceType);
          //   console.log(iObj["FTN2016-0001"])
          // }
        }
        
      } else {
        ftnCount++;
        console.log("No FTN found in IAPro data with FTN=" + ftn)
      }
      
    });

    console.log("\nResults summary:")
    console.log("Matched: " + matchCount);
    console.log("Ambiguous (multiple officers): " + ambigCount);
    console.log("No matching force type: " + forceCount);
    console.log("No matching FTN: " + ftnCount);
  });
}
// open iapro
// const iaproData = {
// 	FTN: {
// 		TypeOfForce: [
// 			{name, summary}
// 			{name, summary}
// 		]
// 	}
// }

// loop through nolaDotGov
// if iaproData[FTN][TypeOfForce].length === 1, copy name and summary
// else write ambiguous result