sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/Sorter",
    "sap/ui/model/FilterOperator",
    "sap/m/GroupHeaderListItem",
    "sap/ui/Device",
    "sap/ui/core/Fragment",
    "../model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, Filter, Sorter, FilterOperator, GroupHeaderListItem, Device, Fragment, formatter, MessageToast, MessageBox) {
        "use strict";
        var controller;
        return BaseController.extend("com.mindset.applibrary.admin.AppTracker.controller.List", {
            formatter: formatter,

            onInit: function () {
                controller = this;
                var oList = controller.byId("list"),
                oViewModel = controller._createViewModel(),
                // Put down list's original value for busy indicator delay,
                // so it can be restored later on. Busy handling on the list is
                // taken care of by the list itself.
                iOriginalBusyDelay = oList.getBusyIndicatorDelay();
                controller.setModel(oViewModel, "listView");
                oList.attachEventOnce("updateFinished", function(){
                    // Restore original busy indicator delay for the list
                    oViewModel.setProperty("/delay", iOriginalBusyDelay);
                });
    
                controller.getView().addEventDelegate({
                    onBeforeFirstShow: function () {
                        // this.getOwnerComponent().oListSelector.setBoundMasterList(oList);
                    }.bind(controller)
                });
                 // keeps the filter and search state
                 controller._oListFilterState = {
                    aFilter : [],
                    aSearch : []
                };
                this._oList = oList;
    
                controller.getRouter().getRoute("list").attachPatternMatched(controller._onMasterMatched, controller);
                controller.getRouter().attachBypassed(controller.onBypassed, controller);
            },
            _onMasterMatched:  function() {
                //Set the layout property of the FCL control to 'OneColumn'
                controller.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
                controller.getView().byId("list").removeSelections();
                let oViewModelData = controller.getView().getModel("ViewModel");
                controller.onLoadPers(oViewModelData.getData().AppCategories);
                controller.getTeamsDetails();
                oViewModelData.updateBindings(true);
            },
            _createViewModel: function() {
                return new JSONModel({
                    isFilterBarVisible: false,
                    filterBarLabel: "",
                    delay: 0,
                    title: this.getResourceBundle().getText("listTitleCount", [0]),
                    noDataText: this.getResourceBundle().getText("listListNoDataText"),
                    sortBy: "categoryname",
                    groupBy: "None"
                });
            },
             /**
             * Event handler for the list selection event
             * @param {sap.ui.base.Event} oEvent the list selectionChange event
             * @public
             */
            onSelectionChange: function (oEvent) {
                var oList = oEvent.getSource(),
                    bSelected = oEvent.getParameter("selected");
                if(oList.getMode() !== "SingleSelect"){
                    // skip navigation when deselecting an item in multi selection mode
                    if (!(oList.getMode() === "MultiSelect" && !bSelected)) {
                        // get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
                        controller._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
                    }
                }
            },
            /**
             * Shows the selected item on the detail page
             * On phones a additional history entry is created
             * @param {sap.m.ObjectListItem} oItem selected Item
             * @private
             */
            _showDetail: function (oItem) {
                var bReplace = !Device.system.phone;
                // set the layout property of FCL control to show two columns
                controller.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
                controller.getRouter().navTo("object", {
                    objectId : oItem.getBindingContext("ViewModel").getProperty("cat_id")
                }, bReplace);
            },
            showFragmentCatalog : function(){
                if (!this._ApprovalNoteDialog) {
                    this._ApprovalNoteDialog = sap.ui.xmlfragment("com.mindset.applibrary.admin.AppTracker.view.fragment.CatalogDialog", this);
                    this.getView().addDependent(this._ApprovalNoteDialog);
                }
                this._ApprovalNoteDialog.open();
            },
            addFragmentTeams : function(){
                if (!this._addFragmentTeams) {
                    this._addFragmentTeams = sap.ui.xmlfragment("com.mindset.applibrary.admin.AppTracker.view.fragment.AddTeamDialog", this);
                    this.getView().addDependent(this._addFragmentTeams);
                }
                this._addFragmentTeams.open();
            },
            onCreateNewOrder : function(){
                var controller = this;
                var mainModel = this.getView().getModel("ViewModel");
                var catName = mainModel.getProperty("/CatalogObj/CategoryName"),
                catType = mainModel.getProperty("/CatalogObj/category_type");

                // mainModel.setProperty("/AppObject", {});
                var oPayload = {
                        "categoryname" : catName,
                        "category_type": catType
                };
                // POst the list pages data from capm cloud
                $.ajax({
                    method: "POST",
                    url: "/Applibrary/AppCategories",
                    contentType: "application/json",
                    async: true,
                    success: function(oData){
                        // console.log("Successfully inset data into cloud");
                        controller.onLoadCatData();
                        controller._ApprovalNoteDialog.close();
                        MessageBox.show("Catalog Create Successfully", {
                            icon: MessageBox.Icon.SUCCESS,
                            title: "Success",
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (oAction) {
                               
                            }
                        });
                    },
                    error: function(err){
                        console.log("Error inset data into cloud");
                    },
                    data: JSON.stringify(oPayload)
                });                
            },
            onCreateEditOrder: function(){
                var controller = this;
                var mainModel = this.getView().getModel("ViewModel");
                var oCatObj = mainModel.getProperty("/CatEditObj");
                delete oCatObj.pers;
                delete oCatObj.count;
                delete oCatObj.total;
                delete oCatObj.sCategory_type;
                // POst the list pages data from capm cloud
                $.ajax({
                    method: "PATCH",
                    url: "/Applibrary/AppCategories/" + oCatObj.cat_id,
                    contentType: "application/json",
                    async: true,
                    success: function(oData){
                        // console.log("Successfully inset data into cloud");
                        controller.onLoadCatData();
                        controller.EditDialog.close();
                        var mode = "SingleSelectMaster";
                            controller.byId("list").setMode(mode);
                            controller.getView().byId("list").removeSelections();
                        MessageBox.show("Updated Successfully", {
                            icon: MessageBox.Icon.SUCCESS,
                            title: "Success",
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (oAction) {
                               
                            }
                        });
                    },
                    error: function(err){
                        console.log("Error inset data into cloud");
                    },
                    data: JSON.stringify(oCatObj)
                });     
            },
            onCreateNewOrderCancel : function(){
                controller._ApprovalNoteDialog.close();
            },
            onCreateNewTeamOrder : function(){
                var controller = this;
                var mainModel = this.getView().getModel("ViewModel");
                var oPayload = mainModel.getProperty("/teamObj");
                // mainModel.setProperty("/AppObject", {});
                // var oPayload = {
                //         "categoryname" : catName
                // };
                $.ajax({
                    method: "POST",
                    url: "/ApplibraryTeams/TeamsData",
                    contentType: "application/json",
                    async: true,
                    success: function(data){
                        controller._addFragmentTeams.close();
                        oViewModel.setProperty("/teamObj/email");
                    },
                    data: JSON.stringify(oPayload),
                    error: function(err){
                        console.log("Error not deleted cloud");
                    }
                });
                
            },
            onCreateNewTeamCancel : function(){
                controller._addFragmentTeams.close();
            },
            onCreateEditOrderCancel: function(){
                var mode = "SingleSelectMaster";
                controller.byId("list").setMode(mode);
                controller.getView().byId("list").removeSelections();
                controller.EditDialog.close();
            },
            onLoadCatData: function(){
                let oViewModel = this.getView().getModel("ViewModel");
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
                        oViewModel.setProperty("/CatalogObj/CategoryName", null);
                        oViewModel.setProperty("/CatalogObj/category_type", []);
                        controller.onLoadCount(oData.value);
                        controller.onLoadPers(oViewModel.getProperty("/AppCategories"));
                        oViewModel.updateBindings(true);
                    },
                    error: function(err){
                    }
                });
            },
            /**
             * Event handler for the list search field. Applies current
             * filter value and triggers a new search. If the search field's
             * 'refresh' button has been pressed, no new search is triggered
             * and the list binding is refresh instead.
             * @param {sap.ui.base.Event} oEvent the search event
             * @public
             */
            onSearch: function (oEvent) {
                if (oEvent.getParameters().refreshButtonPressed) {
                    // Search field's 'refresh' button has been pressed.
                    // This is visible if you select any list item.
                    // In this case no new search is triggered, we only
                    // refresh the list binding.
                    controller.onRefresh();
                    return;
                }
                var sQuery = oEvent.getParameter("query");
                if (sQuery) {
                    controller._oListFilterState.aSearch = [new Filter("categoryname", FilterOperator.Contains, sQuery)];
                } else {
                    controller._oListFilterState.aSearch = [];
                }
                controller._applyFilterSearch();
            },
            /**
             * Internal helper method to apply both filter and search state together on the list binding
             * @private
             */
            _applyFilterSearch: function () {
                var aFilters = controller._oListFilterState.aSearch.concat(controller._oListFilterState.aFilter),
                    oViewModel = controller.getModel("listView");
                    controller._oList.getBinding("items").filter(aFilters, "Application");
                // changes the noDataText of the list in case there are no filter results
                if (aFilters.length !== 0) {
                    oViewModel.setProperty("/noDataText", controller.getResourceBundle().getText("listListNoDataWithFilterOrSearchText"));
                } else if (controller._oListFilterState.aSearch.length > 0) {
                    // only reset the no data text to default when no new search was triggered
                    oViewModel.setProperty("/noDataText", controller.getResourceBundle().getText("listListNoDataText"));
                }
            },
            /**
             * Event handler for refresh event. Keeps filter, sort
             * and group settings and refreshes the list binding.
             * @public
             */
            onRefresh: function () {
                controller._oList.getBinding("items").refresh();
            },
            onEnableButtons: function(oEvent){
                var mode = "SingleSelect",
                oViewModel = controller.getView().getModel("ViewModel");
                // var mode = "SingleSelectMaster";
			    controller.byId("list").setMode(mode);
                oViewModel.setProperty("/listButtonVisible", false);
            },
            onListItemDelete: function(){
               let oViewModel = controller.getView().getModel("ViewModel");
               oViewModel.setProperty("/listButtonVisible", true);
               let sSelectedKey = controller.byId("list").getSelectedItem(),
                   oSelectedObj = sSelectedKey.getBindingContext("ViewModel").getObject();
                //    oSelectedObj.delete = true;
                //    $.ajax({
                //     method: "PATCH",
                //     url: "/Applibrary/AppCategories/" + oSelectedObj.cat_id,
                //     contentType: "application/json",
                //     async: true,
                //     success: function(data){
                //         controller.onLoadCatData();
                //          var mode = "SingleSelectMaster";
			    //             controller.byId("list").setMode(mode);
                //             controller.getView().byId("list").removeSelections();
                //     },
                //     data: JSON.stringify(oSelectedObj),
                //     error: function(err){
                //         console.log("Error not deleted cloud");
                //         oSelectedObj.delete = false;
                //     }
                // });
                controller.deleteDialog = new sap.m.Dialog({
                    title: "{i18n>delete}",
                    type: "Message",
                    content: [
                        new sap.m.Label({
                            text: "{i18n>delete_confirm}"
                        })
                    ],
                    beginButton: new sap.m.Button({
                        type: "Emphasized",
                        text: "{i18n>ok}",
                        press: function () {
                            controller.deleteDialog.close();
                            oSelectedObj.delete = true;
                            delete oSelectedObj.pers;
                            delete oSelectedObj.count;
                            delete oSelectedObj.total;
                            delete oSelectedObj.sCategory_type;
                            $.ajax({
                                method: "PATCH",
                                url: "/Applibrary/AppCategories/" + oSelectedObj.cat_id,
                                contentType: "application/json",
                                async: true,
                                success: function(data){
                                    controller.onLoadCatData();
                                        var mode = "SingleSelectMaster";
                                        controller.byId("list").setMode(mode);
                                        controller.getView().byId("list").removeSelections();
                                },
                                data: JSON.stringify(oSelectedObj),
                                error: function(err){
                                    console.log("Error not deleted cloud");
                                    oSelectedObj.delete = false;
                                }
                            });									
                        }
                    }),
                    endButton: new sap.m.Button({
                        text: "{i18n>no}",
                        press: function () {										
                           controller.deleteDialog.close();
                           var mode = "SingleSelectMaster";
                               controller.byId("list").setMode(mode);
                               controller.getView().byId("list").removeSelections();
                        }
                    }),
                    afterClose: function () {
                        controller.deleteDialog.destroy();
                    }
                });
                controller.getView().addDependent(controller.deleteDialog);
                controller.deleteDialog.open();
            },
            onListItemEdit: function(){
                let oViewModel = controller.getView().getModel("ViewModel");
                oViewModel.setProperty("/listButtonVisible", true);
                
                let sSelectedKey = controller.byId("list").getSelectedItem(),
                    oSelectedObj = sSelectedKey.getBindingContext("ViewModel").getObject();
                    oViewModel.setProperty("/CatEditObj", oSelectedObj);
               
                if (!controller.EditDialog) {
                    controller.EditDialog = sap.ui.xmlfragment("com.mindset.applibrary.admin.AppTracker.view.fragment.CatalogDialogEdit", controller);
                    controller.getView().addDependent(controller.EditDialog);
                }
                controller.EditDialog.open();
             },
             onLoadMSTData: function(oEvent){
                // if (!controller.dMSDataDialog) {
                //     controller.dMSDataDialog = sap.ui.xmlfragment("com.mindset.applibrary.admin.AppTracker.view.fragment.MindSetTeamsDialog", controller);
                //     controller.getView().addDependent(controller.dMSDataDialog);
                // }
                // controller.dMSDataDialog.open();
                let oViewModel = controller.getView().getModel("ViewModel");
                var oButton = oEvent.getSource(),
				oView = controller.getView();
                oViewModel.setProperty("/teamObj/email");

                // create popover
                if (!controller._pPopover) {
                    controller._pPopover = Fragment.load({
                        name: "com.mindset.applibrary.admin.AppTracker.view.fragment.MindSetTeamsDialog",
                        controller: controller
                    }).then(function(oPopover){
                        oView.addDependent(oPopover);
                        return oPopover;
                    });
                }

                controller._pPopover.then(function(oPopover){
                    oPopover.openBy(oButton);
                });
                controller.getTeamsDetails();
             },
             
             onDecline: function(){
                let oViewModel = controller.getView().getModel("ViewModel");
                var mode = "SingleSelectMaster";
			    controller.byId("list").setMode(mode);
                oViewModel.setProperty("/listButtonVisible", true);
                var mode = "SingleSelectMaster";
                    controller.byId("list").setMode(mode);
                    controller.getView().byId("list").removeSelections();
             }
        });
    });
