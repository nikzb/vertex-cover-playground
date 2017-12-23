const _ = require('lodash');
const { HotspotPuzzle } = require('./../models/hotspotPuzzle');

const generateCode = function generateCode(res, callback) {
  let newCode = '';
  let alphaNumChar;
  for (let i = 0; i < 4; i+=1) {
    let randNum = _.random(1, 35);
    // If the random number is in the range 1-9, turn the digit into a string
    if (randNum < 10) {
      alphaNumChar = `${randNum}`;
    } else { // Turn the random number into a letter
      randNum += 55;
      alphaNumChar = String.fromCharCode(randNum);
    }
    newCode += alphaNumChar;
  }
  // The code CODE is reserved for the Code.org puzzle
  // Avoid using cursewords as well
  const curseWords = ['SHIT', 'FUCK', 'CUNT', 'CRAP', 'DICK'];
  if (newCode === 'CODE' || curseWords.indexOf(newCode) !== -1) {
    generateCode(res, callback);
  } else {
    // Check if code is already in use. If so, generate another one
    HotspotPuzzle.findOne({ code: newCode }).then((puzzle) => {
      if (!puzzle) {
        callback(res, newCode);
      } else {
        generateCode(res, callback);
      }
    }).catch((e) => { throw new Error(e); });
  }
};

module.exports = { generateCode };
