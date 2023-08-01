var express = require('express');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var mysql = require('mysql');
const path = require('path');
var session=require('express-session');
const { createObjectCsvWriter } = require('csv-writer').createObjectCsvWriter;
const { Parser } = require('json2csv');

const { spawn } = require('child_process');
const { PythonShell } = require('python-shell');

const fs = require("fs");
const multer = require("multer");
const csv = require('csv-parser');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

var app = express();
console.log("started")

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(session({
    secret:"secret"}));


const Chart = require('chart.js');
const { createCanvas} = require('canvas');

app.listen(8080);
app.use(bodyParser.urlencoded({extended:true}))
var con = mysql.createConnection({
    host:"127.0.0.1",
    user:"root",
    port:"3306",
    password:"",
    database:"proj1"
});
console.log(con);

app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    res.locals.faculty = req.session.faculty;
    res.locals.admin = req.session.admin;
    res.locals.show = req.session.show;
    res.locals.show1 = req.session.show1;
    // res.locals.show2 = req.session.show2;
    // res.locals.show3 = req.session.show3;
    // res.locals.show4= req.session.show4;
    // req.session.show1=false; 
    // req.session.show2=false;   
    // req.session.show3=false;   
    // req.session.show4=false;   
    next();
});

app.get("/",function(req,res){
    res.render("index");
})

app.get("/login",function(req,res){
    res.render("login");
})

app.get("/flogin",function(req,res){
    res.render("flogin");
})

app.get("/admin",function(req,res){
    res.render("admin");
})

app.get("/studentr",function(req,res){ 
    res.render("studentr");
})
app.get("/facultyr",function(req,res){
    res.render("facultyr");
})
app.get("/studentv",function(req,res){
  const sqlSelect = "SELECT  * from student_details";
  con.query(sqlSelect, function(err, rows) {
      if (err) throw err;
      res.render('studentv', { data: rows});
});
})
app.get("/facultyv",function(req,res){
  const sqlSelect = "SELECT  * from faculty_details";
  con.query(sqlSelect, function(err, rows) {
      if (err) throw err;
      res.render('facultyv', { data: rows});
});
})



app.get("/result", function(req, res) {
  const sqlSelect = "WITH CourseName AS (SELECT Course_Name FROM  course_details ), AverageMarks AS ( SELECT CID, AVG(Mark1) AS avg1, AVG(Mark2) AS avg2,  AVG(Mark3) AS avg3, AVG(Mark4) AS avg4 FROM mark_details GROUP BY CID)SELECT md.*, cd.Course_Name, COALESCE(am.avg1, 0) AS avg1, COALESCE(am.avg2, 0) AS avg2, COALESCE(am.avg3, 0) AS avg3, COALESCE(am.avg4, 0) AS avg4 FROM mark_details md LEFT JOIN AverageMarks am ON md.CID = am.CID INNER JOIN course_details cd ON cd.Course_ID = md.CID ORDER BY md.SID, md.CID; ";
 const sql="Select * from course_details";
  con.query(sqlSelect, function(err, rows) {
      if (err) throw err;
      con.query(sql, function(err, rows1) {
          if (err) throw err;
         
          res.render('result', { data: rows, data1: rows1 });
      });
  });
});

app.get("/umarks", function(req, res) {
 
          res.render('umarks');
      });


app.post("/umarksb", function(req, res) {
  const selected = req.body.assesment;
  const course_s=req.body.course_id;
  const stud=req.body.student_id;
  const mark=req.body.integerInput;
  const sqlSelect = "UPDATE mark_details SET " + selected + " = ? WHERE SID = '" + stud + "' AND CID = '" + course_s + "';";
  con.query(sqlSelect,mark, function(err, rows) {
      if (err) throw err;  
         res.redirect('/umarks');
      });
  });

app.get("/fresult",function(req,res){
    res.render("fresult");
})

app.get("/fresult1",function(req,res){
  res.render("fresult1");
})

app.get("/course",function(req,res){
    res.render("course");
})

app.get("/courseselect",function(req,res){
    res.render("courseselect");
})


app.get("/coursesel",function(req,res){
  res.render("coursesel");
})



