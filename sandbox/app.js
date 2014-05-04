/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 */
define([
		"require",
		"deep-browser/index",
		"deepjs/lib/unit",
		"deepjs/lib/stores/collection",
		"deepjs/lib/stores/object",
		"deepjs/lib/schema",
		"deep-widgets/lib/deep-try"
	],
	function(require, deep) {
		console.log("start app-sndbx");
		var init = function() {
			deep.jquery.set($);
			deep.ui.enhance("body");
			console.log("app-sndbx intialised");
			$("#run-core-units").click(function(e) {
				e.preventDefault();
				deep.Unit.run(null, {
					verbose: false
				})
					.done(function(report) {
						console.log("report : ", report);
						report.reports = null;
						$("#reports-container").html("<pre>" + JSON.stringify(report, null, ' ') + '</pre>');
					});
			});
			$("#run-core-units-verbose").click(function(e) {
				e.preventDefault();
				deep.Unit.run(null, {
					verbose: true
				})
					.done(function(report) {
						console.log("report : ", report);
						report.reports = null;
						$("#reports-container").html("<pre>" + JSON.stringify(report, null, ' ') + '</pre>');
					});
			});

			deep("json::")
		};
		return init;
	});