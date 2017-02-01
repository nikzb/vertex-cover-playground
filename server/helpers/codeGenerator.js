const _ = require('lodash');
const {HotspotPuzzle} = require('./../models/hotspotPuzzle');

const generateCode = function (res, callback) {
  newCode = '';
  let alphaNumChar;
  for (let i = 0; i < 4; i++) {
    let randNum = _.random(0, 35);
    if (randNum < 10) {
      alphaNumChar = '' + randNum;
    } else {
      randNum += 55;
      alphaNumChar = String.fromCharCode(randNum);
    }
    newCode += alphaNumChar;
  }
  console.log("After loop that creates new code: " + newCode);
  HotspotPuzzle.findOne({newCode}).then((puzzle) => {
    if (!puzzle) {
      console.log("About to return new code: " + newCode);
      return callback(res, newCode);
    }
    else {
      console.log("Recursive call to generate code: " + newCode);
      return callback(res, generateCode(res, callback));
    }
  }).catch((e) => {
    return 'Error';
  });
}

module.exports = {generateCode};
