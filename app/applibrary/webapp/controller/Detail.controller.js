sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/m/library",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, formatter, mobileLibrary, MessageToast, MessageBox) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return BaseController.extend("com.mindset.applibrary.admin.AppTracker.controller.Detail", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        onInit: function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page is busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
            var oViewModel = new JSONModel({
                busy : false,
                delay : 0,
                lineItemListTitle : this.getResourceBundle().getText("detailLineItemTableHeading")
            });

            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

            this.setModel(oViewModel, "detailView");

            // this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
        },

       
        _onObjectMatched: function (oEvent) {
            this.sObjectId =  oEvent.getParameter("arguments").objectId;
            // this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
            var mainModel = this.getView().getModel("ViewModel");
            this.onLoadAppCatData();
        },
        onLoadAppCatData: function(){
            var mainModel = this.getView().getModel("ViewModel");
            $.ajax({
                method: "GET",
                url: "/Applibrary/AppCategories(" +this.sObjectId+ ")?$expand=cat_details",
                dataType: "json",
                async: true,
                success: function(data){
                    data.cat_details.forEach(element => {
                        let aArray = [];
                        element.sTechTags = null;
                        element.TechTags.forEach(iteam => {
                            aArray.push(iteam.Value);
                        });
                        element.sTechTags = aArray.join();
                    });
                    mainModel.setProperty("/tableArray", data.cat_details);
                },
                error: function(err){
                }
            });
        },

        /**
         * Binds the view to the object path. Makes sure that detail view displays
         * a busy indicator while data for the corresponding element binding is loaded.
         * @function
         * @param {string} sObjectPath path to the object to be bound to the view.
         * @private
         */
        
        onEditPress : function(evt){
            var appid = evt.getSource().getBindingContext("ViewModel").getObject().id;
			this.getView().getModel("appView").setProperty("/layout","OneColumn");

             //TBD
             this.getTeamsDetails();

			this.getRouter().navTo("createedit", {
				catId :this.sObjectId,
				appid : appid
			});
            var oViewModelData = this.getView().getModel("ViewModel");
            oViewModelData.setProperty("/appDetailTabSelect","AppDetails");
		},
        onDeletePress : function(evt){
            var controller = this;
            var oModel = controller.getView().getModel("ViewModel");
            var object = evt.getSource().getBindingContext("ViewModel").getObject();
            controller.deleteDetailDialog = new sap.m.Dialog({
                title: "{i18n>delete}",
                type: "Message",
                content: [
                    new sap.m.Label({
                        text: "{i18n>delete_confirm_detail}"
                    })
                ],
                beginButton: new sap.m.Button({
                    type: "Emphasized",
                    text: "{i18n>ok}",
                    press: function () {
                        object.delete = true;
                        delete object.sTechTags;
                        controller.deleteDetailDialog.close();
                        $.ajax({
                            method: "PATCH",
                            url: "/Applibrary/MindsetTeam/"+object.id,
                            contentType: "application/json",
                            async: true,
                            success: function(data){
                                controller.onLoadAppCatData();
                                MessageBox.show("Deleted Successfully", {
                                    icon: MessageBox.Icon.SUCCESS,
                                    title: "Success",
                                    actions: [MessageBox.Action.OK],
                                    emphasizedAction: MessageBox.Action.OK,
                                    onClose: function (oAction) {
                                    
                                    }
                                });
                            },
                            data: JSON.stringify(object),
                            error: function(err){
                                MessageToast.show("Error...!");
                                object.delete = false;
                            }
                        });
                    }
                }),
                endButton: new sap.m.Button({
                    text: "{i18n>no}",
                    press: function () {										
                       controller.deleteDetailDialog.close();
                    }
                }),
                afterClose: function () {
                    controller.deleteDetailDialog.destroy();
                }
            });
            controller.getView().addDependent(controller.deleteDetailDialog);
            controller.deleteDetailDialog.open();
        },
		onCreatePress : function(evt){
            var controller = this;
			var oViewModel = this.getView().getModel("ViewModel");
            var object = oViewModel.getProperty("/AppdetailsObj");
            object.cat_id_cat_id = controller.sObjectId;   
            oViewModel.setProperty("/AppObject", {});   
            //TBD
            controller.getTeamsDetails();

            controller.getView().getModel("appView").setProperty("/layout","OneColumn");
            controller.getRouter().navTo("createedit", {
                catId :controller.sObjectId,
                appid : 'create'
            });   
            oViewModel.setProperty("/appDetailTabSelect","AppDetails");      
		}   
    });

});