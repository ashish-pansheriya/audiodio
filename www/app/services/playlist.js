angular.module('audiodio.playlist', [])
.factory('session', ['$http', '$q', '$rootScope',
  function ($http, $q, $rootScope) {

    var session = {
      maxSessionSize : 500
    };

    session.temp = [];
    session.playlist = [];
    session.playlistName = 'Recently Played'; //DEPRECATED
    session.getSongs = function () {
      return session.playlist;
    };
    session.clearSongs = function () {
      session.playlist = [];
      session.playlistName = 'Recently Played';
    };
    session.add = function (model) {
      var song = angular.copy(model); //fixed a funny bug where scope lost the model reference?
      if (session.indexOfSongByXipath(song.xipath) < 0 && song.xipath  && session.playlist.length < session.maxSessionSize) {
        session.playlist.push(song);
      }
    };
    session.indexOfSongByXipath = function (xi) {
      for (var s in session.playlist) {
        if (session.playlist[s].xipath === xi) {
          return parseInt(s);
        }
      }
      return -1;
    };
    session.removeSongByXipath = function (xi) {
      var killMe = session.indexOfSongByXipath(xi);
      if (killMe > -1) {
        session.playlist.splice(killMe, 1);
      }
    };

    session.getNextXipath = function (xipath) {

      var currentPosition = session.indexOfSongByXipath(xipath);
      if (currentPosition > -1 && currentPosition < session.playlist.length - 1) {
        return session.playlist[currentPosition + 1].xipath || '';//xipath;
      } else if (currentPosition > -1) {
        return '';//xipath;
      } else {
        return '';//xipath;
      }
    };

    //The following two methods are used to pass along a list of song models
    // TODO: improve dataflow from playlists -> playlist view
    session.holdPlaylist = function (songs) {
      session.temp = songs;
    };
    session.getHeldPlaylist = function () {
      return session.temp;
    };


    session.getPlaylistName = function () {
      return session.playlistName;
    };
    session.resetPlaylistName = function () {
      session.setPlaylistName('Recently Played');
    };
    session.setPlaylistName = function (name) {
      session.playlistName = name;
    };
    session.removePlaylist = function (link, user, listname) {
      var cb = $q.defer();

      link += user; //path param
      link += '?name=' + listname;

      $http.delete(link).then(function (res) {
          cb.resolve(true);
        },
        function (err) {
          cb.resolve(false);
        });
      return cb.promise;

    };

    session.getPlaylists = function (link, user) {
      var cb = $q.defer();

      link += user; //path param
      link += '?name=' + session.playlistName;

      $http.get(link).then(function (res) {
          var lists = [];
          for (var l in res.data) {
            lists[l] ={
              songs: res.data[l].xipaths,
              name: res.data[l].listName,
              _id: res.data[l]._id
            };
          }

          cb.resolve(lists);
        },
        function (err) {
          cb.resolve([]);
        });
      return cb.promise;
    };
    session.getPlaylistByName = function (link, user, name) {
      var cb = $q.defer();
      session.getPlaylists(link, user).then(function (lists) {
        for (var l in lists) {
          if (lists[l].name === name) {
            cb.resolve(lists[l]);
          }
        }
        cb.resolve([]);
      });
      return cb.promise;
    };

    session.savePlaylist =  function (link, user) {
      var cb = $q.defer();

      link += user; //path param
      link += '?name=' + session.playlistName;

      if (session.playlist.length > 0) {
        link += '&xipath=' + session.playlist[0].xipath;
        for (var xi = 1; xi < session.playlist.length; xi++) {
          link += ',' + session.playlist[xi].xipath;
        }
        $http.put(link).then(function (res) {
            cb.resolve(true);
          },
          function (err) {
            cb.resolve(false);
          });
      } else {
        cb.resolve(false);
      }

      return cb.promise;
    };
    return session;
  }]);


