/* globals app:true, config:true */

config = require(__dirname + "/config");

var fs = require("fs"),
    host = config.host,
    port = process.env.PORT || config.port;

// Production or Development mode?
process.env.NODE_ENV = process.env.NODE_ENV || config.node_env;

// create express app instance
var express = require("express"),
    stylus = require("stylus"),
    uglifyJS = require("uglifyjs-middleware");
// instantiate as global variable
app = new express();

// development only
if ("development" == app.get("env")) {
  app.locals.pretty = true;
  app.set("debug", true);
  if (!fs.existsSync(__dirname + "/tmp")) {
    fs.mkdirSync(__dirname + "/tmp");
  }
}

// production only
if ("production" == app.get("env")) {
  app.set("debug", false);
}

// enable jade templating
// templates stored in 'views'
app.set("views", __dirname + "/views");
app.set("view engine", "jade");

// enable gzip compression
app.use(express.compress());

// Enable sessions & cookies
//app.use(express.cookieParser());
//app.use(express.cookieSession({
//  secret: "1234567890QWERTY",
//  cookie:{ maxAge: 1000 * 30}
//}));

// Give Views/Layouts direct access to session data.
app.use(function(req, res, next){
  res.locals.session = req.session;
  next();
});

// ensure routes override static files of same name
// such as /gallery vs gallery.html
app.use(app.router);

// enable stylus css middleware
// styl files in 'stylesheets'
// compiled css in 'static/css'
app.use(stylus.middleware({
    src:  __dirname + "/stylesheets/",
    dest: __dirname + "/static/css/",
    debug: app.settings.debug,
    compile : function(str, path) {
      "use strict";
      //console.log("compiling");
      return stylus(str)
        .set("filename", path)
        .set("warn", false)
        .set("compress", true);
    }
  })
 );

// Compress css and JS in /static
// and generate source maps
app.use(uglifyJS(__dirname + "/static", {
    generateSourceMap: true
  }
));

// expose /static for css and js files
app.use(express.static(__dirname + "/static", { maxAge: 6000000 }));
app.use(express.favicon(__dirname + "/static/css/img/favicon.ico", { maxAge: 6000000 }));

// retrieves Collections or Photosets for slideout and
// caches their results
var slideout = require("./slideout").main;
slideout.load = new slideout();

// retrieve routes from routes.js
var routes = require("./routes").main;
routes.load = new routes();

// determine if we want to run the http server. Loaded from config
if (config.runServer) {
  app.listen(port, function () {
    "use strict";
    console.log("Started in " + app.get("env") + " mode");
    console.log("Server listening on:\nhttp://" + host + ":" + port +
                "\nPress CTRL-C to terminate");
  });
}
