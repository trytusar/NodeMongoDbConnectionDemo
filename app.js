var MongoClient = require('mongodb').MongoClient;

var url = "mongodb://localhost:27017/";
const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
var fs = require('fs');
var request = require('request');
var cors = require('cors');
const app = express();
const os = require("os");
app.use(bodyParser.json());
app.use(cors());
const PORT = 3002;

/* ************************POST API to create Candidate Profile.  *************************** */

app.post("/api/addprofile", (req, res) => {
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) {
      console.log("====================:", err);
      throw err;
    }
    var dbo = db.db("TSOTDb");
    let _name = req.body.name;
    let _mobileno = req.body.mobileno;
    let _emailid = req.body.emailid;
    let _skill = req.body.skill;
    let _experience = req.body.experience;
    let _regDate = new Date(Date.now()).toLocaleString();

    dbo.collection("candidate_profile").find({ 'emailid': { $eq: _emailid } }).toArray(function (err, result) {
      let msg = {};
      if (err) throw err;
      console.log("result Length......", result.length);
      if (result.length > 0) {
        msg = { name: _name, status: false, message: "EmailId already registered !" };
        res.json(msg);
        res.end();
      }
      else {
        var data = { name: _name, mobileno: _mobileno, emailid: _emailid, skill: _skill, experience: _experience, regDate: _regDate };
        dbo.collection("candidate_profile").insertOne(data, function (error, result) {
          if (error) {
            console.log("ERROR: " + error);
          }
          db.close();
          msg = { name: _name, status: true, message: 'Candidate profile created successfully.' };
          res.json(msg);
          res.end();
        });
      }
    });
  });
});

/* ************************GET API to pull Questions based on candidate's Skill -  saved in Database *************************** */


app.get("/api/getquestions", (req, res) => {
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    let questionset = {};
    let _skill = "python";
    if (err) {
      console.log("====================:", err);
      throw err;
    }
    var dbo = db.db("TSOTDb");
    dbo.collection("questions").find({ 'language': { $eq: _skill } }).toArray(function (err, result) {
      if (err) throw err;
      console.log("all records...", result);
      questionset = {QuestionBank: result};
      res.json(questionset);
      res.end();
      db.close();
    });
  });
});


app.listen(PORT, 'localhost', () => {
  console.log(`Server is running on port ${PORT}.`);
});
