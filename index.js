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
            deep.store.dummy.Login.createDefault();
        logout store : (could be dummy)
            deep.client.jquery.JSON.create("logout","/logout/")
            or
            deep.store.dummy.Login.createDefault();

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
        "deepjs/lib/view",
        "deep-jquery/index",
        "deep-routes/browser",
        "./lib/login"
    ],
    function(require, deep, View, jquery, routes, login) {

        deep.jquery.DOM.create("dom");

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

        deep.browser = {

            getModes: function(session) {
                if (session && session.user) {
                    if (session.user.roles)
                        return { roles:user.roles };
                    return { roles:"user" };
                }
                return "public";
            },
            userAgent: function() {
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
            init: function(config) {
                /*
				var config = {
					routes:{},
					user:{
						getModes:function(session){
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
                if (config.user) {
                    if (!routes.login)
                        deep.utils.up(login.routes, routes);
                    // TODO : samething for register and change password
                    if (config.user.getModes)
                        this.getModes = config.user.getModes;
                    if (config.user.loggedIn)
                        this.loggedIn = config.user.loggedIn;
                    return deep.store("appdata")
                        .get("/session")
                        .done(function(session) {
                            //console.log("User form appData = ", session);
                            if (!session.user) {
                                deep.store("appdata").del("/session");
                                deep.Modes("roles", deep.browser.getModes());
                                return;
                            }
                            return deep.get("user::" + user.id)
                                .done(function(user) {
                                    if (deep.browser.loggedIn)
                                        this.done(deep.browser.loggedIn);
                                    return {
                                        user: user
                                    };
                                })
                                .done(function(session) {
                                    return deep.store("appdata").put(session, "/session");
                                })
                                .done(deep.browser.getModes)
                                .done(function(roles) {
                                    deep.Modes("roles", roles);
                                })
                                .fail(function(e) {
                                    deep.Modes("roles", deep.browser.getModes());
                                });
                        })
                        .fail(function(e) {
                            deep.Modes("roles", deep.browser.getModes());
                        })
                        .always(function() {
                            return deep.route(routes)
                                .done(function(s) {
                                    deep.ui.relink("body");
                                    return s.init();
                                });
                        })
                        .logError();
                } else
                    return deep.route(routes)
                        .done(function(s) {
                            deep.ui.relink("body");
                            return s.init();
                        })
                        .logError();
            }
        };

        return deep;
    });