const MongoClient = require("mongodb").MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'proj2024MongoDB';
const client = new MongoClient(url);
var coll;

async function connect() {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(dbName);
    coll = db.collection('lecturers');
}
connect();
var findAll = function() 
{
    return new Promise((resolve, reject) => 
        {
        var cursor = coll.find()
        .sort({_id:1})
        cursor.toArray()
        .then((documents) => {
        resolve(documents)
        })
        .catch((error) => {
        reject(error)
        })
    });
}

var deleteLecturer =  function(lid)
{
    return new Promise((resolve, reject) => 
    {
        coll.deleteOne({_id: lid})
        .then((result) => {
            resolve(result)
        })
        .catch((error) => {
            reject(error)
        })
    });
}
module.exports = { findAll: findAll , deleteLecturer: deleteLecturer};
