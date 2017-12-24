const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { HotspotPuzzle } = require('./../models/hotspotPuzzle');

const puzzle = {
  code: '1234',
  size: "small",
  graph: {
    nodes: [
      { id: 1, group: "noService", original: false },
      { id: 2, group: "noService", original: true },
      { id: 3, group: "noService", original: true },
      { id: 4, group: "noService", original: false },
      { id: 5, group: "noService", original: false },
      { id: 6, group: "noService", original: false }
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 1, to: 5 },
      { from: 2, to: 4 },
      { from: 3, to: 5 },
      { from: 3, to: 6 }
    ]
  },
  approved: true
};

beforeEach(async () => {
  try {
    await HotspotPuzzle.remove({});
    HotspotPuzzle.create(puzzle);
  } catch (e) {
    throw new Error('Error setting up database for tests');
  }
});

describe('GET /hotspot/data/:code', () => {
  it('should return puzzle with given code', () => {
    const code = '1234';

    return request(app)
      .get(`/hotspot/data/${code}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.puzzle.graph).toExist();
        expect(res.body.puzzle.code).toBe(code);
        expect(res.body.puzzle.size).toBeA('string');
      })
      .catch((e) => {
        throw new Error(`Unable to get puzzle object with code ${1234}`);
      });
  });

  it('should return 404 if puzzle not found', () => {
    return request(app)
      .get('/hotspot/data/2')
      .expect(404)
      .catch((e) => { throw new Error(e); });
  });
});

describe('GET /hotspot/:code', () => {
  it('should render a puzzle page,', () => {
    const code = '1';
    return request(app)
      .get(`/hotspot/${code}`)
      .expect(200)
      .expect((res) => {
        expect(res.text).toExist();
      })
      .catch((e) => { throw new Error(e); });
  });

  it('should return puzzle does not exist message when puzzle not found', (done) => {
    request(app)
      .get('/hotspot/2')
      .expect(200)
      // .expect((res) => {
      //   expect(res.text).toBe('<h1>This puzzle does not exist!</h1>');
      // })
      .end(done);
  });
});

describe('POST /hotspot', () => {
  it('should create a new puzzle', () => {
    const newPuzzle = {
      code: 'A123',
      size: "small",
      graph: {
        nodes: [
          { id: 1, group: "noService", original: false },
          { id: 2, group: "noService", original: true },
          { id: 3, group: "noService", original: true },
          { id: 4, group: "noService", original: false },
          { id: 5, group: "noService", original: false },
          { id: 6, group: "noService", original: false }
        ],
        edges: [
          { from: 1, to: 3 },
          { from: 1, to: 6 },
          { from: 2, to: 5 },
          { from: 2, to: 6 },
          { from: 3, to: 4 }
        ]
      },
      approved: 'pending'
    };

    return request(app)
      .post('/hotspot')
      .send(newPuzzle)
      .expect(200)
      .expect((res) => {
        expect(res.body.savedPuzzle.graph).toExist();
        expect(res.body.savedPuzzle.code).toBe('A123');
        expect(res.body.savedPuzzle.size).toBeA('string');
      })
      .then(async (response) => {
        try {
          const puzzles = await HotspotPuzzle.find({});
          expect(puzzles.length).toBe(2);
        } catch (e) {
          throw new Error(e);
        }
      })
      .catch((e) => { throw new Error(e); });
  });

  it('should not create puzzle with invalid body data', () => {
    return request(app)
      .post('/hotspot')
      .send({})
      .expect(400)
      .then(async (response) => {
        try {
          const puzzles = await HotspotPuzzle.find();
          expect(puzzles.length).toBe(1);
        } catch (e) {
          throw new Error(e);
        }
      })
      .catch((e) => {
        throw new Error(e);
      });
  });
});

describe('GET /code/new', () => {
  it('should return a 4 character code', (done) => {
    request(app)
      .get('/code/new')
      .expect(200)
      .expect((res) => {
        expect(res.text).toExist();
        expect(res.text.length).toBe(4);
      })
      .end(done);
  });
});

describe()
