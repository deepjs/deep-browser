/**
 * deep-browser/index
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 */
/**
1) When you use this module : you should provide an "appdata" store to handle login/app datas

    example: 
    - in classical browser environement : use a jstorage :
        deep.store.jstorage.Object.create("appdata");
    - In Air environnement : use air encrypted local store (see deep-air docs)
    - In node-webkit : use a deep-node.fs.* store

    - Trough autobahn (concurrent asynch multi windows) : 
        you not need to define it (the mecanisms are different due to server structure, see autobahn docs)
        
            
2) main app need to provide clients or stores for : 
    user store : (could be dummies) 
        deep.client.jquery.JSON.create("user","/user/")
        or
        deep.store.Collection.create("user", [{ id:"u1", email:"john@doe.com", password:"test" }])
        (could be ocmised)
    login store : (could be dummy)
        deep.client.jquery.JSON.create("login","/login/")
        or
        deep.store.dummy.Login.create();
    logout store : (could be dummy)
        deep.client.jquery.JSON.create("logout","/logout/")
        or
        deep.store.dummy.Login.create();

 3) You need to set jQuery reference when you have it and before you launch views rendering : 
    
    deep.jquery.set(jQuery);


4) deeplink : you could give your config
    deep.route.deepLink({ ...config... });
* 
*/
if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}
define([
		"require",
		"deepjs/deep",
		"deep-views/index",
		"deep-jquery/lib/dom",
		"deep-routes/browser"
	],
	function(require, deep, View, jquery, routes, login) {

		deep.jquery.dom("dom");

		var _uaMatch = function(ua) {
			ua = ua.toLowerCase();
			var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
				/(webkit)[ \/]([\w.]+)/.exec(ua) ||
				/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
				/(msie) ([\w.]+)/.exec(ua) ||
				ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];
			return {
				browser: match[1] || '',
				version: match[2] || '0'
			};
		};

		// if(!deep.isNode && !deep.utils.Hash)        // simple fake (non secure) Hash from http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/


		deep.utils.userAgent = function() {
			var browser = {},
				matched = _uaMatch(navigator.userAgent);
			if (matched.browser) {
				browser[matched.browser] = true;
				browser.version = matched.version;
			}
			if (browser.chrome)
				browser.webkit = true;
			else if (browser.webkit)
				browser.safari = true;
			return browser;
		};

		var closure = {
			app: null
		};

		deep.browser = {
			sessionModes: function(session) {
				if (session && session.user) {
					if (session.user.roles)
						return {
							roles: user.roles
						};
					return {
						roles: "user"
					};
				}
				return {
					roles: "public"
				};
			},
			init: function(config) {

				var routes = config.routes || {};
				closure.app = config;
				config.sessionModes = config.sessionModes || this.sessionModes;
				if (config.user) {
					// TODO : samething for register and change password

					if (config.user.loggedIn)
						this.loggedIn = config.user.loggedIn;
					return deep.restful("appdata")
						.get("/session")
						.done(function(session) {
							//console.log("User form appData = ", session);
							if (!session.user)
								return new Error();
							return deep.get("user::" + user.id)
								.done(function(user) {
									if (config.loggedIn)
										this.done(config.loggedIn);
									return {
										user: user
									};
								})
								.done(function(session) {
									return deep.restful("appdata").put(session, "/session");
								})
								.done(config.sessionModes);
						})
						.fail(function(e) {
							return config.sessionModes();
						})
						.done(deep.Modes)
						.done(function() {
							return deep.route(routes)
						})
						.done(function(s) {
							console.log("route init asynch done : will relink body")
							deep.route.relink("body");
							return s.init();
						})
						.elog();
				} else
					return deep.route(routes)
						.done(function(s) {
							console.log("route init synch done : will relink body")
							deep.route.relink("body");
							return s.init();
						})
						.elog();
			}
		};

		//_______________
		deep.login = function(obj, from) {
			var oldRoute = from || deep.route();
			return deep.restful("login")
				.post(obj)
				.done(function(user) {
					deep.Promise.context.session = {
						user: user
					};
					if (closure.app.loggedIn)
						this.done(closure.app.loggedIn);
					deep.Promise.context.session = session;
					return deep.restful("appdata").post(session, "/session");
				})
				.done(closure.app.sessionModes)
				.done(deep.Modes)
				.elog();
		};
		deep.Chain.add("login", function(datas) {
			var self = this;
			var func = function(s, e) {
				return deep.login(datas);
			};
			func._isDone_ = true;
			return deep.Promise.addInChain.call(self, func);
		});
		//_______________
		deep.logout = function() {
			return deep.restful("logout").post({})
				.done(function() {
					delete deep.Promise.context.session;
					return deep.restful("appdata").del("/session");
				})
				.elog();
		};
		deep.Chain.add("logout", function() {
			var self = this;
			var func = function(s, e) {
				return deep.logout();
			};
			func._isDone_ = true;
			return deep.Promise.addInChain.call(self, func);
		});
		//_______________
		/*deep.impersonate = function(obj){
        return deep({}).impersonate(obj);
    };
    deep.Chain.add("impersonate", function (user) {
        var self = this;
        var func = function (s, e) {
            if(typeof user == 'string')
                user = { id:user };
            user._impersonate = true;
            return deep.restful("login").post(user).log();
        };
        func._isDone_ = true;
        deep.Promise.addInChain.call(self, func);
        return this;
    });*/
		//___________________
		/**
		 * start a chain with provided session.
		 * @param  {[type]} session [description]
		 * @return {[type]}         [description]
		 */
		deep.session = function(session) {
			if (!session)
				return deep.Promise.context.session;
			deep.Promise.context.session = session;
			if (session.user && closure.app.loggedIn)
				return deep.when(closure.app.loggedIn(session))
					.done(function(session) {
						return deep.restful("appdata").post(session, "/session", false);
					})
					.done(closure.app.sessionModes)
					.done(function(modes) {
						//gestion de lurl + route avec l'ancien url
						deep.Modes(modes);
						return session;
					});
			deep.Modes(closure.app.sessionModes(session));
			return deep.restful("appdata").post(session, "/session", false);
		};

		deep.Chain.add("session", function(session) {
			var self = this;
			var func = function(s, e) {
				return deep.session(session);
			};
			func._isDone_ = true;
			return deep.Promise.addInChain.call(self, func);
		});

		return deep;
	});