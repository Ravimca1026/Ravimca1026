sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], function (Controller, History) {
    "use strict";

    return Controller.extend("com.mindset.applibrary.admin.AppTracker.controller.BaseController", {
        /**
         * Convenience method for accessing the router in every controller of the application.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter : function () {
            return this.getOwnerComponent().getRouter();
        },

        /**
         * Convenience method for getting the view model by name in every controller of the application.
         * @public
         * @param {string} sName the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel : function (sName) {
            return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model in every controller of the application.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel : function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Convenience method for getting the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle : function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Event handler for navigating back.
         * It there is a history entry we go one step back in the browser history
         * If not, it will replace the current entry of the browser history with the list route.
         * @public
         */
        onNavBack : function() {
            var sPreviousHash = History.getInstance().getPreviousHash();

            if (sPreviousHash !== undefined) {
                // eslint-disable-next-line sap-no-history-manipulation
                history.go(-1);
            } else {
                this.getRouter().navTo("list", {}, true);
            }
        },
        onNavDetailBack: function(){
            this.getView().getModel("appView").setProperty("/layout","OneColumn");
			this.getRouter().navTo("list");
        },
        onNavAppDetailBack: function(oData){
            var controller = this;
            // set the layout property of FCL control to show two columns
            controller.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
            controller.onLoadCount(oData);
            controller.onLoadPers(oData);
            controller.getRouter().navTo("object", {
                objectId : controller.sCatId 
            });
        },
        onLoadPers: function(data){
            if(data && !data.length){
                data = this.onNavBackData;
            }
            if(data && data.length > 0){
                data.forEach(element => {
                    if(element && element.delete !== true){
                        element.total = (element.pers.length / element.count) * 100;
                        if(element.total){
                            if(element.total.toFixed(2).split(".")[1] === '00'){
                                element.total = element.total
                            } else {
                                element.total = element.total.toFixed(2);
                            }
                        }
                    } 
                    if(!element.total || element.total === NaN){
                        element.total = 0;
                    }                   
                });
            }
        },
        getTeamsDetails: function(){
            let controller = this;
            let oViewModel = controller.getView().getModel("ViewModel");
            $.ajax({
                method: "GET",
                url: "/ApplibraryTeams/TeamsData",
                dataType: "json",
                async: true,
                success: function(oData){
                    oViewModel.setProperty("/MindSetTeamsSet", oData.value);
                    oViewModel.updateBindings(true);
                },
                error: function(err){
                }
            });
         },
        onLoadCount: function(oData){
            if(oData && !oData.length){
                oData = this.onNavBackData;
            }
            if(oData && oData.length > 0){
                let oCat = {};
                   
                oData.forEach(element => {
                    if(element && element.delete !== true){
                        oCat = element;
                        $.ajax({
                            method: "GET",
                            url: "/Applibrary/AppCategories(" + element.cat_id + ")?$expand=cat_details",
                            dataType: "json",
                            async: false,
                            success: function(data){
                                // data.forEach(Itm => {
                                    data.sCategory_type = data.category_type.join();
                                // });
                                if(oCat.cat_id === data.cat_id){
                                    oCat.pers = [];
                                    let aArr = [];
                                        data.cat_details.forEach(element => {
                                            if(element.delete !== true){
                                                aArr.push(element);
                                            }
                                        });
                                        oCat.count = aArr.length;                             
                               
                                    data.cat_details.forEach(element1 => {
                                        if(element1 && element1.Status && element1.Status === "Completed"){
                                            oCat.pers.push(element1.Status); 
                                        }
                                    });
                                }
                                // oViewModel.updateBindings(false);
                            },
                            error: function(err){
                            }
                        });
                    }                    
                });
            }
        }
    });

});