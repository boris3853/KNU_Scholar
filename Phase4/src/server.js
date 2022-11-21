var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var router = require('./routes/router');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/', router);

var PORT = process.env.PORT || 8000;

// listen 8000 port
app.listen(PORT, () =>{
    console.log('Server is running on port ${PORT}.');
});
