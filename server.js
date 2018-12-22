var express = require('express'); // Require Express
var app = express(); // Instantiate Express to app-variable
var bodyParser = require("body-parser"); // Require the module required for using form data

app.use(bodyParser.urlencoded({ extended: true })); // For parsing application
app.set('view engine', 'ejs'); // Set EJS

// Make use of static files
app.use(express.static(__dirname + '/views/app/css'));
app.use(express.static(__dirname + '/views/app/'));
app.set("port", (process.env.PORT || 5000)); // Set port

// Initialize constants and a variable
const MongoClient = require('mongodb').MongoClient;
const url = process.env.Mongo_url;
var db;

// Connect to database
MongoClient.connect(url, { useNewUrlParser: true }, (err, info) => {
  // console.log(info);
  db = info.db('tietokanta');

  // Start server on port 5000
  app.listen(app.get("port"), function() {
    console.log("Node app is running on port", app.get("port"));
  });

  // Render index.ejs to browser
  app.get('/', (req, res) => {
    if (err) throw err;
    res.render('app/index', {
      content_title: "This is the questbook section",
      content_text: "Please, write something down :)",
      content_heading: "GUESTBOOK"
    });
  });

  // Render guestbook data to browser
  app.get('/guestbook', (req, res) => {
    db.collection("data").find({}).sort({"_id": 1}).toArray(function(err, result) {
      if (err) throw err;
      // console.log(result)
      res.render("app/index-guestbook", {
        data: result,
        content_title: "This is the questbook section",
        content_text: "Please, write something down :)",
        content_heading: "GUESTBOOK"
      });
    });
  });

  // Render new message to browser
  app.get('/newmessage', (req, res) => {
    res.render('app/index-newmessage')
  });

  // Insert data to database in mlab
  app.post('/newmessage', (req, res) => {
    db.collection("data").insertOne(req.body, (err, result) => {
      if (err) throw err;
      console.log(req.body);
      console.log('The data has been updated to our database!');
      res.redirect('/');
    });
  });

  // Render edit messages page
  app.get('/edit', (req, res) => {
    // Sort with latest posts added in database
    db.collection("data").find({}).sort({"_id": 1}).toArray((err, result) => {
     res.render("app/edit-message", {
      data: result
    });
  });
});

// Edit messages
app.post('/edit-action', (req, res) => {
  db.collection("data").updateOne({username: req.body.username}, {$set: {"message": req.body.message}}, (err, result) => {
    res.render("app/edit-action", {
      data: result
    });
  });
});

  // Render admin page
  app.get('/admin', (req, res) => {
    // Sort with latest posts added in database
    db.collection("data").find({}).sort({"_id": 1}).toArray((err, result) => {
      if (err) throw err;
      res.render("app/admin", {
        data: result
      });
    });
  });

  // Remove user from database in mlab
  app.post('/delete', (req, res) => {
    db.collection("data").deleteOne({username: req.body.username}, (err, result) => {
      if (err) throw err;
      console.log(req.body.username + " has been deleted!");
      res.render("app/delete", {
        data: result
      });
    });
  });

});
