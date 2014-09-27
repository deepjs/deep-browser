require.config({
	baseUrl: "/bower_components"
});
require([
	"deepjs/deep",
	"deep-jquery/lib/dom",	
	"deep-views/lib/view",
	"deep-browser/lib/route",
	"jquery/dist/jquery.min"
], 
function( deep ) {
	deep.context("$", $);  // bind jquery ref to context
	deep.jquery.dom("dom"); // declare dom protocol
	var map = {	// define structured views map
		home:deep.View({
			route:"/[home,$]",
			how:"<div>Home content</div>",
			where:"dom.htmlOf::#content"
		}),
		profile:deep.View({
			route:"/profile/?s:name",
			how:"<div>Hello { name | 'dude' } !</div>",
			where:"dom.htmlOf::#content"
		})
	};
	return deep.route.init(map); // flatten, compile, and init routes on map. add deeplinking min-history.
});
