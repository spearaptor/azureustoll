var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
//   mongoose = require('mongoose'),
//   Toll = require('./api/models/tollModel'), //created model loading here
  bodyParser = require('body-parser');
  
// mongoose instance connection url connection
// mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost/Tododb'); 


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var routes = require('./api/routes/tollRoutes.js'); //importing route
routes(app); //register the route


app.listen(port);


console.log('toll RESTful API server started on: ' + port);