app.get("/courseview",function(req,res){
  const sqlSelect = "SELECT  * from mark_details inner join course_details on CID=Course_ID inner join student_details on SID=Student_ID where Course_ID='"+course+"';"
  con.query(sqlSelect, function(err, rows) {
      if (err) throw err;
      res.render('courseview', { data: rows});
});
})
// app.get("/analysis",function(req,res){
 
//     // return res.send(generatedHTML);
 
//     res.render('analysis', { headers: parsedData.headers, csvData: parsedData.csvData });
// })

app.delete('/api/deleteStudent/:studentID', (req, res) => {
  const studentID = req.params.studentID;
  const deleteQuery = `DELETE FROM student_details WHERE Student_ID = ?`;

  con.query(deleteQuery, [studentID], (error, results) => {
    if (error) {
      console.error('Error deleting student record:', error);
      return res.status(500).json({ message: 'Error occurred while deleting student record.' });
    }

    if (!results || results.affectedRows === 0) {
      return res.status(404).json({ message: 'Student record not found.' });
    }

    return res.status(200).json({ message: 'Student record deleted successfully.' });
  });
});

app.delete('/api/deleteFaculty/:facultyID', (req, res) => {
  const facultyID = req.params.facultyID;
  const deleteQuery = `DELETE FROM faculty_details WHERE Faculty_ID = ?`;

  con.query(deleteQuery, [facultyID], (error, results) => {
    if (error) {
      console.error('Error deleting faculty record:', error);
      return res.status(500).json({ message: 'Error occurred while deleting faculty record.' });
    }

    if (!results || results.affectedRows === 0) {
      return res.status(404).json({ message: 'Faculty record not found.' });
    }

    return res.status(200).json({ message: 'Faculty record deleted successfully.' });
  });
});

app.delete('/api/deleteStudentc/:studentID/:courseID', (req, res) => {
  const studentID = req.params.studentID;
  const courseID = req.params.courseID;
  const deleteQuery = `DELETE FROM mark_details WHERE SID = ? AND CID = ?`;

  con.query(deleteQuery, [studentID, courseID], (error, results) => {
    if (error) {
      console.error('Error deleting student record:', error);
      return res.status(500).json({ message: 'Error occurred while deleting student record.' });
    }

    if (!results || results.affectedRows === 0) {
      return res.status(404).json({ message: 'Student record not found.' });
    }

    return res.status(200).json({ message: 'Student record deleted successfully.' });
  });
});
app.post('/admin',function(req,res){

    var name=req.body.uname;
    var pass=req.body.pass;
    var flag=0;
    var j;
    con.query('SELECT * FROM admin',(err,result,fields)=>{
    for(let i=0; i<result.length;i++){
        if(result[i].Name==name && result[i].Pass==pass){
            flag=1;
            j=i;
            break;
        }
    }
    if(flag==1){
        req.session.user=result[j]; 
        req.session.faculty=false;   
        req.session.admin=true;
        

        res.redirect('/');      
    }
    else{
        res.redirect('/admin');
    }
});
});

app.post('/sign_in',function(req,res){

    var name=req.body.uname;
    var pass=req.body.pass;
    var flag=0;
    var j;
    con.query('SELECT * FROM student_details ',(err,result,fields)=>{
    for(let i=0; i<result.length;i++){
        if(result[i].Student_ID==name && result[i].Pass==pass){
            flag=1;
            j=i;
            break;
        }
    }
    if(flag==1){
        req.session.user=result[j]; 
        req.session.faculty=false;   
        req.session.admin=false;   
        req.session.show1=false;   

        res.redirect('/');
        
    }
    else{ 
        req.session.show1=true;   

        res.redirect('/login');
    }
});
});
let facid;
app.post('/fsign_in',function(req,res){
    var name=req.body.uname;
    var pass=req.body.pass;
    var flag=0;
    var j;
    con.query('SELECT * FROM faculty_details',(err,result,fields)=>{
    for(let i=0; i<result.length;i++){
        if(result[i].Faculty_ID==name && result[i].FPass==pass){
            flag=1;
            const facID = result[i].Faculty_ID;
            facid=facID;
            j=i;
            break;
        }
    }
    if(flag==1){
        req.session.user=result[j];
        req.session.faculty=true;   
        req.session.admin=false;   
        

        res.redirect('/');
        
    }
    else{
        res.redirect('/flogin');
    }
});
});

