/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 */
if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}
define([
	"require",
	"deepjs/deep",
	"deepjs/lib/view",
	"deep-swig/index",
	"deep-jquery/index",
	"deep-jquery/clients/json",
	"deep-local-storage/index",
	"deepjs/lib/unit",
	"deep-data-bind/json-binder",
	"deep-routes/index",
	"deepjs/lib/stores/collection-store",
	"deepjs/lib/stores/object-store",
	"./lib/login",
	"./lib/deep-link",
	"./lib/ui"
],
function (require, deep)
{

	/**
	 * TODO = create local mini sandbox that load deep-browser
	 */

	/**
	 * main app need to provide : 
		user store : (could be dummies) 
			deep.client.jquery.JSON.create("user","/user/")
			or
			deep.store.Collection.create("user", [{ id:"u1", email:"john@doe.com", password:"test" }])
			(could be ocmised)
		login store : (could be dummy)
			deep.client.jquery.JSON.create("login","/login/")
			or
			deep.store.dummy.Login.createDefault();
		logout store : (could be dummy)
			deep.client.jquery.JSON.create("logout","/logout/")
			or
			deep.store.dummy.Login.createDefault();
	 */


	deep.client.jquery.JSON.createDefault();
	deep.client.Swig.createDefault();
	deep.jquery.init(jQuery);
	deep.jquery.addDomProtocols();
	deep.store.jstorage.Object.create("appdata");

	var login = require("./lib/login");

	var _uaMatch = function(ua) {
		ua = ua.toLowerCase();
		var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
			/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
			/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
			/(msie) ([\w.]+)/.exec( ua ) ||
			ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) || [];
		return {
			browser: match[ 1 ] || '',
			version: match[ 2 ] || '0'
		};
	};

	deep.browser = {
		getRoles : function(session){
			if(session && session.user)
			{
				if(session.user.roles)
					return user.roles;
				return "user";
			}
			return "public";
		},
		userAgent : function() {
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
		},
		init : function(config)
		{
			/*
				var config = {
					routes:{},
					user:{
						getRoles:function(session){
							if(session && session.user)
								return "user";
							return "public";
						},
						loggedIn:function(session){
							// do asynch stuffs to get passport etc
							return session;
						},
						register:{

						},
						changePassword:{

						},
						login:{
						
						}
					}
				};
			*/
			var routes = config.routes || {};
			if(config.user)
			{
				if(!routes.login)
					deep.utils.up(login.routes, routes);
				// TODO : samething for register and change password
				if(config.user.getRoles)
					this.getRoles = config.user.getRoles;
				if(config.user.loggedIn)
					this.loggedIn = config.user.loggedIn;
				return deep.store("appdata")
				.get("/session")
				.done(function (session) {
					//console.log("User form appData = ", session);
					if(!session.user)
					{
						deep.store("appdata").del("/session");
						deep.generalModes("roles", deep.browser.getRoles());
						return;
					}
					return deep.get("user::" + user.id)
					.done(function (user) {
						if(deep.browser.loggedIn)
							this.done(deep.browser.loggedIn);
						return { user:user };
					})
					.done(function(session){
						return deep.store("appdata").put(session, "/session");
					})
					.done(deep.browser.getRoles)
					.done(function (roles) {
						deep.generalModes("roles", roles);
					})
					.fail(function (e) {
						deep.generalModes("roles", deep.browser.getRoles());
					});
				})
				.fail(function(e){
					deep.generalModes("roles", deep.browser.getRoles());
				})
				.always(function(){
					return deep.route(routes)
					.done(function(s){
						deep.ui.relink("body");
						return s.init();
					});
				})
				.logError();
			}
			else
				return deep.route(routes)
				.done(function(s){
					deep.ui.relink("body");
					return s.init();
				})
				.logError();
		}
	};
	return deep;
});


