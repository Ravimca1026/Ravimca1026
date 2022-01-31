/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"commindset.applibrary./applibrary/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