app.post('/sregister',function(req,res){

    var uname=req.body.uname
    var fname=req.body.fname
    var lname=req.body.lname
    var gname=req.body.gname
    var ename=req.body.ename
    var dname=req.body.dname
    var sname=req.body.sname
    var password=req.body.pass
    con.query('SELECT * FROM student_details where Student_ID=?',[uname],(err,result,fields)=>{
        if (err) {
            console.error('Failed to fetch student:', err);
            res.redirect('/');
          }
        if(result.length>0){
            console.log('Student already exists'); 
            res.redirect('/studentr');
        }
        else{
            console.log('Hello');
            con.query('INSERT INTO student_details (ID,Student_ID,FiName,LaName,Gender,Email,Department,Semester,Pass) VALUES (NULL,?, ?, ? ,? ,? ,? ,? ,?);',[uname,fname,lname,gname,ename,dname,sname,password]);
            res.redirect('/studentr');
        }

    });

});
// app.post('/sign_up',function(req,res){

//     var name=req.body.uname
//     var email=req.body.email
//     var password=req.body.pass
//     con.query('SELECT * FROM student_name where Name=?',[name],(err,result,fields)=>{
//         if(result==[]){
//             console.log(result);
//             res.redirect('/login');
//         }
//         else{
//             console.log('Hello');
//             con.query('INSERT INTO student_name (SID, Name, Email, Pass) VALUES (NULL, ?, ?, ?);',[name,email,password]);
//             res.redirect('/login');
//         }

//     });

// });

app.post('/fregister',function(req,res){

  var uname=req.body.uname
  var tname=req.body.tname
  var fname=req.body.fname
  var lname=req.body.lname
  var gname=req.body.gname
  var ename=req.body.ename
  var dname=req.body.dname
  var password=req.body.pass
    con.query('SELECT * FROM faculty_details where Faculty_ID=?;',[uname],(err,result,fields)=>{
        if (err) {
            console.error('Failed to fetch student:', err);
            res.redirect('/');
          }
        if(result.length>0){
            console.log('Faculty already exists');
            res.redirect('/facultyr');
        }
        else{
            console.log('Hello');
            con.query('INSERT INTO faculty_details (SID,Faculty_ID,Title,FiName,LaName,Gender,Email,Department,FPass) VALUES (NULL,?, ?, ? ,? ,? ,? ,?, ?);',[uname,tname,fname,lname,gname,ename,dname,password]);
            res.redirect('/facultyr');
        }

    });

});



app.get('/logout',function(req,res){

    delete req.session.user;
    res.redirect('/');

});



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });
  const upload = multer({ storage: storage });
  

app.post('/upload', upload.single('csvfile'), function(req, res){
    const selected = req.body.assesment;
    const course_s = req.body.course_id;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file provided.' });
    }
   
  
    // Read and process the CSV file
    const results = [];
  fs.createReadStream(file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
        console.log(results);

            
    // Insert the CSV data into the database
    //     for(let i=0; i<results.length;i++){
    //         console.log(results[i]);
    //             const sql1='INSERT IGNORE INTO sub1_marks SET ?';     
    //             con.query(sql1,results,function (err, result) {
    //               if (err) throw err;
    //               console.log('Inserted ' + result.affectedRows + ' rows');
          
    //     });
    // }
    


    for(let i=0; i<results.length;i++){
    console.log(results[i]);
        
        const sql = "UPDATE mark_details SET " + selected + " = ? WHERE SID = '" + results[i].ID + "' AND CID = '" + course_s + "';";
        con.query(sql, results[i].Mark, function (err, result) {
          if (err) throw err;
          console.log('Updated' + result.affectedRows + ' rows');
        });
    }
                       
    });
   res.redirect('courseselect');

});




  app.get('/assesment',function(req,res){
    const sqlSelect = 'SELECT * FROM mark_details inner join student_details on SID=Student_ID where CID= ? ';
    con.query(sqlSelect,course, function (err, rows) {
        if (err) throw err;
        
          // Render the view page and pass the dynamic HTML as a variable
   
          res.render('assesment', {data:rows});
        
    });

});


