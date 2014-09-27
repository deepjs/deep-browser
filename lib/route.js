/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 * Eveything specific about deep-routes for browser.
 *
 * Provides mainly deep-link for deep-routes.
 *
 *
 * deep.route = singleton
 *
 * Usage :
		var deep = require("deepjs/deep");
		require("deep-browser/lib/route");

    	deep.route.views(map)
    	.done(function(mapper){
    		mapper.on("refreshed", function(e){
				 console.log("refreshed event")
    		});
    		mapper.on("error", function(e){
				 console.log("error event : ", e)
    		});
			deep.route.use(mapper)
			.init(location.href);
    	})
    	.elog();
 * 
 */
if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}
define(["require", 
		"deepjs/deep", 
		"deep-routes/lib/structured", 
		"deep-routes/lib/refresh",
		"./relink",
		"min-history/lib/min-history"
	], 
	function(require, deep, structured, refresh) {
	//var oldRoute = null;
	deep.isBrowser = true;
	var closure = {};
	deep.route = deep.route || {};

	// events : on refreshed and on error
    deep.route.views = function(map)
    {
        return structured(map)
        .done(function(node){
        	var closure = {
        		emitter : new deep.Emitter(),
        		matched:null,
        		context:null,
        		map:map
        	};
            return {
            	match:function(path){
            		return node.match(path);
            	},
            	refresh:function(matched){
            		if(closure.context)
            			closure.context.canceled = true;
            		matched = closure.matched = matched || closure.matched;
            		var  p;
        			if(matched && !matched.unmatch)
        				p = deep.contextualise()
            			.done(function(context){
	            			closure.context = context;
	            			context.canceled = false;
	        				return refresh(matched);
	        			})
        				.done(function(s) {
							closure.emitter.emit("refreshed", {
								refreshed: matched,
								route: matched.route,
							});
						});
        			else
        				p = deep.when(deep.errors.NotFound("route empty"));

					return p.fail(function(e){
						closure.emitter.emit("error", {
							refreshed: matched,
							route: matched?matched.route:null,
							error: e
						});
					});
            	},
            	go:function(path){
            		return this.refresh(this.match(path));
            	},
            	on:function(type, callback){
					closure.emitter.on(type, callback);
            	},
            	unbind:function(type, callback){
					closure.emitter.remove(type, callback);
            	},
            	closure:function(){
            		return closure;
            	}
            };
        });
    };

	deep.route.use = function(mapper){
		closure.mapper = mapper;
		return this;
	};

	deep.route.go = function(href){
		if(!closure.mapper)
			throw deep.errors.Internal("no mapper associated with deep.route.go.");
		return closure.mapper.go(href);
	};

	deep.route.mapper = function() {
		return closure.mapper;
	};
	
	deep.route.refresh = function() {
		if (!closure.mapper)
			throw deep.errors.Error(500, "you need to associate a mapper through deep.route.use(...) before using deep.route.refresh()");
		return closure.mapper.refresh();
	};


	deep.route.current = function() {
		return history.location;
	};


	deep.route.init = function(map, historyConfig, href){
		// BIND HISTORY
		history.init(deep.up({
			setHashEvent:true,
			hashChangeAlone:true,
			basePath:"",
			hid:true
		}, historyConfig || {}));

		return deep.route.views(map)
    	.done(function(mapper){
			deep.route.use(mapper); // bind mapper to route

			// mapper event : refreshed and error
    		mapper.on("refreshed", function(e){
				 console.log("refreshed event : ", e)
    		});
    		mapper.on("error", function(e){
				 console.error("error event : ", e)
    		});

			// set/pop state from min-history
			window.addEventListener("setstate", function(e){
				console.log("set state event : ", e, history.location.relative);
				deep.route.go(history.location.path);
			});
			window.addEventListener("popstate", function(e){
				console.log("pop state event : ", e, history.location.relative);
				deep.route.go(history.location.path);
			});

			// set/pop hash from min-history
			window.addEventListener("sethash", function(e){
				console.log("set hash event : ", e, history.location.hash);
			});
			window.addEventListener("hashchange", function(e){
				console.log("hash change event : ", e, history.location.hash);
			});

			// init current location
			console.log("init route : ", href || history.location.href);
			deep.route.go(href || history.location.path || "/");
    	})
    	.elog();
	};

/*
	deep.ui.directives["dp-route"] = function(node, context) {
		var self = this;
		$(node).click(function(e) {
			e.preventDefault();
			var route = self.getRoute($(node).attr("dp-route"));
			deep.route(route);
		});
	};
*/

	return deep.route;
});