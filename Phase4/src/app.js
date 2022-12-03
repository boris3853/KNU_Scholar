var oracledb = require('oracledb');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
// var router = require('./router');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// app.use('/', router);
app.use(express.static("public"))

var PORT = process.env.PORT || 8000;

app.get("/login/main", (req, res) => {
    res.sendFile(__dirname + "/webpage/login1.html");
});

app.post('/login/main', (req, res) => {
    // Insert Login Code Here
    let username = req.body.userID;
    let password = req.body.userPW;
    res.send(`Username: ${username} Password: ${password}`);
  });

app.get("/login/sign-up", (req, res) => {
    res.sendFile(__dirname + "/webpage/login2.html");
});



app.get("/login/sign-in", (req, res) => {
    res.sendFile(__dirname + "/webpage/login3.html");
});



app.post('/', function(req, res, next){
    var ID = req.body.userID || req.query.userID
    var PW = req.body.userPW || req.query.userPW
    console.log(ID + PW)
});

// listen 8000 port
app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}.`);
});