app.post('/submit', (req, res) => {
    const selected = req.body.assesment;
    console.log(`You selected: ${selected}`);
    if (selected === '1') {
        res.redirect(`/fresult?assesment=${selected}`);
      } else if (selected === '2') {
        res.redirect(`/fresult?assesment=${selected}`);
      } else if (selected === '3') {
        res.redirect(`/fresult?assesment=${selected}`);
      }
      else {
        res.redirect(`/fresult?assesment=${selected}`);
      }
    
  });
  
  
  

    app.post('/submit1', (req, res) => {
        const {course_id, course_name} = req.body;
    
        // Insert the data into the database
        const sql1='INSERT IGNORE INTO course_details(FID,Course_ID,Course_Name) values (?,?,?);'
        con.query(sql1,[facid,course_id,course_name],function (err, result) {
          if (err) throw err;
          console.log('Inserted' + result.affectedRows + ' rows');
        
        });
        
        res.redirect('course');

      });

    let course;
      app.post('/submit2', (req, res) => {
        const {course_id} = req.body;
        course=course_id; 
          res.redirect('assesment');

      });
      app.post('/cs1', (req, res) => {
        const {course_id} = req.body;
        course=course_id; 
          res.redirect('courseview');

      });
     
    // let course1;
    //   app.post('/submit3', (req, res) => {
    //     req.session.show=true;   
    //     const {course_id} = req.body;
    //     course1=course_id; 
    //       res.redirect('result');

    //   });
    //   app.post('/result', (req, res) => {
    //     const selected = req.body.assesment;
    //     console.log(`You selected: ${selected}`);
    //     if (selected === '1') {
    //     req.session.show1=true;  
    //         res.redirect(`/result?assesment=${selected}`);
    //       } else if (selected === '2') {
    //     req.session.show2=true;  

    //         res.redirect(`/result?assesment=${selected}`);
    //       } else if (selected === '3') {
    //     req.session.show3=true;  

    //         res.redirect(`/result?assesment=${selected}`);
    //       }
    //       else {
    //     req.session.show4=true;  

    //         res.redirect(`/result?assesment=${selected}`);
    //       }
        
    //   });
      
      
      let cid;
      app.post('/upload1', upload.single('csvfile'), function(req, res){
        const {course_id} = req.body;
        cid=course_id; 
        const file = req.file;
        if (!file) {
          return res.status(400).json({ message: 'No file provided.' });
        }
          
        // Read and process the CSV file
        const results = [];
      fs.createReadStream(file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            console.log(results);
            // Insert the CSV data into the database
            for(let i=0; i<results.length;i++){
                console.log(results[i]);
                    const sql1='INSERT IGNORE INTO mark_details (SID,CID) values (?,?);'    
                    con.query(sql1,[results[i].ID,cid] ,function (err, result) {
                      if (err) throw err;
                      console.log('Inserted ' + result.affectedRows + ' rows');
              
            });
        }                    
        });
       res.redirect('course');
    
    });



//     app.post('/submit3', (req, res) => {
//         const sqlQuery = "SELECT * FROM mark_details where CID='"+course+"'";

// // Execute the query
// con.query(sqlQuery, (error, results) => {
//   if (error) {
//     console.error(error);
//     con.end(); // Close the connection
//     return;
//   }
//   csvFilePath='mark_details.csv';
  
//   const csvWriter = createCsvWriter({
//     path: csvFilePath,
//     header: Object.keys(results[0]), // Use the keys from the first row as headers
//       });

//       csvWriter.writeRecords(results)
//     .then(() => {
//       console.log('CSV file created successfully');
//       con.end(); // Close the connection
//       res.redirect('result_analysis');
//     })
//     .catch((error) => {
//       console.error(error);
//       con.end(); // Close the connection
//       res.redirect('result_analysis');
//     });
// });
// });



// app.post('/submit3', (req, res) => {
//   const pythonProcess = spawn('python', ['test1.py']);
//   let output = ''; // Store the output of the Python script

//   pythonProcess.stdout.on('data', (data) => {
//     output += data.toString(); // Collect the output
//     console.log(output);
//   });

