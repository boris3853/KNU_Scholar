var oracledb = require('oracledb');
var express = require('express');
var router = express.Router();
var path = require('path');

router.use(express.static(__dirname + "/../public"));

// root dir
router.get('/', function(req, res){
	res.send('Hello World');
});

// 404 Error Page
router.use((req, res) => {
	res.sendFile(path.join(__dirname, "../app/404.html"));

});


module.exports = router

