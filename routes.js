/* globals app, config */
var flickr = require(__dirname + "/lib/flickr");

exports.main = function() {
  "use strict";

//  app.get("/*", function(req, res, next){
//    res.setHeader("cache-control", "private");
//    res.setHeader("Expires", "Thu, 15 Apr 2020 20:00:00 GMT");
//    res.setHeader("ETag", "11062013");
    //res.setHeader("cache-control", "no-store, no-cache, must-revalidate");
    //res.setHeader("pragma", "no-store, no-cache");
    //res.setHeader("Expires", "-");
    //res.setHeader("ETag", Date.now());
    //res.setHeader("Last-Modified", (new Date()).toUTCString());
//    next();
//  });

// exposes "/"
  app.get("/", function renderIndex(req, res) {
    if (config.use === "collections") {
      res.render("index", {
        title : config.title,
        quote : config.quote,
        author : config.quoteAuthor,
        getAlbums : app.locals.collections
      });
    } else {
      res.render("index", {
        title : config.title,
        quote : config.quote,
        author : config.quoteAuthor,
        getAlbums : app.locals.photosets
      });
    }
    //if (req.session.lastPage) {
      //console.log(req.session.lastPage);
      //req.session.lastPage = "index";
      //console.log(req.session.lastPage);
    //}
  }); // End "/"

  // exposes "/gallery"
  app.get("/gallery", function renderGallery(req, res) {
    if (!req.query.album) {
      res.json(404, {"Error": "No Album Specified!",
                "Usage": "?album=ALBUM_ID"});
    } else if (req.xhr) {
      var id = req.query.album;
      flickr.getPhotoSetPhotos(id,
        function retrievePhotosets() {
          var data = [];
          var i = -1,
              ilen = this.length;
          while (++i < ilen) {
            data.push({large:this[i].large, thumb:this[i].thumb});
          }
          res.render("gallery", {
            galleryTitle : req.query.title || "Gallery",
            data : JSON.stringify(data)
          });
        });
    } else {
      res.redirect("/");
    }// else {
    //  res.json(404, {"Error": "Function not Supported"});
    //}
  }); // End "/gallery"
}; // End main
