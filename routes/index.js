var express = require('express');
var router = express.Router();
var db = require('../db/api');
var auth = require('../auth');
var beeseed = require('../beeseed');
var beeFact = require('../beefact')
var knex = require('../db/knex');

function ensureAuthenticated(request, response, next) {
    if (request.isAuthenticated()) {
        return next();
    }
    response.redirect('/auth/google');
}
/* GET home page. */
router.get('/beeseed', function(req, res) {
    res.json(beeseed);
});
router.get('/beefact', function(req, res){
  res.json(beeFact);
});
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'The Hive'
    });
});
// get about us
router.get('/aboutUs', function(req, res, next) {
    res.render('aboutUs', {
        title: 'The Hive'
    });
});
router.get('/aboutUs', function(req, res, next) {
    res.render('aboutUs', {
        title: 'About Us'
    });
});
router.get('/auth/google', auth.passport.authenticate('google', {
    scope: ['openid email profile']
}));
router.get('/auth/google/callback', auth.passport.authenticate('google', {
        failureRedirect: '/auth/google'
    }),
    function(request, response) {
        response.redirect('/userProfile');
    });
router.get('/signOut', function(request, response, next) {
    request.session = null;
    response.redirect('/');
});
router.get('/userProfile', ensureAuthenticated, function(req, res, next) {
    knex('users').select().where("google_id", req.user.id).then(function(data) {
        res.render('userProfile', {
            title: 'User Profile',
            username: data[0]
        });
    })
});
router.get('/editProfile', ensureAuthenticated, function(req, res, next) {
  knex('users').where("google_id", req.user.id).then(function(data){
    res.render('editProfile', {
        data: data[0]
    });
  })
});
router.get('/addBee', ensureAuthenticated, function(req, res, next) {
    res.render('addBee', {
        title: 'Add Bee'
    });
});
router.get('/beeInfo', ensureAuthenticated, function(req, res, next) {
    res.render('beeInfo', {
        title: 'Bee Info'
    });
});
router.get('/beeMap', function(req, res, next) {
    res.render('beeMap', {
        title: 'Bee Map'
    });
});
router.post('/editProfile', ensureAuthenticated, function(req, res, next) {
    knex('users').where("google_id", req.user.id).update(req.body).then(function(data){
    res.redirect('userProfile');
    })
});
router.post('/addBee', ensureAuthenticated, function(req, res, next) {
  knex('users').select('users.id').where("google_id", req.user.id).then(function(data){
    req.body.user_id = data[0].id;
    knex('bee_info').insert(req.body).then(function(){
      res.redirect('/beeMap')
    })
});
});
module.exports = router;
