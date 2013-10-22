(function() {
  var Application, pubsub, _fn, _i, _key, _len, _ref;

  pubsub = require('./PubSub');

  Application = (function() {

    function Application() {}

    Application.mixin = function(api) {
      var method, name;
      Application.api = api;
      api.application = {};
      for (name in Application) {
        method = Application[name];
        api.application[name] = method;
      }
      return delete api.application.mixin;
    };

    Application.GetProperties = function(names, fn) {
      var dfd, properties = [];
      if (fn == null) {
        fn = null;
      }

      names.split(',').forEach(function(name) {
        properties.push(name);
      });

      dfd = Application.api.send('Application.GetProperties', {
        properties: properties
      });

      return dfd.then(function(data) {
        if (fn) {
          return fn(data);
        }
      });
    };

    Application.SetVolume = function(value, fn) {
      var dfd;
      if (fn == null) {
        fn = null;
      }

      dfd = Application.api.send('Application.SetVolume', {
        volume: value
      });

      return dfd.then(function(data) {
        if (fn) {
          return fn(data);
        }
      });
    };

    Application.Mute = function(fn) {
      return Application.SetVolume(0, fn);
    };

    Application.ReduceVolume = function(fn) {
      return Application.GetProperties('volume', function(data) {
        var now = data.result.volume;
        if(now !== 0) {
          now -= 1;
        }
        return Application.SetVolume(now, fn);
      });
    };

    Application.IncreaseVolume = function(fn) {
      return Application.GetProperties('volume', function(data) {
        var now = data.result.volume;
        if(now !== 100) {
          now += 1;
        }
        return Application.SetVolume(now, fn);
      });
    };

    return Application;

  }).call(this);

  module.exports = Application;

}).call(this);
