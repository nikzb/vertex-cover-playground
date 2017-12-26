/* eslint-env node, mocha */

const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { HotspotPuzzle } = require('./../models/hotspotPuzzle');

const getPuzzle = function getPuzzle(code, size) {
  return {
    code,
    size,
    graph: {
      nodes: [],
      edges: [],
    },
    approved: 'yes'
  };
};


const setUpPuzzleData = async function setUpPuzzleData() {
  const puzzle1 = getPuzzle('1000', 'small');
  const puzzle2 = getPuzzle('2000', 'x-large');
  const puzzle3 = getPuzzle('3000', 'medium');
  const puzzle4 = getPuzzle('4000', 'large');
  const puzzle5 = getPuzzle('5000', 'small');

  try {
    await HotspotPuzzle.remove({});
    HotspotPuzzle.create(puzzle1);
    HotspotPuzzle.create(puzzle2);
    HotspotPuzzle.create(puzzle3);
    HotspotPuzzle.create(puzzle4);
    HotspotPuzzle.create(puzzle5);
  } catch (e) {
    throw new Error('Error setting up database for tests');
  }
};

const codeTests = function codeTests(app) {
  describe('Code Fetching Tests', () => {
    before(setUpPuzzleData);

    describe('GET /code/new', () => {
      it('should return a 4 character code', (done) => {
        request(app)
          .get('/code/new')
          .expect(200)
          .expect((res) => {
            expect(res.text).toBeTruthy();
            expect(res.text.length).toBe(4);
          })
          .end(done);
      });
    });

    describe('POST /code/random/:size', () => {
      it('should return a puzzle code for a puzzle with the given size', () => {
        return request(app)
          .post('/code/random/medium')
          .set('Content-Type', 'application/json')
          .send([])
          .expect(200)
          .expect((res) => {
            expect(res.text).toBeTruthy();
            expect(res.text).toBe('3000');
          })
          .catch((e) => { throw new Error(e); });
      });

      it('should return a puzzle code for a puzzle with the given size, but not in list to avoid', () => {
        return request(app)
          .post('/code/random/small')
          .set('Content-Type', 'application/json')
          .send([{ code: '1000' }])
          .expect(200)
          .expect((res) => {
            expect(res.text).toBeTruthy();
            expect(res.text).toBe('5000');
          })
          .catch((e) => { throw new Error(e); });
      });

      it('should return a puzzle code for a puzzle with the given size even when all puzzles of that size are in list to be avoided', () => {
        return request(app)
          .post('/code/random/medium')
          .set('Content-Type', 'application/json')
          .send([{ code: 3000 }])
          .expect(200)
          .expect((res) => {
            expect(res.text).toBeTruthy();
            expect(res.text).toBe('3000');
          })
        .catch((e) => { throw new Error(e); });
      });
    });
  });
};

module.exports = codeTests;
