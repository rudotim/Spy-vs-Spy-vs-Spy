var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
	res.sendfile(__dirname + '/public/index.html');
});

	
module.exports = router;
