const _ = require('lodash');
const { HotspotPuzzle } = require('./../models/hotspotPuzzle');

const generateCode = function generateCode(res, callback) {
  let newCode = '';
  let alphaNumChar;
  for (let i = 0; i < 4; i+=1) {
    let randNum = _.random(0, 35);
    if (randNum < 10) {
      alphaNumChar = `${randNum}`;
    } else {
      randNum += 55;
      alphaNumChar = String.fromCharCode(randNum);
    }
    newCode += alphaNumChar;
  }
  HotspotPuzzle.findOne({ code: newCode }).then((puzzle) => {
    if (!puzzle) {
      callback(res, newCode);
    } else {
      generateCode(res, callback);
    }
  }).catch(e => 'Error');
};

module.exports = { generateCode };
