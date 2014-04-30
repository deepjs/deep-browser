/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */

if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}

define([
	"require",
	"deepjs/deep",
	"../lib/dummies",
	'deepjs/lib/view',
	'deepjs/lib/stores/collection',
	'../lib/login'
], function(require, deep, dummies, View, Collection, login) {

	var config = {
		routes: {
			app: deep.View({
				how: '<div>Your app...<div id="topbar"></div><div id="content"></div></div>',
				where: "dom.htmlOf::#app",
				subs: {
					topbar: deep.View({
						route: "!/hello",
						how: "<div>topbar ++++</div>",
						where: "dom.htmlOf::#topbar"
					}),
					index: deep.View({
						route: "/$",
						what: {
							myVal: "json::/json/test.json"
						},
						how: "swig::/test.swig",
						where: "dom.htmlOf::#content",
						myMethod: function(a, b) {
							console.log("myMethod : ", a, b);
						}
					}),
					hello: deep.View({
						route: "/hello/?s:id",
						how: "<div>hello { id | 'default' }</div>",
						where: "dom.htmlOf::#content"
					})
				}
			})

			/*home: deep.ocm({
					'public': deep.View({
						route: '/$',
						how: '<div>home <button dp-route="/login">login</button></div>',
						where: 'dom.htmlOf::#content'
					}),
					user: {
						backgrounds: ['this::../public'],
						how: '<div>home user <button dp-route="/logout">logout</button></div>'
					}
				}, {
					groups: 'roles'
				}),
				register: deep.View({
					route: '/register',
					how: '<div>register</div>',
					where: 'dom.htmlOf::#content'
				}),
				changePassword: deep.View({
					route: '/change-password',
					how: '<div>change password</div>',
					where: 'dom.htmlOf::#content'
				}),
				logout: deep.View({
					route: '/logout',
					redirection: '/home',
					how: function(params, options) {
						console.log('DO logout');
						return deep.logout().log().route(this.redirection).log();
					}
				}),
				login: deep.View({
					route: '/login',
					remove: function() {
						var $ = deep.context.$;
						return $('#login').hide();
					},
					load: null,
					login: function() {
						var $ = deep.context.$;
						if ($('#email').val() && $('#password').val())
							deep.login({
								email: $('#email').val(),
								password: $('#password').val()
							})
								.done(function() {
									$('#login-error').hide();
									deep.route(deep.lastRoute);
								})
								.fail(function(error) {
									$('#login-error').show();
								});
					},
					refresh: function() {
						var $ = deep.context.$;
						$('#login-error').hide();
						if (!this.initialised) {
							this.initialised = true;
							this.enhance('#login');
						}
						$('#login').show();
					}
				})*/
		},
		getModes: function(session) {
			if (session && session.user)
				return {
					roles: 'user'
				};
			return {
				roles: 'public'
			};
		},
		user: {
			store: deep.Collection('user', [{
				id: 'u1',
				email: 'john@doe.com',
				password: deep.utils.Hash('test54', 'sha1')
			}], {
				
			}),
			encryption: 'sha1',
			loggedIn: function(session) {
				// do asynch stuffs to decorate session
				return session;
			},
			register: dummies.Register.create(),
			changePassword: dummies.ChangePassword.create(),
			login: dummies.Login.create(),
			logout: dummies.Logout.create()
		}
	};
	//deep.utils.up(login, config.routes);
	return config;
});