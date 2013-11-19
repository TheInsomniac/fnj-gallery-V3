'use strict'; /*jslint es5: true, node: true, indent: 2 */

var config = require(__dirname + '/../flickr.json');

var flickr = require('flickr-with-uploads'),
    api = flickr(
      config.api_key,
      config.api_secret,
      config.oauth_token,
      config.oauth_secret
    );

function flickrError(data) {
  console.log('[Error!]');
  console.log(data.code + ': ', data.message);
  //process.exit(1);
}

function testLogin() {
  api({method: 'flickr.test.login'}, function(err, data) {
    if (data.stat === 'ok') {
      console.log('[Authenticated with Flickr]');
    } else {
      console.log('[Authentication with Flickr failed');
      flickrError(data);
      process.exit(1);
    }
  });
}

function getUserPhotoSets(callback) {
  var albums = [];
  api({method: 'flickr.photosets.getList'}, function(err, data) {
    if (err) {
      console.log(err);
    } else if (data.stat === 'ok' && callback) {
      var photoSets = data.photosets.photoset;
      var i = -1,
          ilen = photoSets.length;
      while (++i < ilen) {
        albums.push({
          id: photoSets[i].id,
          title: photoSets[i].title._content
        });
      }
      callback.call(albums);
    } else {
      flickrError(data);
    }
  });
}

function getUserCollections(callback) {
  api({method: 'flickr.collections.getTree'}, function(err, data) {
    var albums = [];
    if (err) {
      console.log(err);
    } else if (data.stat === 'ok' && callback) {
      var collections = data.collections.collection;
      var i = -1,
          ilen = collections.length;
      while (++i < ilen) {
        var collection = [];
        var x = -1,
            xlen = collections[i].set.length;
        while (++x < xlen) {
          collection.push({
            id: collections[i].set[x].id,
            title: collections[i].set[x].title
          });
        }
        albums.push({
          title: collections[i].title,
          albums: collection
        });
      }
      callback.call(albums);
    } else {
      flickrError(data);
    }
  });
}

function getPhotoSetPhotos(id, callback) {
  var extras = 'url_q,url_n,url_z,url_o';
  api({method: 'flickr.photosets.getPhotos',
    photoset_id: id,
    extras: extras
    }, function(err, data) {
    if (err) {
      console.log(err);
    } else if (data.stat === 'ok' && callback) {
      var photos = [];
      var photoSet = data.photoset.photo;
      var i = photoSet.length;
      while(i--) {
        var title,
            large_url;
        title = photoSet[i].title.slice(0, -4).replace(/[^A-Za-z0-9]+/g, ' ');
        large_url = 'http://farm' +
          photoSet[i].farm + '.staticflickr.com/' +
          photoSet[i].server + '/' + photoSet[i].id +
          '_' + photoSet[i].secret + '_b.jpg';
        photos.push({
          title: title,
          thumb: photoSet[i].url_q,
          small: photoSet[i].url_n,
          medium: photoSet[i].url_z,
          large: large_url,
          original: photoSet[i].url_o
        });
      }
      callback.call(photos);
    } else {
      flickrError(data);
    }
  });
}
module.exports = {
  testLogin: testLogin,
  getUserPhotoSets: getUserPhotoSets,
  getPhotoSetPhotos: getPhotoSetPhotos,
  getUserCollections: getUserCollections,
};
