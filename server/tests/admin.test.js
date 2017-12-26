/* eslint-env node, mocha */

const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { HotspotPuzzle } = require('./../models/hotspotPuzzle');

const getPuzzle = function getPuzzle(code, status) {
  return {
    code,
    size: 'small',
    graph: {
      nodes: [],
      edges: [],
    },
    approved: status
  };
};


const setUpPuzzleData = async function setUpPuzzleData() {
  const puzzle1 = getPuzzle('1000', 'pending');
  const puzzle2 = getPuzzle('2000', 'yes');
  const puzzle3 = getPuzzle('3000', 'yes');
  const puzzle4 = getPuzzle('4000', 'pending');

  try {
    await HotspotPuzzle.remove({});
    HotspotPuzzle.create(puzzle1);
    HotspotPuzzle.create(puzzle2);
    HotspotPuzzle.create(puzzle3);
    HotspotPuzzle.create(puzzle4);
  } catch (e) {
    throw new Error('Error setting up database for tests');
  }
};

const adminTests = function (app) {
  describe('Admin View Tests', () => {
    before(setUpPuzzleData);

    describe('GET /code/admin/:status', () => {
      it('should return an empty string when no puzzles match the status', () => {
        return request(app)
          .get('/code/admin/disapproved')
          .expect(200)
          .expect((res) => {
            expect(res.text).toBe('');
          })
          .catch((e) => { throw new Error(e); });
      });

      it('should return the first puzzle with the matching status', () => {
        return request(app)
          .get('/code/admin/pending')
          .expect(200)
          .expect((res) => {
            expect(res.text).toBeTruthy();
            expect(res.text).toBe('1000');
          })
          .catch((e) => { throw new Error(e); });
      });
    });

    describe('GET /code/next/:status/:code/:direction', () => {
      it('looking forward, should return the next puzzle after the puzzle code, with the given status', () => {
        return request(app)
          .get('/code/next/pending/1000/forward')
          .expect(200)
          .expect((res) => {
            expect(res.text).toBeTruthy();
            expect(res.text).toBe('4000');
          })
          .catch((e) => { throw new Error(e); });
      });

      it('looking back, should return the previous puzzle before the puzzle code, with the given status', () => {
        return request(app)
          .get('/code/next/pending/4000/back')
          .expect(200)
          .expect((res) => {
            expect(res.text).toBeTruthy();
            expect(res.text).toBe('1000');
          })
          .catch((e) => { throw new Error(e); });
      });

      it('looking forward, should return the first puzzle with status, when puzzle with code is last', () => {
        return request(app)
          .get('/code/next/pending/4000/forward')
          .expect(200)
          .expect((res) => {
            expect(res.text).toBeTruthy();
            expect(res.text).toBe('1000');
          })
          .catch((e) => { throw new Error(e); });
      });

      it('looking back, should return the last puzzle with status, when puzzle with code is first', () => {
        return request(app)
          .get('/code/next/pending/1000/back')
          .expect(200)
          .expect((res) => {
            expect(res.text).toBeTruthy();
            expect(res.text).toBe('4000');
          })
          .catch((e) => { throw new Error(e); });
      });
    });

    describe('DELETE /hotspot/:code', () => {
      it('should delete the puzzle with the given code', () => {
        return request(app)
          .delete('/hotspot/1000')
          .expect(200)
          .expect((res) => {
            expect(res.body.puzzle).toBeTruthy();
            expect(res.body.puzzle.code).toBe('1000');
          })
          .then(async (response) => {
            try {
              const puzzles = await HotspotPuzzle.find({ code: '1000' });

              expect(puzzles).toEqual([]);
            } catch (e) {
              throw new Error('Todo was not deleted');
            }
          })
          .catch((e) => {
            throw new Error('Todo was not deleted');
          });
      });
    });

    describe('PATCH /hotspot/approve/:code/:approved', () => {
      before(() => {
        HotspotPuzzle.create(getPuzzle('5000', 'no'));
      });

      it('should update pending puzzle to be approved', () => {
        return request(app)
          .patch('/hotspot/approve/4000/yes')
          .expect(200)
          .expect((res) => {
            expect(res.body.puzzle).toBeTruthy();
            expect(res.body.puzzle.code).toBe('4000');
          })
          .then(async (response) => {
            try {
              const puzzle = await HotspotPuzzle.findOne({ code: '4000' });
              expect(puzzle).toBeTruthy();
              expect(puzzle.code).toBe('4000');
              expect(puzzle.approved).toBe('yes');
            } catch (e) {
              throw new Error(e);
            }
          })
          .catch((e) => {
            throw new Error(e);
          });
      });

      it('should update disapproved puzzle to be approved', () => {
        return request(app)
          .patch('/hotspot/approve/5000/yes')
          .expect(200)
          .expect((res) => {
            expect(res.body.puzzle).toBeTruthy();
            expect(res.body.puzzle.code).toBe('5000');
          })
          .then(async (response) => {
            try {
              const puzzle = await HotspotPuzzle.findOne({ code: '5000' });
              expect(puzzle).toBeTruthy();
              expect(puzzle.code).toBe('5000');
              expect(puzzle.approved).toBe('yes');
            } catch (e) {
              throw new Error(e);
            }
          })
          .catch((e) => {
            throw new Error(e);
          });
      });
    });
  });
};

module.exports = adminTests;
