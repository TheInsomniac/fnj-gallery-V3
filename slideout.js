/* globals app */
var flickr = require(__dirname + "/lib/flickr");

exports.main = function() {
  "use strict";

  // Test flickr authentication
  flickr.testLogin();

  flickr.getUserCollections(function () {
    var collections = [];
    var i = -1,
        ilen = this.length;
    while (++i < ilen) {
      var item = [];
      var x = -1,
          xlen = this[i].albums.length;
      while (++x < xlen) {
        item.push("<li>" +
          "<a class=\"item\" href=\"javascript:void(0)\" " +
          "onclick=" +
          "\"loadAlbum('" +
          this[i].albums[x].id +
          "','" +
          this[i].albums[x].title.replace(/_/gi, "%20") + "')\">" +
          "<i class=\"icon-camera icon-white\"></i>&nbsp;" +
          this[i].albums[x].title.replace(/_/gi, " ") +
          "</a></li>"
        );
      }
      if (this[i].title !== "Root") {
        collections.unshift("<li class='expanded'>" +
          "<a href='#'>" +
          "<i class='icon-folder-close icon-white'>" +
          "</i>&nbsp;" +
          this[i].title +
          "</a><ul class='sublist'>" +
          item.join("") +
          "</ul></li>"
        );
      } else {
        collections.push(item.join(""));
      }
    }
    app.set("collections", collections.join(""));
    console.log("[Collections Obtained]");
  });

  flickr.getUserPhotoSets(function () {
    var photosets = [];
    var i = -1,
        ilen = this.length;
    while (++i < ilen) {
      photosets.push("<li><a href='/gallery.html?album=" +
        this[i].id +
        "&amp;title=" + this[i].title.replace(/_/gi, "%20") +
        "'><i class='icon-camera icon-white'></i>&nbsp;"  +
        this[i].title.replace(/_/gi, " ") +
        "</a></li>");
    }
    app.set("photosets", photosets.join(""));
    console.log("[Photosets Obtained]");
  });
}; // end Main
