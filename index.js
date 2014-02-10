/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 */
if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}
define([
	"require",
	"deepjs/deep",
	"deepjs/lib/stores/collection-store",
	"deepjs/lib/view",
	"deep-swig/index",
	"deep-jquery/index",
	"deep-jquery/clients/json",
	"deep-local-storage/index",
	"deepjs/lib/unit",
	"deep-data-bind/json-binder",
	"deep-routes/index"
],
function (require, deep)
{
	deep.client.jquery.JSON.createDefault();
	deep.client.Swig.createDefault();
	deep.jquery.addDomProtocols();
 
	var oldURL = "/";
	deep.route.on("refreshed", function(event){
		console.log("ROUTE refreshed : ", event.datas, oldURL);
		var refreshed = event.datas.refreshed;
		if(refreshed)
		{
			if(!refreshed.forEach)
				refreshed = [refreshed];
			refreshed.forEach(function(refreshed){
				// console.log("RELINK : ",refreshed.refreshed);
				if(refreshed.loaded && refreshed.loaded.placed)
					deep.ui.relink(refreshed.loaded.placed);
			});
		}
		else
		{
			// console.log("BODY RELINK");
			deep.ui.relink("body");
		}
		if(event.datas.route == oldURL)
			return;
		oldURL = event.datas.route;
		window.location.hash = event.datas.route;
	});

	window.addEventListener("hashchange", function(event) {
		var newHash = window.location.hash.substring(1) || "/";
		//console.log("__________________________ hash change : ", newHash, oldURL);
		if(newHash == oldURL)
			return;
		deep.route(newHash || "/");
	}, false);

	var _uaMatch = function(ua) {
		ua = ua.toLowerCase();
		var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
			/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
			/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
			/(msie) ([\w.]+)/.exec( ua ) ||
			ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) 
			|| [];
		return {
			browser: match[ 1 ] || '',
			version: match[ 2 ] || '0'
		};
	};

	deep.ui.detectBrowser = function() {
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

	deep.ui.relink = function(selector){
		// console.log("relink : ", selector);
		$(selector)
		.find("a, *[rel^='route::']")
		.each(function(){
			var tagName = $(this).get(0).tagName.toLowerCase(), uri = null;
			if(tagName == 'a')
				uri = $(this).attr("href");
			else
				uri = $(this).attr("rel").substring(7);
			if(uri.substring(0,4) === 'http')
				return;
			if(uri[0] == '/')
				if(uri[1] == '/')   // file
					return;
			if(this._deep_rerouted_)
				return;
			//console.log("RELINK : ", uri);
			this._deep_rerouted_ = true;
			$(this).click(function(e){
				e.preventDefault();
				//console.log("click on rerouted dom object : uri : ", uri);
				deep.route(uri);
			});
		});
	};

	deep.login = function(obj){
		return deep.store("json").post(obj, "/login" ).log();
	};

	deep.logout = function(){
		return deep.store("json").post({}, "/logout" ).log();
	};

	deep.Chain.addHandle("login", function (datas) {
		var self = this;
		var func = function (s, e) {
			return deep.login(datas);
		};
		func._isDone_ = true;
		addInChain.call(self, func);
		return this;
	});
	deep.Chain.addHandle("logout", function () {
		var self = this;
		var func = function (s, e) {
			return deep.logout();
		};
		func._isDone_ = true;
		addInChain.call(self, func);
		return this;
	});

	return deep;
	// to do  : add login/logout in chain
});


