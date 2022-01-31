sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("com.mindset.applibrary.admin.AppTracker.controller.App", {
            onInit: function () {
                var oView;
                // fnSetAppNotBusy,
                // iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

            oView = new JSONModel({
                layout : "TwoColumnsBeginExpanded",
                previousLayout : "",
                actionButtonsInfo : {
                    midColumn : {
                        fullScreen : false
                    }
                }
            });
            // this.setModel(oViewModel, "appView");
            this.getView().setModel(oView, "appView");

            // fnSetAppNotBusy = function() {
            //     oViewModel.setProperty("/busy", false);
            //     oViewModel.setProperty("/delay", iOriginalBusyDelay);
            // };

            // since then() has no "reject"-path attach to the MetadataFailed-Event to disable the busy indicator in case of an error
            // this.getOwnerComponent().getModel().metadataLoaded().then(fnSetAppNotBusy);
            // this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);

            // apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
            }
        });
    });
