/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require(["com/mindset/applibrary/admin/AppTracker/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
