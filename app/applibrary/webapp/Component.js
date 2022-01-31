sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "com/mindset/applibrary/admin/AppTracker/model/models"
],
function (UIComponent, Device, models) {
    "use strict";
    var component, oViewModel;
    return UIComponent.extend("com.mindset.applibrary.admin.AppTracker.Component", {
        metadata: {
            manifest: "json"
        },

        /**
         * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
         * @public
         * @override
         */
        init: function () {
            component = this;
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);
            oViewModel = component.getModel("ViewModel");
            
            // Get the list pages data from capm cloud
            $.ajax({
                method: "GET",
                url: "/Applibrary/AppCategories",
                dataType: "json",
                async: true,
                success: function(oData){
                    oData.value.forEach(Itm => {
                        Itm.sCategory_type = Itm.category_type.join();
                    });
                    oViewModel.setProperty("/AppCategories", oData.value);
                    if(oData.value && oData.value.length > 0){
                        let oCat = {};
                            
                        oData.value.forEach(element => {
                            if(element && element.delete !== true){
                                oCat = element;
                                $.ajax({
                                    method: "GET",
                                    url: "/Applibrary/AppCategories(" + element.cat_id + ")?$expand=cat_details",
                                    dataType: "json",
                                    async: false,
                                    success: function(data){
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
                                        oViewModel.updateBindings(false);
                                    },
                                    error: function(err){
                                    }
                                });
                            }                    
                        });
                    }
                    oViewModel.updateBindings(true);
                },
                error: function(err){
                }
            });
            // enable routing
            this.getRouter().initialize();

            // set the device model
            this.setModel(models.createDeviceModel(), "device");
        },
        onLoadCount: function(oData){
            if(oData && oData.length > 0){
                let oCat = {};
                    oCat.pers = [];
                oData.forEach(element => {
                    if(element && !element.delete){
                        oCat = element;
                        $.ajax({
                            method: "GET",
                            url: "/Applibrary/AppCategories(" + element.cat_id + ")?$expand=cat_details",
                            dataType: "json",
                            async: true,
                            success: function(data){
                                let aArr = [];
                                data.cat_details.forEach(element => {
                                    if(element.delete !== true){
                                        aArr.push(element);
                                    }
                                });
                                oCat.count = data.aArr.length;

                                data.cat_details.forEach(element1 => {
                                    if(element1 && element1.Status && element1.Status === "Completed"){
                                        oCat.pers.push(element1.Status); 
                                    }
                                });
                            },
                            error: function(err){
                            }
                        });
                    }                    
                });
            }
        },
        /**
         * The component is destroyed by UI5 automatically.
         * In this method, the ListSelector and ErrorHandler are destroyed.
         * @public
         * @override
         */
        destroy : function () {
            this.oListSelector.destroy();
            this._oErrorHandler.destroy();
            // call the base component's destroy function
            UIComponent.prototype.destroy.apply(this, arguments);
        },
        /**
         * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
         * design mode class should be set, which influences the size appearance of some controls.
         * @public
         * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
         */
        getContentDensityClass : function() {
            if (this._sContentDensityClass === undefined) {
                // check whether FLP has already set the content density class; do nothing in this case
                // eslint-disable-next-line sap-no-proprietary-browser-api
                if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
                    this._sContentDensityClass = "";
                } else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
                    this._sContentDensityClass = "sapUiSizeCompact";
                } else {
                    // "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
                    this._sContentDensityClass = "sapUiSizeCozy";
                }
            }
            return this._sContentDensityClass;
        }

    });
}
);