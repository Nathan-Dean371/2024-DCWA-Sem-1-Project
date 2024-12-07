const express = require('express')
const pmysql = require('promise-mysql');
require('dotenv').config()
const path = require('path')
const app = express()
const port = 3004
var pool;

app.use(express.static('public'))
app.set('view engine', 'ejs')

var connection = pmysql.createPool({
  connectionLimit: 3,
  host: 'localhost',
  user: 'root',   
  password: 'password',
  database: 'proj2024mysql'
  }).then((p) =>
  {
      pool = p;
      console.log('Connected to MySQL');
      
  }).catch((err) =>
  {
      console.log('Error connecting to MySQL');
      console.log(err);   
  });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'))
})

app.get('/students', (req, res) => 
  {
    pool.query('SELECT * FROM student').then((data) =>
      {
          //console.log(data);
          res.render('pages/students',{students: data});
      }).catch((err) => 
      {
          console.log('Error querying MySQL');
          console.log(err);
      });
})

app.get('/students/edit/:sid', (req, res) =>
{
  console.log("Edit student with sid: " + req.params.sid);

  pool.query('SELECT * FROM student WHERE sid = ?', [req.params.sid]).then((data) =>
  {
      console.log(data);
      res.render('pages/editStudent',{student: data[0]});
  }).catch((err) =>
  {
      console.log('Error querying MySQL');
      console.log(err);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
