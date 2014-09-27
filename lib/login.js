/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */

if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}
define(["require", "deepjs/deep", "deep-restful/index"], function(require, deep) {
	var closure = {
		app: null
	};
	deep.isBrowser = true;

	var defaultSessionMode = function(session) {
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
	};

	//_______________
	deep.login = function(obj, from) {
		return deep.restful(closure.app.login)
			.post(obj)
			.done(function(user) {
				deep.context('session', {
					user: user
				});
				if (closure.app.loggedIn)
					this.done(closure.app.loggedIn);
				return deep.restful(closure.app.appdata).post(session, "/session");
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
		return deep.restful(closure.app.logout).post({})
			.done(function() {
				delete deep.context('session', null);
				return deep.restful(closure.app.appdata).del("/session");
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
            return deep.restful(closure.app.login).post(user).log();
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
			return deep.context('session');
		deep.context('session', session);
		if (session.user && closure.app.loggedIn)
			return deep.when(closure.app.loggedIn(session))
				.done(function(session) {
					return deep.restful(closure.app.appdata).post(session, "/session", false);
				})
				.done(closure.app.sessionModes)
				.done(function(modes) {
					//gestion de lurl + route avec l'ancien url
					deep.Modes(modes);
					return session;
				});
		deep.Modes(closure.app.sessionModes(session));
		return deep.restful(closure.app.appdata).post(session, "/session", false);
	};

	deep.Chain.add("session", function(session) {
		var self = this;
		var func = function(s, e) {
			return deep.session(session);
		};
		func._isDone_ = true;
		return deep.Promise.addInChain.call(self, func);
	});

	/*
		var config = {
			sessionModes:function(session){
				return {} // modes
			},
			loggedIn:function(session){
				
			},
			login:deep.jquery.ajax.json("login", "/login"),
			logout:deep.jquery.ajax.json("logout", "/logout"),
			impersonate:deep.jquery.ajax.json("impersonate", "/impersonate"),
			appdata:deep.jstorage("appdata"),
			user:deep.jquery.ajax.json("user", "/user")
		};

	 */


	deep.App = function(config){
		closure.app = config;
		config.sessionModes = config.sessionModes || defaultSessionMode;
		// TODO : samething for register and change password
		return deep.restful(config.appdata)
			.get("/session")
			.done(function(session) {
				//console.log("User form appData = ", session);
				if (!session.user)
					return new Error();
				return deep.restful(config.user)
					.get(user.id)
					.done(function(user) {
						if (config.loggedIn)
							this.done(config.loggedIn);
						return {
							user: user
						};
					})
					.done(function(session) {
						return deep.restful(config.appdata).put(session, "/session");
					})
					.done(config.sessionModes);
			})
			.fail(function(e) {
				return config.sessionModes();
			})
			.done(deep.Modes)
			.elog();
	};

});