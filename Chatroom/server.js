var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.set('view engine', 'ejs');
app.use(express.static("static"));
app.use(express.json());
var dbUrl = "mongodb+srv://vidhishah:fries123@cluster0.da2ao.mongodb.net/TpoProject?retryWrites=true&w=majority"

app.get("/", (req, res) => {
    res.render("index");
});

mongoose.connect(dbUrl, (err, conn) => {
    if (err) err(res,err, "Database Connection Error", 500)
    console.log("Connection: ",conn)});

var Message = mongoose.model("Message",{ name : String, message : String})

app.get('/messages', (req, res) => {
    Message.find({},(err, messages)=> {
      res.send(messages);
    })
  })
app.post('/messages', (req, res) => {
    var message = new Message(req.body);
    message.save((err) =>{
      if(err)
        sendStatus(500);
      res.sendStatus(200);
    })
  })

var server = app.listen(5000, () => {
    console.log("server is running on port", server.address().port);
   });