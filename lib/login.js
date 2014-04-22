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
	return routes;
});