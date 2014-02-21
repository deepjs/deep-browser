/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 */
if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}
define([
	"require",
	"deepjs/deep",
	"deep-routes/index"
],
function (require, deep)
{
	var oldURL = "/";
	deep.route.on("refreshed", function(event){
		// console.log("ROUTE refreshed : ", event.datas, oldURL);
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

function hashChange(event) {
		var newHash = window.location.hash.substring(1) || "/";
		//console.log("__________________________ hash change : ", newHash, oldURL);
		if(newHash == oldURL)
			return;
		deep.route(newHash || "/");
	}

if (!window.addEventListener) {
    window.attachEvent("hashchange", hashChange);
}
else {
    window.addEventListener("hashchange", hashChange, false);
}

});