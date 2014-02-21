if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}

define(["require","../deep", "../lib/unit"], function (require, deep, Unit) {
	
	//_______________________________________________________________ GENERIC STORE TEST CASES

	var unit = {
		title:"deep-browser/units/user",
		stopOnError:false,
		setup:function(){
			var context = {
				oldUser : deep.protocols.user,
				user : deep.store.Collection.create("user",[{id:'u1', email:'john@doe.com', password:'test'}], { properties:{ password:{ "private":true }}}),
				oldLogin : deep.protocols.login,
				oldLogout : deep.protocols.logout,
				login : deep.store.dummy.Login.create(),
				logout : deep.store.dummy.Logout.create(),
			};
			return context;
		},
		clean:function(){
			deep.protocols.user = this.oldUser;
			deep.protocols.login = this.oldLogin;
			deep.protocols.logout = this.oldLogout;
		},
		tests : {
			a:function(){
				return deep.login({ email:'john@doe.com', password:'test' }).log();
			}
		}
	};
	return unit;
});

