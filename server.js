/*
CSC3916 HW2 Server
file: server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
db = require('./db')(); //hack
var jwt = require('jsonwebtoken');
var cors = require('cors');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(passport.initialize());
var router = express.Router();

function getJSONObjectForMovieRequirement(req){
    var json = {
        headers: "No Headers",
        key: process.env.UNIQUE_KEY,
        body: "No Body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers
    }
    return json;
}

router.post('/signup', function(req, res){
    if(!req.body.username || !req.body.password){
        res.json({success:false,msg:'Please include both username and password to signup.'})
    }
    else{
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };
        db.save(newUser); //no duplicate checking
        res.json({success:true,msg:'Successfully created new user.'})
    }
});

router.post('/signin', function (req, res) {
    var user = db.findOne(req.body.username);

    if (!user) {
        res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
        if (req.body.password == user.password) {
            var userToken = { id: user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.SECRET_KEY);
            res.json ({success: true, token: 'JWT ' + token});
        }
        else {
            res.status(401).send({success: false, msg: 'Authentication failed.'});
        }
    }
});

router.route('/testcollection')
    .delete(authController.isAuthenticated, function(req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                res = res.type(req.get('Content-Type'));
            }
            var o = getJSONObjectForMovieRequirement(req);
            res.json(o);
        }
    )
    .put(authJwtController.isAuthenticated, function(req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                res = res.type(req.get('Content-Type'));
            }
            var o = getJSONObjectForMovieRequirement(req);
            res.json(o);
        }
    );

router.route('/movies')
    .get(authController.isAuthenticated, function(req, res) {
        res.json({status: 200, msg: 'GET movies', headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY});}
    )
    .post(authController.isAuthenticated ,function(req, res) {
        res.json({status: 200, msg: 'movie saved', headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY});}
    )
    .delete(authController.isAuthenticated, function (req, res){
        res.json({status: 200, msg: 'movie deleted', headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY});})
    .patch(function (req, res){
        res.json({status: 400, msg: 'command not supported', headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY});})
    .copy(function (req, res){
        res.json({status: 400, msg: 'command not supported', headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY});})
    .head(function (req, res){
        res.json({status: 400, msg: 'command not supported', headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY});})
    .options(function (req, res){
        res.json({status: 400, msg: 'command not supported', headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY});})
    .lock(function (req, res){
        res.json({status: 400, msg: 'command not supported', headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY});})
    .unlock(function (req, res){
        res.json({status: 400, msg: 'command not supported', headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY});})
;

//I couldn't get the syntax correct getting this all within the route above so I wrote this next put with jwt auth this way:
router.put('/movies', passport.authenticate('jwt', {session:false,msg: 'Authentication failed.'}), function (req, res) {
    res.json({status: 200, msg: 'movie updated', headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY});
    });

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app;