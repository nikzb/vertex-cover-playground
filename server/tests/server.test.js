const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {HotspotPuzzle} = require('./../models/hotspotPuzzle');

const puzzle = {
  code: 1,
  size: "small",
  graph: {
    nodes: [
      {id: 1, group: "noService", original: false},
      {id: 2, group: "noService", original: true},
      {id: 3, group: "noService", original: true},
      {id: 4, group: "noService", original: false},
      {id: 5, group: "noService", original: false},
      {id: 6, group: "noService", original: false}
    ],
    edges: [
      {from: 1, to: 2},
      {from: 1, to: 5},
      {from: 2, to: 4},
      {from: 3, to: 5},
      {from: 3, to: 6}
    ]
  }
}

beforeEach((done) => {
  HotspotPuzzle.remove({}).then(() => {
    HotspotPuzzle.create(puzzle);
  }).then(() => done());
});

describe('GET /hotspot/:code', () => {
  it('should return puzzle with given code', (done) => {
    const code = 1;

    request(app)
      .get(`/hotspot/${code}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.puzzle.graph).toExist();
        expect(res.body.puzzle.code).toBe(code);
        expect(res.body.puzzle.size).toBeA('string');
      })
      .end(done);
  });

  it('should return 404 if puzzle not found', (done) => {
    request(app)
      .get('/hotspot/2')
      .expect(404)
      .end(done);
  });
});

describe('POST /hotspot', () => {
  it('should create a new puzzle', (done) => {
    const newPuzzle = {
      code: 2,
      size: "small",
      graph: {
        nodes: [
          {id: 1, group: "noService", original: false},
          {id: 2, group: "noService", original: true},
          {id: 3, group: "noService", original: true},
          {id: 4, group: "noService", original: false},
          {id: 5, group: "noService", original: false},
          {id: 6, group: "noService", original: false}
        ],
        edges: [
          {from: 1, to: 3},
          {from: 1, to: 6},
          {from: 2, to: 5},
          {from: 2, to: 6},
          {from: 3, to: 4}
        ]
      }
    };

    request(app)
      .post('/hotspot')
      .send(newPuzzle)
      .expect(200)
      .expect((res) => {
        expect(res.body.puzzle.graph).toExist();
        expect(res.body.puzzle.code).toBe(2);
        expect(res.body.puzzle.size).toBeA('string');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        HotspotPuzzle.find({}).then((puzzles) => {
          expect(puzzles.length).toBe(2);
          done();
        }).catch((e) => {
          done(e);
        });
      });
  });

  it('should not create puzzle with invalid body data', (done) => {
    request(app)
      .post('/hotspot')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        HotspotPuzzle.find().then((puzzles) => {
          expect(puzzles.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });
});