//   pythonProcess.stderr.on('data', (data) => {
//     console.error(`stderr: ${data}`);
//   });

//   pythonProcess.on('error', (error) => {
//     console.error(`Error: ${error.message}`);
//     return res.status(500).send('An error occurred');
//   });

//   pythonProcess.on('close', (code) => {
//     console.log(`child process exited with code ${code}`);
//     // Send the output as the response
//     parsedData = parseCSV(output);
//     res.redirect('analysis');
    
//   });
// });
// function parseCSV(data) {
//   const csvRows = data.split('\n');
//   const headers = csvRows[0].split(',');
//   const csvData = [];

//   for (let i = 1; i < csvRows.length; i++) {
//     const rowData = csvRows[i].split(',');
//     if (rowData.length === headers.length) {
//       const obj = {};
//       for (let j = 0; j < headers.length; j++) {
//         obj[headers[j]] = rowData[j];
//       }
//       csvData.push(obj);
//     }
//   }

//   return { headers, csvData };
// }
// function generateHTML(data) {
//   // Parse CSV string into an array of objects
//   const csvRows = data.split('\n');
//   const headers = csvRows[0].split(',');
//   const csvData = [];
  
//   for (let i = 1; i < csvRows.length; i++) {
//     const rowData = csvRows[i].split(',');
//     if (rowData.length === headers.length) {
//       const obj = {};
//       for (let j = 0; j < headers.length; j++) {
//         obj[headers[j]] = rowData[j];
//       }
//       csvData.push(obj);
//     }
//   }

  // // Generate HTML table
  // let html = '<html>';
  // html += '<head><title>Analysis</title></head>';
  // html += '<body>';
  // html += '<h1>Analysis</h1>';
  // html += '<table>';

  // // Generate table headers
  // html += '<tr>';
  // for (const key in headers) {
  //   html += '<th>' + headers[key] + '</th>';
  // }
  // html += '</tr>';

  // // Generate table rows
  // for (let i = 0; i < csvData.length; i++) {
  //   html += '<tr>';
  //   for (const key in headers) {
  //     html += '<td>' + csvData[i][headers[key]] + '</td>';
  //   }
  //   html += '</tr>';
  // }

  // html += '</table>';
  // html += '</body>';
  // html += '</html>';

  // return html;





// app.post('/analyse', upload.single('csvfile'), function(req, res){
  
//   const file = req.file;
//   if (!file) {
//     return res.status(400).json({ message: 'No file provided.' });
//   }
 

//   // Read and process the CSV file
  
//   // const filename="mark_details.csv";
//   // const dire="uploads";
//   const results = [];
// fs.createReadStream(file.path)
//   .pipe(csv())
//   .on('data', (data) => results.push(data))
//   .on('end', () => {
//       console.log(results);
//     });
    
//       for(let i=0; i<results.length;i++){
//   console.log(results[i]);
//       }
//   //     const filepath = path.join(outputDirectory, outputFileName);
  
//   // fs.writeFile(filepath, JSON.stringify(results[i]), (err) => {
//   //   if (err) {
//   //     console.error(err);
//   //     return;
//   //   }
//   // });

//   //   console.log(`CSV file successfully created at ${filepath}`);
                     

//     });


app.get("/r_analysis",function(req,res){
  // req.session.show=false; 
  
   res.render("r_analysis");
  }); 


