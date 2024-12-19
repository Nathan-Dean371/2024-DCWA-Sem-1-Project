const express = require('express')
const pmysql = require('promise-mysql');
const { check, validationResult } = require('express-validator');
require('dotenv').config()
const path = require('path')
const app = express()
const port = 3004;
var pool;


app.use(express.urlencoded({ extended: true }))
app.use(express.json())

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

app.get('/students/add', (req, res) => {
  var emptyStudent = {sid: '', name: '', age: ''};
  res.render('pages/addStudent',{errors: undefined, student : emptyStudent});
})

app.post('/students/add', 
  [
        check("sid").custom(value =>
        {
          const sid = value;
          const sids = pool.query('SELECT * FROM student WHERE sid = ?', [sid]);
          return sids.then((data) =>
          {
            if(data.length > 0)
            {
              return Promise.reject('SID already exists');
            }
          });
        }),
        check("sid").isLength(4).withMessage("SID must be 4 characters long"),
        check("name").isLength({min:2}).withMessage("Name must be at least 2 characters long"),
        check("age").isInt({min:18}).withMessage("Age must be 18 or older")
  ],
  (req, res) =>
  {
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
      res.render('pages/addStudent',{errors: errors.errors, student : req.body});
    }
    else
    {
      pool.query('INSERT INTO student (sid, name, age) VALUES (?, ?, ?)', [req.body.sid, req.body.name, req.body.age]).then((data) =>
      {
        res.redirect('/students');
      }).catch((err) =>
      {
        console.log('Error querying MySQL');
        console.log(err);
      });
    }
    
  });

app.get('/students/edit/:sid', (req, res) =>
{
  console.log("Edit student with sid: " + req.params.sid);

  pool.query('SELECT * FROM student WHERE sid = ?', [req.params.sid]).then((data) =>
  {
      res.render('pages/editStudent',{student: data[0], errors: undefined});
  }).catch((err) =>
  {
      console.log('Error querying MySQL');
      console.log(err);
  });
});

app.post('/students/edit/:sid', 
        [
          check("name").isLength({min:2}).withMessage("Name must be at least 2 characters long"),
          check("age").isInt({min:18}).withMessage("Age must be 18 or older")
        ],
        (req, res) =>
        {
          const errors = validationResult(req);
          if(!errors.isEmpty())
          {
            res.render('pages/editStudent',{student: req.body, errors: errors.errors});
          }
          else
          {
            //Update entry in the SQL database
            pool.query('UPDATE student SET name = ?, age = ? WHERE sid = ?', [req.body.name, req.body.age, req.params.sid]).then((data) =>
            {
              res.redirect('/students');
            }).catch((err) =>
            {
              console.log('Error querying MySQL');
              console.log(err);
            });
          }
        });

app.get('/grades', (req, res) =>
{
  
  pool.query("SELECT student.name, module.name as mName, grade FROM student LEFT JOIN grade ON student.sid = grade.sid LEFT JOIN module ON grade.mid = module.mid ORDER BY student.name ASC, grade").then((data) =>
  {
      console.log(data);
      res.render('pages/grades',{grades: data});
  }).catch((err) =>
  {
      console.log('Error querying MySQL');
      console.log(err);
  });
  
});

app.listen(port, () => {
  console.log(`Nathan Dean - DCWA Project listening on port ${port}`)
})


