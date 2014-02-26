// main.js : load all first dependencies
require.config({
	baseUrl: "/libs/"
});
require([ "app.js", "deep-browser/index"], function( app, deep ) {
	app();
});