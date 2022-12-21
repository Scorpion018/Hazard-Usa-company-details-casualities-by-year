var express = require('express');
var ejs = require('ejs');
var port = 3000;
var app = express();
const fs = require('fs');
const https = require('https')
const Pool = require('pg').Pool
var cors = require('cors')
const bodyParser = require("body-parser");   
const axios = require('axios');

const key = fs.readFileSync('./localhost.decrypted.key');
const cert = fs.readFileSync('./localhost.crt');




app.use(bodyParser.json());       
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine','ejs');
let recaldata
let companyData = 0;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'api',
  password: 'newpass',
  port: 5432,
})

const server = https.createServer({ key, cert }, app);


pool.connect((err) => {
  if (err) throw err;
  console.log("Connected to postgreSQL");
});

app.get("/", (req, res) => {
  res.sendFile("./index.html", {
      root: __dirname,
  });
});

app.post('/set' , (req,res)=>{
  let sql = `select * from csv2016`
  let retailer = req.body.establishment_name
  let url = `https://www.saferproducts.gov/RestWebServices/Recall?format=json&Retailer=${retailer}`
  if(req.body.year_filing_for && req.body.states_name === undefined && req.body.establishment_name === undefined){
    sql = `select * from csv${req.body.year_filing_for}`
  } else if(req.body.states_name && req.body.establishment_name === undefined && req.body.year_filing_for === undefined){
    sql = `select * from csv2016 where state='${req.body.states_name}'`
  }else if(req.body.establishment_name && req.body.year_filing_for === undefined && req.body.states_name === undefined ){
    sql = `select * from csv2016 where establishment_name LIKE '%${req.body.establishment_name}' OR establishment_name LIKE '%${req.body.establishment_name}%' OR establishment_name LIKE '${req.body.establishment_name}%'`
  }else if(req.body.year_filing_for && req.body.states_name &&  req.body.establishment_name === undefined ){
    sql = `select * from csv${req.body.year_filing_for} where state='${req.body.states_name}'`
  } else if(req.body.year_filing_for && req.body.establishment_name  && req.body.states_name === undefined){
    sql = `select * from csv${req.body.year_filing_for} where establishment_name LIKE '%${req.body.establishment_name}' OR establishment_name LIKE '%${req.body.establishment_name}%' OR establishment_name LIKE '${req.body.establishment_name}%'`
  } else if(req.body.states_name && req.body.establishment_name && req.body.year_filing_for === undefined){
    sql = `select * from csv2016 where state='${req.body.states_name}' AND  establishment_name LIKE '%${req.body.establishment_name}' OR establishment_name LIKE '%${req.body.establishment_name}%' OR establishment_name LIKE '${req.body.establishment_name}%'`;
  }else if(req.body.states_name && req.body.establishment_name && req.body.year_filing_for){
    sql = `select * from csv${req.body.year_filing_for} where state='${req.body.states_name}' AND  establishment_name LIKE '%${req.body.establishment_name}' OR establishment_name LIKE '%${req.body.establishment_name}%' OR establishment_name LIKE '${req.body.establishment_name}%'`;
  }
  console.log('Query',sql)
  pool.query(sql, (err, results) => {
      if (err) {
          throw err;
      } else {
        companyData = results.rows
        // res.json(results.rows)
      }
  })
  console.log('URL' , url)
  fetch(url)
    .then(res => res.json())
    .then(json => {
      res.json(json)
    console.log('Success')
      // recaldata = json
    })
    .catch(err=>{
    res.json(err)
    console.log('Error' , err)
  })

// setTimeout(()=>{
//   res.json(recaldata)
//   console.log('C data=>' , typeof companyData)
//   // res.json(companyData)
// }, 3000)
})

app.post('/states', (req, res) => {
  let sql = `select * from csv2016`
  if(req.body.year_filing_for && req.body.states_name === undefined && req.body.establishment_name === undefined){
    sql = `select * from csv${req.body.year_filing_for}`
  } else if(req.body.states_name && req.body.establishment_name === undefined && req.body.year_filing_for === undefined){
    sql = `select * from csv2016 where state='${req.body.states_name}'`
  }else if(req.body.establishment_name && req.body.year_filing_for === undefined && req.body.states_name === undefined ){
    sql = `select * from csv2016 where establishment_name LIKE '%${req.body.establishment_name}' OR establishment_name LIKE '%${req.body.establishment_name}%' OR establishment_name LIKE '${req.body.establishment_name}%'`
  }else if(req.body.year_filing_for && req.body.states_name &&  req.body.establishment_name === undefined ){
    sql = `select * from csv${req.body.year_filing_for} where state='${req.body.states_name}'`
  } else if(req.body.year_filing_for && req.body.establishment_name  && req.body.states_name === undefined){
    sql = `select * from csv${req.body.year_filing_for} where establishment_name LIKE '%${req.body.establishment_name}' OR establishment_name LIKE '%${req.body.establishment_name}%' OR establishment_name LIKE '${req.body.establishment_name}%'`
  } else if(req.body.states_name && req.body.establishment_name && req.body.year_filing_for === undefined){
    sql = `select * from csv2016 where state='${req.body.states_name}' AND  establishment_name LIKE '%${req.body.establishment_name}' OR establishment_name LIKE '%${req.body.establishment_name}%' OR establishment_name LIKE '${req.body.establishment_name}%'`;
  }else if(req.body.states_name && req.body.establishment_name && req.body.year_filing_for){
    sql = `select * from csv${req.body.year_filing_for} where state='${req.body.states_name}' AND  establishment_name LIKE '%${req.body.establishment_name}' OR establishment_name LIKE '%${req.body.establishment_name}%' OR establishment_name LIKE '${req.body.establishment_name}%'`;
  }
  console.log('Query',sql)
  pool.query(sql, (err, results) => {
      if (err) {
          throw err;
      } else {
        res.json(results.rows)
      }
  })
})

// app.listen(port, () => {
//   console.log(`Listening to port ${port}`)
// });

server.listen(port, () => {
  console.log(`Server is listening on https://localhost:${port}`);
});