/**
 * Satellizer 0.10.1
 * (c) 2015 Sahat Yalkabov
 * License: MIT
 */
/*
  * login
  * new-session
  * logout
  * new-registration
  * unauthorized
*/
(function(window, angular, undefined) {
  'use strict';

  angular.module('satellizer', [])
    .constant('satellizer.config', {
      httpInterceptor: true,
      httpEventsInterceptor: true,
      loginOnSignup: true,
      baseUrl: '/',
      loginRedirect: '/',
      logoutRedirect: '/',
      signupRedirect: '/login',
      loginUrl: '/auth/login',
      signupUrl: '/auth/signup',
      loginRoute: '/login',
      signupRoute: '/signup',
      tokenRoot: false,
      tokenName: 'token',
      tokenPrefix: 'satellizer',
      unlinkUrl: '/auth/unlink/',
      unlinkMethod: 'get',
      authHeader: 'Authorization',
      authToken: 'Bearer',
      withCredentials: true,
      platform: 'browser',
      storage: 'localStorage',
      providers: {
        google: {
          name: 'google',
          url: '/auth/google',
          authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
          redirectUri: window.location.origin || window.location.protocol + '//' + window.location.host,
          scope: ['profile', 'email'],
          scopePrefix: 'openid',
          scopeDelimiter: ' ',
          requiredUrlParams: ['scope'],
          optionalUrlParams: ['display'],
          display: 'popup',
          type: '2.0',
          popupOptions: { width: 452, height: 633 },
          postmessageRelay: 'https://accounts.google.com/o/oauth2/postmessageRelay?forcesecure=1&parent={0}'
        },
        facebook: {
          name: 'facebook',
          url: '/auth/facebook',
          authorizationEndpoint: 'https://www.facebook.com/v2.3/dialog/oauth',
          redirectUri: window.location.origin + '/' || window.location.protocol + '//' + window.location.host + '/',
          scope: ['email'],
          scopeDelimiter: ',',
          requiredUrlParams: ['display', 'scope'],
          display: 'popup',
          type: '2.0',
          popupOptions: { width: 580, height: 400 },
          postmessageRelay: ""
        },
        linkedin: {
          name: 'linkedin',
          url: '/auth/linkedin',
          authorizationEndpoint: 'https://www.linkedin.com/uas/oauth2/authorization',
          redirectUri: window.location.origin || window.location.protocol + '//' + window.location.host,
          requiredUrlParams: ['state'],
          scope: ['r_emailaddress'],
          scopeDelimiter: ' ',
          state: 'STATE',
          type: '2.0',
          popupOptions: { width: 527, height: 582 },
          postmessageRelay: ""
        },
        github: {
          name: 'github',
          url: '/auth/github',
          authorizationEndpoint: 'https://github.com/login/oauth/authorize',
          redirectUri: window.location.origin || window.location.protocol + '//' + window.location.host,
          optionalUrlParams: ['scope'],
          scope: ['user:email'],
          scopeDelimiter: ' ',
          type: '2.0',
          popupOptions: { width: 1020, height: 618 },
          postmessageRelay: ""
        },
        yahoo: {
          name: 'yahoo',
          url: '/auth/yahoo',
          authorizationEndpoint: 'https://api.login.yahoo.com/oauth2/request_auth',
          redirectUri: window.location.origin || window.location.protocol + '//' + window.location.host,
          scope: [],
          scopeDelimiter: ',',
          type: '2.0',
          popupOptions: { width: 559, height: 519 },
          postmessageRelay: ""
        },
        twitter: {
          name: 'twitter',
          url: '/auth/twitter',
          authorizationEndpoint: 'https://api.twitter.com/oauth/authenticate',
          type: '1.0',
          popupOptions: { width: 495, height: 645 },
          postmessageRelay: ""
        },
        live: {
          name: 'live',
          url: '/auth/live',
          authorizationEndpoint: 'https://login.live.com/oauth20_authorize.srf',
          redirectUri: window.location.origin || window.location.protocol + '//' + window.location.host,
          scope: ['wl.emails'],
          scopeDelimiter: ' ',
          requiredUrlParams: ['display', 'scope'],
          display: 'popup',
          type: '2.0',
          popupOptions: { width: 500, height: 560 },
          postmessageRelay: ""
        }
      }
    })
    .factory('satellizer.messaging', ['$timeout', function ($timeout) {
      var _callbacks = {};

      return {
        on: function (namespace, event, callback, name) {
          if (name) {
            callback._cbName = name;
          }
          if (!_callbacks[namespace]) {
            _callbacks[namespace] = {};
            _callbacks[namespace][event] = [callback];
          } else if (!_callbacks[namespace][event]) {
            _callbacks[namespace][event] = [callback];
          } else {
            _callbacks[namespace][event].push(callback);
          }
          return this;
        },
        off: function (namespace, event, callbackOrName) {
          if (!_callbacks[namespace] || !_callbacks[namespace][event]) {
            return this;
          }
          var idx;
          if (angular.isFunction(callbackOrName)) {
            idx = _callbacks[namespace][event].indexOf(callbackOrName);
          } else if (angular.isString(callbackOrName)) {
            var cb = _.find(_callbacks[namespace][event], function (cb) {
              return cb._cbName && cb._cbName === callbackOrName;
            });
            idx = _callbacks[namespace][event].indexOf(cb);
          }
          if (idx < 0) {
            return this;
          }
          _callbacks[namespace][event].splice(idx, 1);
          return this;
        },
        trigger: function (namespace, event/*, args */) {
          if (!_callbacks[namespace] || !_callbacks[namespace][event]) {
            return this;
          }
          var args = Array.prototype.splice.call(arguments, 2)
            , cbs = _callbacks[namespace][event];
          $timeout(function() {
            var cb, i;
            for (i = 0; i < cbs.length; i++) {
              cb = cbs[i];
              cb.apply(null, args);
            }
          });
          return this;
        }
      };
    }])
    .provider('$auth', ['satellizer.config', function(config) {
      Object.defineProperties(this, {
        baseUrl: {
          get: function() { return config.baseUrl; },
          set: function(value) { config.baseUrl = value; }
        },
        httpInterceptor: {
          get: function() { return config.httpInterceptor; },
          set: function(value) { config.httpInterceptor = value; }
        },
        loginOnSignup: {
          get: function() { return config.loginOnSignup; },
          set: function(value) { config.loginOnSignup = value; }
        },
        logoutRedirect: {
          get: function() { return config.logoutRedirect; },
          set: function(value) { config.logoutRedirect = value; }
        },
        loginRedirect: {
          set: function(value) { config.loginRedirect = value; },
          get: function() { return config.loginRedirect; }
        },
        signupRedirect: {
          get: function() { return config.signupRedirect; },
          set: function(value) { config.signupRedirect = value; }
        },
        loginUrl: {
          get: function() { return config.loginUrl; },
          set: function(value) { config.loginUrl = value; }
        },
        signupUrl: {
          get: function() { return config.signupUrl; },
          set: function(value) { config.signupUrl = value; }
        },
        loginRoute: {
          get: function() { return config.loginRoute; },
          set: function(value) { config.loginRoute = value; }
        },
        signupRoute: {
          get: function() { return config.signupRoute; },
          set: function(value) { config.signupRoute = value; }
        },
        tokenRoot: {
          get: function() { return config.tokenRoot; },
          set: function(value) { config.tokenRoot = value; }
        },
        tokenName: {
          get: function() { return config.tokenName; },
          set: function(value) { config.tokenName = value; }
        },
        tokenPrefix: {
          get: function() { return config.tokenPrefix; },
          set: function(value) { config.tokenPrefix = value; }
        },
        unlinkUrl: {
          get: function() { return config.unlinkUrl; },
          set: function(value) { config.unlinkUrl = value; }
        },
        authHeader: {
          get: function() { return config.authHeader; },
          set: function(value) { config.authHeader = value; }
        },
        authToken: {
          get: function() { return config.authToken; },
          set: function(value) { config.authToken = value; }
        },
        withCredentials: {
          get: function() { return config.withCredentials; },
          set: function(value) { config.withCredentials = value; }
        },
        unlinkMethod: {
          get: function() { return config.unlinkMethod; },
          set: function(value) { config.unlinkMethod = value; }
        },
        platform: {
          get: function() { return config.platform; },
          set: function(value) { config.platform = value; }
        },
        storage: {
          get: function() { return config.storage; },
          set: function(value) { config.storage = value; }
        }
      });

      angular.forEach(Object.keys(config.providers), function(provider) {
        this[provider] = function(params) {
          return angular.extend(config.providers[provider], params);
        };
      }, this);

      var oauth = function(params) {
        config.providers[params.name] = config.providers[params.name] || {};
        angular.extend(config.providers[params.name], params);
      };

      this.oauth1 = function(params) {
        oauth(params);
        config.providers[params.name].type = '1.0';
      };

      this.oauth2 = function(params) {
        oauth(params);
        config.providers[params.name].type = '2.0';
      };

      this.$get = [
        '$q',
        'satellizer.shared',
        'satellizer.local',
        'satellizer.oauth',
        'satellizer.messaging',
        function($q, shared, local, oauth, messaging) {
          var $auth = {};

          $auth.authenticate = function(name, userData) {
            return oauth.authenticate(name, false, userData);
          };

          $auth.login = function(user, redirect) {
            return local.login(user, redirect);
          };

          $auth.signup = function(user) {
            return local.signup(user);
          };

          $auth.logout = function(redirect) {
            return shared.logout(redirect);
          };

          $auth.isAuthenticated = function() {
            return shared.isAuthenticated();
          };

          $auth.link = function(name, userData) {
            return oauth.authenticate(name, true, userData);
          };

          $auth.unlink = function(provider) {
            return oauth.unlink(provider);
          };

          $auth.getToken = function() {
            return shared.getToken();
          };

          $auth.setToken = function(token, redirect) {
            shared.setToken({ access_token: token }, redirect);
          };

          $auth.removeToken = function() {
            return shared.removeToken();
          };

          $auth.getPayload = function() {
            return shared.getPayload();
          };

          $auth.setStorage = function(type) {
            return shared.setStorage(type);
          };

          // Event subscribe
          $auth.on = function(event, callback, name){
            messaging.on('satellizer', event, callback, name);
            return this;
          };

          // Event unsubscribe
          $auth.off = function(event, callbackOrName){
            messaging.off('satellizer', event, callbackOrName);
            return this;
          };

          return $auth;
        }];

    }])
    .factory('satellizer.shared', [
      '$q',
      '$window',
      '$location',
      'satellizer.config',
      'satellizer.storage',
      'satellizer.messaging',
      function($q, $window, $location, config, storage, messaging) {
        var shared = {};
        var tokenName = config.tokenPrefix ? config.tokenPrefix + '_' + config.tokenName : config.tokenName;

        shared.getToken = function() {
          return storage.get(tokenName);
        };

        shared.getPayload = function() {
          var token = storage.get(tokenName);

          if (token && token.split('.').length === 3) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            return JSON.parse(decodeURIComponent(escape(window.atob(base64))));
          }
        };

        shared.setToken = function(response, redirect) {
          var accessToken = response && response.access_token;
          var token;

          if (accessToken) {
            if (angular.isObject(accessToken) && angular.isObject(accessToken.data)) {
              response = accessToken;
            } else if (angular.isString(accessToken)) {
              token = accessToken;
            }
          }

          if (!token && response) {
            token = config.tokenRoot && response.data[config.tokenRoot] ?
              response.data[config.tokenRoot][config.tokenName] : response.data[config.tokenName];
          }

          if (!token) {
            var tokenPath = config.tokenRoot ? config.tokenRoot + '.' + config.tokenName : config.tokenName;
            throw new Error('Expecting a token named "' + tokenPath + '" but instead got: ' + JSON.stringify(response.data));
          }

          storage.set(tokenName, token);

          if (config.loginRedirect && !redirect) {
            $location.path(config.loginRedirect);
          } else if (redirect && angular.isString(redirect)) {
            $location.path(encodeURI(redirect));
          }
        };

        shared.removeToken = function() {
          storage.remove(tokenName);
        };

        shared.isAuthenticated = function() {
          var token = storage.get(tokenName);

          if (token) {
            if (token.split('.').length === 3) {
              var base64Url = token.split('.')[1];
              var base64 = base64Url.replace('-', '+').replace('_', '/');
              var jtok = JSON.parse($window.atob(base64));
              if (jtok.exp) {
                return Math.round(new Date().getTime() / 1000) <= jtok.exp;
              }
            }
            return true;
          }
          return false;
        };

        shared.logout = function(redirect) {
          storage.remove(tokenName);
          messaging.trigger('satellizer', 'satellizer:logout', tokenName);

          if (config.logoutRedirect && !redirect) {
            $location.url(config.logoutRedirect);
          }
          else if (angular.isString(redirect)) {
            $location.url(redirect);
          }

          return $q.when();
        };

        shared.setStorage = function(type) {
          config.storage = type;
        };

        return shared;
      }])
    .factory('satellizer.oauth', [
      '$q',
      '$http',
      'satellizer.config',
      'satellizer.shared',
      'satellizer.Oauth1',
      'satellizer.Oauth2',
      'satellizer.messaging',
      function($q, $http, config, shared, Oauth1, Oauth2, messaging) {
        var oauth = {};

        oauth.authenticate = function(name, redirect, userData) {
          var provider = config.providers[name].type === '1.0' ? new Oauth1() : new Oauth2();
          var deferred = $q.defer();

          provider.open(config.providers[name], userData || {})
            .then(function(response) {
              shared.setToken(response, redirect);
              deferred.resolve(response);
              messaging.trigger('satellizer', 'satellizer:oauth-login-success', response);
              messaging.trigger('satellizer', 'satellizer:login-success', response);
            })
            .catch(function(error) {
              deferred.reject(error);
              messaging.trigger('satellizer', 'satellizer:oauth-login-error', error);
              messaging.trigger('satellizer', 'satellizer:login-error', error);
            });

          return deferred.promise;
        };

        oauth.unlink = function(provider) {
          var res;
          if (config.unlinkMethod === 'get') {
            res = $http.get(config.unlinkUrl + provider);
          } else if (config.unlinkMethod === 'post') {
            res = $http.post(config.unlinkUrl, provider);
          }
          return res;
        };

        return oauth;
      }])
    .factory('satellizer.local', [
      '$q',
      '$http',
      '$location',
      'satellizer.utils',
      'satellizer.shared',
      'satellizer.config',
      'satellizer.messaging',
      function($q, $http, $location, utils, shared, config, messaging) {
        var local = {};

        local.login = function(user, redirect) {
          var loginUrl = config.baseUrl ? utils.joinUrl(config.baseUrl, config.loginUrl) : config.loginUrl;
          return $http.post(loginUrl, user)
            .then(function(response) {
              shared.setToken(response, redirect);
              messaging.trigger('satellizer', 'satellizer:local-login-success', response);
              messaging.trigger('satellizer', 'satellizer:login-success', response);
              return response;
            });
        };

        local.signup = function(user) {
          var signupUrl = config.baseUrl ? utils.joinUrl(config.baseUrl, config.signupUrl) : config.signupUrl;
          return $http.post(signupUrl, user)
            .then(function(response) {
              messaging.trigger('satellizer', 'satellizer:signup', response);
              if (config.loginOnSignup) {
                shared.setToken(response);
              } else if (config.signupRedirect) {
                $location.path(config.signupRedirect);
              }
              return response;
            });
        };

        return local;
      }])
    .factory('satellizer.Oauth2', [
      '$q',
      '$http',
      '$window',
      'satellizer.popup',
      'satellizer.utils',
      'satellizer.config',
      'satellizer.storage',
      function($q, $http, $window, popup, utils, config, storage) {
        return function() {

          var defaults = {
            url: null,
            name: null,
            state: null,
            scope: null,
            scopeDelimiter: null,
            clientId: null,
            redirectUri: null,
            popupOptions: null,
            authorizationEndpoint: null,
            responseParams: null,
            requiredUrlParams: null,
            optionalUrlParams: null,
            defaultUrlParams: ['response_type', 'client_id', 'redirect_uri'],
            responseType: 'code'
          };

          var oauth2 = {};

          oauth2.open = function(options, userData) {
            angular.extend(defaults, options);

            var stateName = defaults.name + '_state';

            if (angular.isFunction(defaults.state)) {
              storage.set(stateName, defaults.state());
            } else if (angular.isString(defaults.state)) {
              storage.set(stateName, defaults.state);
            }

            if(defaults.redirectUri === 'postmessage'){
              // Register the relevant post message options
              defaults.proxy = 'oauth2relay' + Math.floor(Math.random() * 100000);
              defaults.origin = (window.location.origin || 
                                    window.location.protocol + '//' + window.location.host);
              angular.extend(defaults.optionalUrlParams, ['proxy', 'origin']);  
            }

            var url = defaults.authorizationEndpoint + '?' + oauth2.buildQueryString();

            var validateAndExchange = function(oauthData){
              if (defaults.responseType === 'token') {
                return oauthData;
              }
              if (oauthData.state && oauthData.state !== storage.get(stateName)) {
                return $q.reject('OAuth 2.0 state parameter mismatch.');
              }
              return oauth2.exchangeForToken(oauthData, userData);
            };

            if(defaults.redirectUri === 'postmessage'){
              return popup.open(url, defaults.name, defaults.popupOptions, defaults.redirectUri)
                .handlePostMessage(defaults.origin, defaults.proxy, options)
                .then(validateAndExchange);
            }
            return popup.open(url, defaults.name, defaults.popupOptions, defaults.redirectUri)
              .pollPopup()
              .then(validateAndExchange);
          };

          oauth2.exchangeForToken = function(oauthData, userData) {
            var data = angular.extend({}, userData, {
              code: oauthData.code,
              clientId: defaults.clientId,
              redirectUri: defaults.redirectUri
            });

            if (oauthData.state) {
              data.state = oauthData.state;
            }

            angular.forEach(defaults.responseParams, function(param) {
              data[param] = oauthData[param];
            });

            var exchangeForTokenUrl = config.baseUrl ? utils.joinUrl(config.baseUrl, defaults.url) : defaults.url;
            return $http.post(exchangeForTokenUrl, data, { withCredentials: config.withCredentials });
          };

          oauth2.buildQueryString = function() {
            var keyValuePairs = [];
            var urlParams = ['defaultUrlParams', 'requiredUrlParams', 'optionalUrlParams'];

            angular.forEach(urlParams, function(params) {
              angular.forEach(defaults[params], function(paramName) {
                var camelizedName = utils.camelCase(paramName);
                var paramValue = defaults[camelizedName];

                if (paramName === 'state') {
                  var stateName = defaults.name + '_state';
                  paramValue = encodeURIComponent(storage.get(stateName));
                }

                if (paramName === 'scope' && Array.isArray(paramValue)) {
                  paramValue = paramValue.join(defaults.scopeDelimiter);

                  if (defaults.scopePrefix) {
                    paramValue = [defaults.scopePrefix, paramValue].join(defaults.scopeDelimiter);
                  }
                }

                keyValuePairs.push([paramName, paramValue]);
              });
            });

            return keyValuePairs.map(function(pair) {
              return pair.join('=');
            }).join('&');
          };

          return oauth2;
        };
      }])
    .factory('satellizer.Oauth1', [
      '$q',
      '$http',
      'satellizer.popup',
      'satellizer.config',
      'satellizer.utils',
      function($q, $http, popup, config, utils) {
        return function() {

          var defaults = {
            url: null,
            name: null,
            popupOptions: null,
            redirectUri: null,
            authorizationEndpoint: null
          };

          var oauth1 = {};

          oauth1.open = function(options, userData) {
            angular.extend(defaults, options);
            var serverUrl = config.baseUrl ? utils.joinUrl(config.baseUrl, defaults.url) : defaults.url;
            var popupWindow = popup.open('', defaults.name, defaults.popupOptions, defaults.redirectUri);
            return $http.post(serverUrl)
              .then(function(response) {
                popupWindow.popupWindow.location.href = [defaults.authorizationEndpoint, oauth1.buildQueryString(response.data)].join('?');
                return popupWindow.pollPopup()
                  .then(function(response) {
                    return oauth1.exchangeForToken(response, userData);
                  });
              });

          };

          oauth1.exchangeForToken = function(oauthData, userData) {
            var data = angular.extend({}, userData, oauthData);
            var exchangeForTokenUrl = config.baseUrl ? utils.joinUrl(config.baseUrl, defaults.url) : defaults.url;
            return $http.post(exchangeForTokenUrl, data, { withCredentials: config.withCredentials });
          };

          oauth1.buildQueryString = function(obj) {
            var str = [];

            angular.forEach(obj, function(value, key) {
              str.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            });

            return str.join('&');
          };

          return oauth1;
        };
      }])
    .factory('satellizer.popup', [
      '$q',
      '$interval',
      '$window',
      '$location',
      'satellizer.config',
      'satellizer.utils',
      'satellizer.postmessage',
      function($q, $interval, $window, $location, config, utils, postmessage) {
        var popup = {};
        popup.url = '';
        popup.popupWindow = null;

        popup.open = function(url, windowName, options, redirectUri) {
          popup.url = url;

          var stringifiedOptions = popup.stringifyOptions(popup.prepareOptions(options || {}));

          popup.popupWindow = window.open(url, windowName, stringifiedOptions);

          if (popup.popupWindow && popup.popupWindow.focus) {
            popup.popupWindow.focus();
          }

          if (config.platform === 'mobile') {
            return popup.eventListener(redirectUri);
          }

          return popup;
        };

        popup.eventListener = function(redirectUri) {
          var deferred = $q.defer();

          popup.popupWindow.addEventListener('loadstart', function(event) {
            if (event.url.indexOf(redirectUri) !== 0) { return; }

            var parts = utils.parseUrl(event.url);
            if(parts.params){
              if (parts.params.error) {
                deferred.reject({ error: parts.params.error });
              } else {
                deferred.resolve(parts.params);
              }
              popup.popupWindow.close();
            }
          });

          popup.popupWindow.addEventListener('exit', function() {
            deferred.reject({ data: 'Provider Popup was closed' });
          });

          popup.popupWindow.addEventListener('loaderror', function() {
            deferred.reject({ data: 'Authorization Failed' });
          });

          return deferred.promise;
        };

        popup.pollPopup = function() {
          var polling;
          var deferred = $q.defer();

          polling = $interval(function() {
            try {
              var documentOrigin = document.location.host + ':' + document.location.port,
                popupWindowOrigin = popup.popupWindow.location.host + ':' + popup.popupWindow.location.port;

              if (popupWindowOrigin === documentOrigin && (popup.popupWindow.location.search || popup.popupWindow.location.hash)) {
                var queryParams = popup.popupWindow.location.search.substring(1).replace(/[\/$]/, '');
                var hashParams = popup.popupWindow.location.hash.substring(1).replace(/[\/$]/, '');
                var hash = utils.parseQueryString(hashParams);
                var qs = utils.parseQueryString(queryParams);

                angular.extend(qs, hash);

                if (qs.error) {
                  deferred.reject({ error: qs.error });
                } else {
                  deferred.resolve(qs);
                }

                popup.popupWindow.close();
                $interval.cancel(polling);
              }
            } catch (error) {
            }

            if (!popup.popupWindow) {
              $interval.cancel(polling);
              deferred.reject({ data: 'Provider Popup Blocked' });
            } else if (popup.popupWindow.closed || popup.popupWindow.closed === undefined) {
              $interval.cancel(polling);
              deferred.reject({ data: 'Authorization Failed' });
            }
          }, 35);
          return deferred.promise;
        };

        popup.handlePostMessage = function(origin, proxy_id, options){
          var polling;
          var deferred = $q.defer();

          // Create the proxy iframe
          var proxy_frame = document.createElement('iframe');
          var src = options.postmessageRelay.replace('{0}', encodeURIComponent(origin));
          proxy_frame.setAttribute("src", src);
          proxy_frame.setAttribute("id", proxy_id);
          proxy_frame.setAttribute("name", proxy_id);
          proxy_frame.setAttribute("tabindex", "-1");
          proxy_frame.style.width = "1px"; 
          proxy_frame.style.height = "1px"; 
          proxy_frame.style.position = "absolute"; 
          proxy_frame.style.top = "-100px;";
          document.body.appendChild(proxy_frame);

          var destroyProxyFrame = function(proxy_id){
            var e = document.getElementById(proxy_id);
            if(e){ document.body.removeChild(e); }
          };

          var _main = angular.element($window);

          // postmessage event handling function on the
          // main window
          var eventHandler = function(ev){
            try{ 
              var parser = postmessage.parser(options.name);
              var oauthData = parser.parse(ev);
              if(oauthData !== undefined){
                _main.off('message', eventHandler);
                destroyProxyFrame(proxy_id);
                deferred.resolve(oauthData); 
              }
              // we do not detach the event handler here as
              // an initial emtpy message is posted  (check the initial post)
            } 
            catch(err){
              _main.off('message', eventHandler);
              destroyProxyFrame(proxy_id);
              deferred.reject({ data: 'Postmessage error: ' + err }); 
            } 
          };

          _main.on('message', eventHandler);

          polling = $interval(function(){
            if (!popup.popupWindow) {
              $interval.cancel(polling);
              _main.off('message', eventHandler);
              destroyProxyFrame(proxy_id);
              deferred.reject({ data: 'Provider Popup Blocked' });
            } else if (popup.popupWindow.closed || popup.popupWindow.closed === undefined) {
              $interval.cancel(polling);
              _main.off('message', eventHandler);
              destroyProxyFrame(proxy_id);
              deferred.reject({ data: 'Authorization Failed' });
            }
          }, 1000);

          return deferred.promise;
        };

        popup.prepareOptions = function(options) {
          var width = options.width || 500;
          var height = options.height || 500;
          return angular.extend({
            width: width,
            height: height,
            left: $window.screenX + (($window.outerWidth - width) / 2),
            top: $window.screenY + (($window.outerHeight - height) / 2.5)
          }, options);
        };

        popup.stringifyOptions = function(options) {
          var parts = [];
          angular.forEach(options, function(value, key) {
            parts.push(key + '=' + value);
          });
          return parts.join(',');
        };

        return popup;
      }])
    .service('satellizer.utils', function() {
      this.camelCase = function(name) {
        return name.replace(/([\:\-\_]+(.))/g, function(_, separator, letter, offset) {
          return offset ? letter.toUpperCase() : letter;
        });
      };

      this.parseQueryString = function(keyValue) {
        var obj = {}, key, value;
        angular.forEach((keyValue || '').split('&'), function(keyValue) {
          if (keyValue) {
            value = keyValue.split('=');
            key = decodeURIComponent(value[0]);
            obj[key] = angular.isDefined(value[1]) ? decodeURIComponent(value[1]) : true;
          }
        });
        return obj;
      };

      this.parseUrl = function(url){
        var parser = document.createElement('a');
        parser.href = url;

        var parts = {};
        angular.forEach(parser, function(key, val){
          this[key] = val;
        }, parts);

        if (parser.search || parser.hash) {
          var queryParams = parser.search.substring(1).replace(/\/$/, '');
          var hashParams = parser.hash.substring(1).replace(/\/$/, '');
          parts.hash = this.parseQueryString(hashParams);
          parts.qs = this.parseQueryString(queryParams);
          parts.params = angular.extend({}, parts.hash, parts.qs);
        }
        return parts;
      };

      this.joinUrl = function() {
        var joined = Array.prototype.slice.call(arguments, 0).join('/');

        var normalize = function(str) {
          return str
            .replace(/[\/]+/g, '/')
            .replace(/\/\?/g, '?')
            .replace(/\/\#/g, '#')
            .replace(/\:\//g, '://');
        };

        return normalize(joined);
      };
    })
    .factory('satellizer.postmessage', [
      'satellizer.config', 
      'satellizer.utils',
      function(config, utils) {

        var parsers = {};

        parsers.google = function(ev) {
          var oauthev = ev.originalEvent;
          var data = JSON.parse(oauthev.data);

          if(data.a && data.a[0] !== undefined){
            if(data.a[0] === null){ return; } // frame init do nothing 
            var parts = utils.parseUrl(data.a[0]);
            if(parts.params === undefined || parts.params.error){
              throw parts.params.error;
            }
            return {
              code: parts.params.code,
              //state: parts.params.session_state, postmessage state
              hd: parts.params.hd,
              authuser: parts.params.authuser
            };
          }
        };

        var postmessage = {};
        postmessage.parser = function(name){
          return {
            parse: parsers[name]
          };
        };
        return postmessage;
    }])
    .factory('satellizer.storage', ['satellizer.config', function(config) {
      var ret;
      switch (config.storage) {
        case 'localStorage':
          if (window.localStorage !== undefined && window.localStorage !== null) {
            ret = {
              get: function(key) { return window.localStorage.getItem(key); },
              set: function(key, value) { return window.localStorage.setItem(key, value); },
              remove: function(key) { return window.localStorage.removeItem(key); }
            };
          } else {
            console.warn('Warning: Local Storage is disabled or unavailable. Satellizer will not work correctly.');
            ret = {
              get: function(key) { return undefined; },
              set: function(key, value) { return undefined; },
              remove: function(key) { return undefined; }
            };
          }
          return ret;

        case 'sessionStorage':
          if (window.sessionStorage !== undefined && window.sessionStorage !== null) {
            ret = {
              get: function(key) { return window.sessionStorage.getItem(key); },
              set: function(key, value) { return window.sessionStorage.setItem(key, value); },
              remove: function(key) { return window.sessionStorage.removeItem(key); }
            };
          } else {
            console.warn('Warning: Session Storage is disabled or unavailable. Satellizer will not work correctly.');
            ret = {
              get: function(key) { return undefined; },
              set: function(key, value) { return undefined; },
              remove: function(key) { return undefined; }
            };
          }
          return ret;
      }
    }])
    .factory('satellizer.interceptor', [
      '$q',
      'satellizer.config',
      'satellizer.storage',
      function($q, config, storage) {
        var tokenName = config.tokenPrefix ? config.tokenPrefix + '_' + config.tokenName : config.tokenName;
        return {
          request: function(request) {
            if (request.skipAuthorization) {
              return request;
            }
            var token = storage.get(tokenName);
            if (token && config.httpInterceptor) {
              if (config.authHeader && config.authToken) {
                token = config.authToken + ' ' + token;
              }
              request.headers[config.authHeader] = token;
            }
            return request;
          },
          responseError: function(response) {
            return $q.reject(response);
          }
        };
      }])
    .config(['$httpProvider', function($httpProvider) {
      $httpProvider.interceptors.push('satellizer.interceptor');
    }])
    .factory('satellizer.authinterceptor', [
      '$q',
      'satellizer.config',
      'satellizer.messaging', 
      function($q, config, messaging) {
        /**
        * Set to true to intercept 401 Unauthorized responses
        * Based on angular_devise interceptor by jridgewell 
        * (https://github.com/cloudspace/angular_devise)
        */

        // Only for intercepting 401 requests.
        return {
          responseError: function(response) {
            if (response.status === 401) {
              var deferred = $q.defer();
              messaging.trigger('satellizer', 'satellizer:notauthed', response, deferred);
              return deferred.promise;
            }

            return $q.reject(response);
          }
        };
    }])
    .config(['$httpProvider', 'satellizer.config', function($httpProvider, config) {
      if(config.httpEventsInterceptor === true){
        $httpProvider.interceptors.push('satellizer.authinterceptor');
      }
    }]);

}(window, window.angular));

// Base64.js Polyfill (@davidchambers)
(function() {
  var object = typeof exports != 'undefined' ? exports : this;
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  function InvalidCharacterError(message) {
    this.message = message;
  }

  InvalidCharacterError.prototype = new Error();
  InvalidCharacterError.prototype.name = 'InvalidCharacterError';

  object.btoa || (
    object.btoa = function(input) {
      var str = String(input), block, charCode, idx, map, output;
      for (idx = 0, map = chars, output = ''; str.charAt(idx | 0) || (map = '=', idx % 1); output += map.charAt(63 & block >> 8 - idx % 1 * 8)) {
        charCode = str.charCodeAt(idx += 3 / 4);
        if (charCode > 0xFF) {
          throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
        }
        block = block << 8 | charCode;
      }
      return output;
    });

  object.atob || (
    object.atob = function(input) {
      var str = String(input).replace(/=+$/, '');
      if (str.length % 4 == 1) {
        throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
      }
      for (var bc = 0, bs, buffer, idx = 0, output = ''; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
        buffer = chars.indexOf(buffer);
      }
      return output;
    });
}());
