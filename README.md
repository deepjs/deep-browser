# deep-browser

Generic browser environnement for deepjs framework. 

This lib comes with two independents parts : 
* structured [deep-views](https://github.com/deepjs/deep-views) management tools that provides browser dedicated [deep-routes](https://github.com/deepjs/deep-routes) API and deeplinking through [min-history](https://github.com/nomocas/min-history).
* login/logout/session/impersonate/reload management tools and chained API



## install

```shell
bower install deep-browser
```

or

```shell
npm install deep-browser
```

or use deep-browser yeoman generator.

```

```

## Structured views

Simple example :
```javascript
define([
	"require",
	"deepjs/deep",
	"deep-jquery/lib/dom",	
	"deep-views/lib/view",
	"deep-browser/lib/route",
	"jquery/dist/jquery.min"
],
function(require, dp) {
	deep = dp;	// place deep in globals. (I like it so in the browser ;)
	deep.context("$", $);  // bind jquery ref to context
	deep.jquery.dom("dom"); // declare dom protocol

	var map = { // define your structured views map
		home:deep.View({
			route:"/[home,$]",
			how:"<div>hello</div>",
			where:"dom.htmlOf::#content"
		}),
		profile:deep.View({
			route:"/profile/?s:name",
			how:"<div>Hello { name | 'dude' } !</div>",
			where:"dom.htmlOf::#content"
		})
	};

	return function($){
		return deep.route.init(map);
	}
});
```

See example folder in deep-browser lib.

## Login famillies management

Docs coming soon.

## Licence

LGPL 3.0
