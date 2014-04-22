/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 */
if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}
define([
		'require',
		'deepjs/deep'
	],
	function(require, deep, Collection) {
		'use strict';
		deep.store.dummy = deep.store.dummy || {};
		//_____________________________________________________________________________
		deep.store.dummy.Login = deep.compose.Classes(deep.Store, {
			post: function(object, options) {
				return deep.roles('admin').store('user').get('?email=' + object.email + '&' + object.password);
			}
		});
		deep.store.dummy.Login.create = function(protocol) {
			if(typeof protocol === 'undefined')
				protocol = "login";
			return new deep.store.dummy.Login(protocol);
		};
		//_____________________________________________________________________________
		deep.store.dummy.Logout = deep.compose.Classes(deep.Store, {
			post: function(object, options) {
				return true;
			}
		});
		deep.store.dummy.Logout.create = function(protocol) {
			if(typeof protocol === 'undefined')
				protocol = "logout";
			return new deep.store.dummy.Logout(protocol);
		};
		//_____________________________________________________________________________
		deep.store.dummy.Register = deep.compose.Classes(deep.Store, {
			post: function(object, options) {
				return true;
			}
		});
		deep.store.dummy.Register.create = function(protocol) {
			if(typeof protocol === 'undefined')
				protocol = "register";
			return new deep.store.dummy.Logout(protocol);
		};
		//_____________________________________________________________________________
		deep.store.dummy.ChangePassword = deep.compose.Classes(deep.Store, {
			post: function(object, options) {
				return true;
			}
		});
		deep.store.dummy.ChangePassword.create = function(protocol) {
			if(typeof protocol === 'undefined')
				protocol = "change-password";
			return new deep.store.dummy.Logout(protocol);
		};
		//_____________________________________________________________________________
		return deep.store.dummy;
	});