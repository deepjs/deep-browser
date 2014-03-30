// main.js : load all first dependencies
require.config({
	baseUrl: "/libs/"
});
require(["deepjs/ie-hacks", "deepjs/json2", "deep-browser/index", "app.js"], function(ieHacks, json2, deep, app ) {
	app();
});