app.post('/submit3', (req, res) => {
  res.redirect('r_analysis');

});
app.get('/mark1',function(req,res){
  const sqlSelect = "SELECT SID,Mark1,S.FiName,S.LaName FROM mark_details inner join student_details as S on SID=Student_ID where CID= ? order by Mark1 desc ";
  con.query(sqlSelect,course, function (err, rows) {
      if (err) throw err;
    console.log('Selected' + rows.affectedRows + ' rows');
    res.render("mark1",{data:rows}); 
  });
});
app.get('/mark2',function(req,res){
  const sqlSelect = "SELECT SID,Mark2,S.FiName,S.LaName FROM mark_details inner join student_details as S on SID=Student_ID where CID= ?order by Mark2 desc ";
  con.query(sqlSelect,course, function (err, rows) {
      if (err) throw err;
    console.log('Selected' + rows.affectedRows + ' rows');
    res.render("mark2",{data:rows}); 
  });
});
app.get('/mark3',function(req,res){
  const sqlSelect = "SELECT SID,Mark3,S.FiName,S.LaName FROM mark_details inner join student_details as S on SID=Student_ID where CID= ?order by Mark3 desc ";
  con.query(sqlSelect,course, function (err, rows) {
      if (err) throw err;
    console.log('Selected' + rows.affectedRows + ' rows');
    res.render("mark3",{data:rows}); 
  });
});
app.get('/mark4',function(req,res){
  const sqlSelect = "SELECT SID,Mark4,S.FiName,S.LaName FROM mark_details inner join student_details as S on SID=Student_ID where CID= ?order by Mark4 desc ";
  con.query(sqlSelect,course, function (err, rows) {
      if (err) throw err;
    console.log('Selected' + rows.affectedRows + ' rows');
    res.render("mark4",{data:rows}); 
  });
});



app.post('/uploadf', upload.single('csvfile'), function(req, res){
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: 'No file provided.' });
  }
 

  // Read and process the CSV file
  const results = [];
fs.createReadStream(file.path)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
      console.log(results);

 
  for(let i=0; i<results.length;i++){
  console.log(results[i]);
      
      const sql = "UPDATE mark_details SET " + selected + " = ? WHERE SID = '" + results[i].ID + "' AND CID = '" + course_s + "';";
      con.query(sql, results[i].Mark, function (err, result) {
        if (err) throw err;
        console.log('Updated' + result.affectedRows + ' rows');
      });
  }
                     
  });
 res.redirect('courseselect');

});



app.post('/submit4', (req, res) => {
  const selected = req.body.assesment;
  console.log(`You selected: ${selected}`);
  if (selected === 'Mark1') {
      res.redirect(`/Mark1`);
    } else if (selected === 'Mark2') {
      res.redirect(`/Mark2`);
    } else if (selected === 'Mark3') {
      res.redirect(`/Mark3`);
    }
    else if (selected === 'Mark4'){
      res.redirect(`/Mark4`);
    }
  
});



app.get('/predict', (req, res) => {
  // Step 1: Fetch data from the SQL database
  const sqlSelect = 'SELECT * FROM mark_details WHERE CID = "' + course + '"';
  con.query(sqlSelect, function (err, rows) {
    if (err) throw err;
    console.log('Selected ' + rows.length + ' rows');

    // Step 2: Convert the fetched data into a CSV format
    const csvFields = ['Mark1', 'Mark2', 'Mark3', 'Mark4']; // Replace with your actual column names
    const json2csvParser = new Parser({ fields: csvFields });
    const csvData = json2csvParser.parse(rows);

    // Step 3: Write the CSV data into a file
    const csvFileName = 'marks.csv'; // Replace with your desired CSV file name
    fs.writeFile(csvFileName, csvData, (err) => {
      if (err) {
        console.error('Error writing CSV file: ', err);
        res.status(500).json({ error: 'Error occurred while creating CSV' });
      } else {
        console.log('CSV file has been created successfully.');
         // Step 4: Run the Python script for prediction using spawn
         const pythonScript = 'predict1.py'; // Replace with the correct Python script name
         const pythonProcess = spawn('python', [pythonScript]);
         
         let predictedMarks = [];
         
         pythonProcess.stdout.on('data', (data) => {
           const predictedValuesString = data.toString().trim(); // Convert the data to a string and remove trailing newline characters
           predictedMarks = predictedValuesString.split(',').map((value) => parseFloat(value));
         });
         
         pythonProcess.on('error', (err) => {
           console.error('Error occurred while predicting:', err);
           return res.status(500).json({ error: 'Error occurred while predicting' });
         });
         
         pythonProcess.on('close', (code) => {
           if (code === 0) {
             res.render('predict', { data: rows, data1: predictedMarks });
             console.log('Predictions:', predictedMarks);
           } else {
             console.error('Python script exited with error code:', code);
             return res.status(500).json({ error: 'Python script exited with error code' });
           }
         });
      }
    });
  });
});

   

app.post('/predictb', (req, res) => {
  res.redirect('predict');

});