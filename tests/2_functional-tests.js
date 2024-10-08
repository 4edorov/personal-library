/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const app = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite('Routing tests', function() {
    let testBookId;

    suite('POST /api/books with title => create book object/expect book object', function() {
      test('Test POST /api/books with title', function(done) {
        const testTitle = 'Test Book';
        app.then((server) => {
          chai.request(server)
            .post('/api/books')
            .send({ title: testTitle, comment: 'Test comment' })
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.property(res.body, '_id', 'Book should contain _id');
              assert.property(res.body, 'title', 'Book should contain title');

              testBookId = res.body._id;
              done();
            });
        });
      });

      test('Test POST /api/books with no title given', function(done) {
        app.then((server) => {
          chai.request(server)
            .post('/api/books')
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, 'missing required field title');
              done();
            });
        });
      });
    });

    suite('GET /api/books => array of books', function(){
      test('Test GET /api/books', function(done) {
        app.then((server) => {
          chai.request(server)
            .get('/api/books')
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.isArray(res.body, 'response should be an array');
              assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
              assert.property(res.body[0], 'title', 'Books in array should contain title');
              assert.property(res.body[0], '_id', 'Books in array should contain _id');
              done();
            });
        });
      });
    });

    suite('GET /api/books/[id] => book object with [id]', function() {
      test('Test GET /api/books/[id] with id not in db', function(done) {
        app.then((server) => {
          chai.request(server)
            .get('/api/books/1')
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, 'no book exists');
              done();
            });
        });
      });

      test('Test GET /api/books/[id] with valid id in db', function(done) {
        app.then((server) => {
          chai.request(server)
            .get('/api/books/' + testBookId)
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.property(res.body, '_id', 'Book should contain _id');
              assert.property(res.body, 'title', 'Book should contain title');
              assert.property(res.body, 'comments', 'Book should contain comments');
              done();
            });
        });
      });
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function() {
      test('Test POST /api/books/[id] with comment', function(done) {
        app.then((server) => {
          chai.request(server)
            .post('/api/books/' + testBookId)
            .send({ comment: 'Test comment' })
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.property(res.body, '_id', 'Book should contain _id');
              assert.property(res.body, 'title', 'Book should contain title');
              assert.property(res.body, 'comments', 'Book should contain comments');
              assert.include(res.body.comments, 'Test comment', 'Comments should contain test comments');
              done();
            });
        });
      });

      test('Test POST /api/books/[id] without comment field', function(done) {
        app.then((server) => {
          chai.request(server)
            .post('/api/books/' + testBookId)
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, 'missing required field comment');
              done();
            });
        });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done) {
        app.then((server) => {
          chai.request(server)
            .post('/api/books/1')
            .send({ comment: 'Test comment' })
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, 'no book exists');
              done();
            });
        });
      });
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {
      test('Test DELETE /api/books/[id] with valid id in db', function(done) {
        app.then((server) => {
          chai.request(server)
            .delete('/api/books/' + testBookId)
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, 'delete successful');
              done();
            });
        });
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done) {
        app.then((server) => {
          chai.request(server)
            .delete('/api/books/1')
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, 'no book exists');
              done();
            });
        });
      });
    });
  });
});
