/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const { ObjectId } = require('mongodb');

const collectionName = 'books';

module.exports = function (app, db) {

  app.route('/api/books')
    .get(async function (req, res){
      try {
        const pipeline = [
          {
            $project: {
              _id: 1,
              title: 1,
              commentcount: { $size: {
                $ifNull: ['$comments', []]
              }}
            }
          }
        ];

        const getRes = await db.collection(collectionName).aggregate(pipeline).toArray();

        return res.send(getRes);
      } catch (err) {
        return res.send('error getting books');
      }
    })
    
    .post(async function (req, res){
      let title = req.body.title;
      if (!title) {
        return res.send('missing required field title');
      }

      const bookToCreate = {
        title
      };
      if (req.body.comment) {
        bookToCreate.comments = [req.body.comment];
      }

      try {
        const createRes = await db.collection(collectionName).insertOne(bookToCreate);

        if (createRes.insertedCount < 1) {
          throw new Error('error saving book')
        }

        return res.json({ _id: createRes.insertedId, title });
      } catch (err) {
        return res.send('error saving book');
      }
    })
    
    .delete(async function(req, res) {
      //if successful response will be 'complete delete successful'
      try {
        const deleteRes = await db.collection(collectionName).deleteMany({});

        return res.send('complete delete successful');
      } catch (err) {
        return res.send('error deleting books');
      }
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      let bookid = req.params.id;

      try {
        const getRes = await db.collection(collectionName).findOne({ _id: new ObjectId(bookid) });

        if (!getRes) {
          return res.send('no book exists');
        }

        if (!getRes.comments) {
          getRes.comments = [];
        }

        return res.send(getRes)
      } catch (err) {
        return res.send('no book exists');
      }
    })
    
    .post(async function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;

      if (!comment) {
        return res.send('missing required field comment');
      }

      try {
        const updateRes = await db.collection(collectionName)
          .updateOne(
            { _id: new ObjectId(bookid) },
            { $push: { comments: comment } }
          )

        if (updateRes.modifiedCount < 1) {
          throw new Error('error updating book')
        }

        const getRes = await db.collection(collectionName).findOne({ _id: new ObjectId(bookid) })
        return res.send(getRes)
      } catch (err) {
        return res.send('no book exists');
      }
    })
    
    .delete(async function(req, res){
      let bookid = req.params.id;

      try {
        const deleteRes = await db.collection(collectionName).deleteOne({ _id: new ObjectId(bookid) });

        if (deleteRes.deletedCount < 1) {
          throw new Error('error deleting book')
        }

        return res.send('delete successful');
      } catch (err) {
        return res.send('no book exists');
      }
    });
  
};
