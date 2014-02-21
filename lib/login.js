/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 */
if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}
define([
	"require",
	"deepjs/deep",
],
function (require, deep)
{
	deep.store.dummy = deep.store.dummy || {};
	deep.store.dummy.Login = deep.compose.Classes(deep.Store, {
		post:function(object, options){
			return deep.roles("admin").store("user").get("?email="+object.email+"&"+object.password);
		}
	});
	deep.store.dummy.Logout = deep.compose.Classes(deep.Store, {
		post:function(object, options){
			return true;
		}
	});
	//_______________
	deep.login = function(obj, from){
		var oldRoute = from || deep.route();
		return deep.store("login").post(obj).done(function (user) {
			deep.context.session = {
				user:user
			};
			if(deep.browser.loggedIn)
				this.done(deep.browser.loggedIn);
			deep.context.session = session;
			return deep.store("appdata").post(session,"/session");
		})
		.done(deep.browser.getRoles)
		.done(function (roles) {
			//gestion de lurl + route avec l'ancien url
			deep.generalModes("roles", roles);
		})
		.logError();
	};
	deep.Chain.addHandle("login", function (datas) {
		var self = this;
		var func = function (s, e) {
			return deep.login(datas);
		};
		func._isDone_ = true;
		deep.utils.addInChain.call(self, func);
		return this;
	});
	//_______________
	deep.logout = function(){
		return deep.store("logout").post({})
		.done(function () {
			delete deep.context.session;
			return deep.store("appdata").del("/session");
		})
		.logError();
	};
	deep.Chain.addHandle("logout", function () {
		var self = this;
		var func = function (s, e) {
			return deep.logout();
		};
		func._isDone_ = true;
		deep.utils.addInChain.call(self, func);
		return this;
	});
	//_______________
	/*deep.impersonate = function(obj){
		return deep({}).impersonate(obj);
	};
	deep.Chain.addHandle("impersonate", function (user) {
		var self = this;
		var func = function (s, e) {
			if(typeof user == 'string')
				user = { id:user };
			user._impersonate = true;
			return deep.store("login").post(user).log();
		};
		func._isDone_ = true;
		deep.utils.addInChain.call(self, func);
		return this;
	});*/
	//___________________
	/**
	 * start a chain with provided session.
	 * @param  {[type]} session [description]
	 * @return {[type]}         [description]
	 */
	deep.session = function(session){
		if(!session)
			return deep.context.session;
		deep.context.session = session;
		if(session.user && deep.browser.loggedIn)
			return deep.when(deep.browser.loggedIn(session))
			.done(function(session){
				return deep.store("appdata").post(session,"/session", false);
			})
			.done(deep.browser.getRoles)
			.done(function (roles) {
				//gestion de lurl + route avec l'ancien url
				deep.generalModes("roles", roles);
				return session;
			});
		deep.generalModes("roles", deep.browser.getRoles(session));
		return deep.store("appdata").post(session,"/session", false);
	};
	
	deep.Chain.addHandle("session", function (session) {
		var self = this;
		var func = function (s, e) {
			return deep.session(session);
		};
		func._isDone_ = true;
		deep.utils.addInChain.call(self, func);
		return this;
	});

	var routes = {
		login:{
			route : "/login",
			remove : function () {
				return $("#login").hide();
			},
			load:null,
			login:function(){
				if($("#email").val() && $("#password").val())
					deep.login({email:$("#email").val(),password:$("#password").val()})
					.done(function () {
						$("#login-error").hide();
						deep.route(deep.lastRoute);
					})
					.fail(function (error) {
						$("#login-error").show();
					});
			},
			refresh:function () {
				$("#login-error").hide();
				if(!this.initialised)
				{
					this.initialised = true;
					this.enhance("#login");
				}
				$("#login").show();
			}
		}
	};

	return {
		routes:routes
	};
});