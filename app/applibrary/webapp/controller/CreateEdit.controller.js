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
	var URLHelper = mobileLibrary.URLHelper, oViewModel, controller;

	return BaseController.extend("com.mindset.applibrary.admin.AppTracker.controller.CreateEdit", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit : function () {
			controller = this;
			controller.getRouter().getRoute("createedit").attachPatternMatched(controller._onObjectMatched, controller);
			oViewModel = controller.getOwnerComponent().getModel("ViewModel");
		},
		onSelectRadio: function(evt){
			  let bCheck = oViewModel.getData().AppObject ? oViewModel.getData().AppObject.DesignThinking : 1;
			if(evt){
				var sKey = evt.getSource().getSelectedButton().getText();
				if(sKey === "No"){
					oViewModel.setProperty("/designVisible",false);
				}else{
					oViewModel.setProperty("/designVisible",true);
				}
			} else {
				if(bCheck === 0){
					oViewModel.setProperty("/designVisible",true);
				}else{
					oViewModel.setProperty("/designVisible",false);
				}
			}
		},	
		/**
		 * 
		 * @param {*} oEvent 
		 */
		 onChangeMultiInputDev: function(oEvent){
			if(oEvent){
				var inputEmailValue = oEvent.getSource().getValue();
				var aSalesDara = oViewModel.getProperty("/AppObject/DevTeam");
					aSalesDara = aSalesDara ? aSalesDara : [];
				if(inputEmailValue){
					aSalesDara.push({"Value": inputEmailValue});
					oEvent.getSource().setValue();
				}
				oViewModel.updateBindings(true);
			}
		},
		onChangeMultiInputTech: function(oEvent){
			if(oEvent){
				var inputEmailValue = oEvent.getSource().getValue();
				var aSalesDara = oViewModel.getProperty("/AppObject/TechTags");
					aSalesDara = aSalesDara ? aSalesDara : [];
				if(inputEmailValue){
					aSalesDara.push({"Value": inputEmailValue});
					oViewModel.setProperty("/AppObject/TechTags", aSalesDara);
					oEvent.getSource().setValue();
				}
				oViewModel.updateBindings(true);
			}
		},
		/**
		 * 
		 * @param {*} oEvent 
		 */
		onTokenUpdateDev: function (oEvent) {
			if(oEvent){
				var sTokenUpdateType = oEvent.getParameters().type,
					oParameters = oEvent.getParameters(),
					oSrc = oEvent.getSource(), 
					aSalesData = oViewModel.getProperty("/AppObject/DevTeam"),
					sPath;
				if (sTokenUpdateType === "removed") {
					
					var sRemoveTokenPath = oParameters.removedTokens[0].getBindingContext("ViewModel").getPath();
					aSalesData.splice(sRemoveTokenPath.split("/")[3], 1);

				} else if (sTokenUpdateType === "added") {
					aSalesData.push(oParameters.addedTokens[0].getKey());
				}
				oViewModel.updateBindings(true);
			}
		},
		onTokenUpdateTech: function (oEvent) {
			if(oEvent){
				var sTokenUpdateType = oEvent.getParameters().type,
					oParameters = oEvent.getParameters(),
					oSrc = oEvent.getSource(), 
					aSalesData = oViewModel.getProperty("/AppObject/TechTags"),
					sPath;
				if (sTokenUpdateType === "removed") {
					
					var sRemoveTokenPath = oParameters.removedTokens[0].getBindingContext("ViewModel").getPath();
					aSalesData.splice(sRemoveTokenPath.split("/")[3], 1);

				} else if (sTokenUpdateType === "added") {
					aSalesData.push(oParameters.addedTokens[0].getKey());
				}
				oViewModel.updateBindings(true);
			}
		},
		/**
		 * 
		 * @param {*} oEvent 
		 */
		 onChangeMultiInput: function(oEvent){
			if(oEvent){
				var inputEmailValue = oEvent.getSource().getValue();
				var aSalesDara = oViewModel.getProperty("/AppObject/SalesTeam");
					aSalesDara = aSalesDara ? aSalesDara : [];
				if(inputEmailValue){
					aSalesDara.push({"Value": inputEmailValue});
					oEvent.getSource().setValue();
				}
				oViewModel.updateBindings(true);
			}
		},
		/**
		 * 
		 * @param {*} oEvent 
		 */
		onTokenUpdate: function (oEvent) {
			if(oEvent){
				var sTokenUpdateType = oEvent.getParameters().type,
					oParameters = oEvent.getParameters(),
					oSrc = oEvent.getSource(), 
					aSalesData = oViewModel.getProperty("/AppObject/SalesTeam"),
					sPath;
				if (sTokenUpdateType === "removed") {
					
					var sRemoveTokenPath = oParameters.removedTokens[0].getBindingContext("ViewModel").getPath();
					aSalesData.splice(sRemoveTokenPath.split("/")[3], 1);

				} else if (sTokenUpdateType === "added") {
					aSalesData.push(oParameters.addedTokens[0].getKey());
				}
				oViewModel.updateBindings(true);
			}
		},	

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched : function (oEvent) {
			controller.sCatId =  oEvent.getParameter("arguments").catId;
			controller.sAppId =  oEvent.getParameter("arguments").appid;
		//	this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			var oDataModel = controller.getView().getModel();
			var oModel = controller.getView().getModel("ViewModel");
			//TBD
			if(controller.sAppId && controller.sAppId === 'create'){
				oModel.setProperty("/buttonChecks/next", true);
				oModel.setProperty("/buttonChecks/save", false);
			} else {
				oModel.setProperty("/buttonChecks/next", false);
				oModel.setProperty("/buttonChecks/save", true);
			}
			// Required fields check.
			controller.onVisibilityCheck();
			oModel.updateBindings(true);
		},
		onVisibilityCheck: function(){
            // var oViewModel = this.getView().getModel("ViewModel");
			oViewModel.setProperty("/visible_payload/AppName/valueState", "None");
			oViewModel.setProperty("/visible_payload/Industry/valueState", "None");
			oViewModel.setProperty("/visible_payload/TechTags/valueState", "None");
			//TBD
			if(this.sAppId && this.sAppId !== 'create'){
				//TBD
				$.ajax({
					method: "GET",
					url: "/Applibrary/MindsetTeam("+this.sAppId+")?$expand=appClients",
					dataType: "json",
					async: true,
					success: function(data){
						oViewModel.setProperty("/AppObject", data);
						controller.onNavBackData = oViewModel.getProperty("/AppCategories");
						controller.onSelectRadio();
						oViewModel.updateBindings(true);
					},
					error: function(err){
					}
				});
			} else {
				oViewModel.setProperty("/AppObject/AppName", null);
				oViewModel.setProperty("/AppObject/Industry", null);
				oViewModel.setProperty("/AppObject/TechTags", null);
				oViewModel.setProperty("/AppObject/Description", null);
				oViewModel.setProperty("/AppObject/Status", "Draft");
				oViewModel.updateBindings(true);
			}
        },
		/**
		 * On press next button.
		 */
		onNextPress: function(){
			let oViewModel = this.getView().getModel("ViewModel"),
			    object = oViewModel.getProperty("/AppObject");

		    // Required fileds check		
            let oAppDetails = oViewModel.getProperty("/AppObject"),
			    bVisibilityCheck = true;
				if(!oAppDetails.AppName){
					oViewModel.setProperty("/visible_payload/AppName/valueState", "Error");
					bVisibilityCheck = false;					
				} else {
					oViewModel.setProperty("/visible_payload/AppName/valueState", "None");
				}
				if(!oAppDetails.TechTags){
					oViewModel.setProperty("/visible_payload/TechTags/valueState", "Error");
					bVisibilityCheck = false;
				} else {
					oViewModel.setProperty("/visible_payload/TechTags/valueState", "None");
				}
				if(!oAppDetails.Industry){
					oViewModel.setProperty("/visible_payload/Industry/valueState", "Error");
					bVisibilityCheck = false;
				} else {
					oViewModel.setProperty("/visible_payload/Industry/valueState", "None");
				}
				delete object.appClients;
			if(bVisibilityCheck){
				$.ajax({
					method: "POST",
					url: "/Applibrary/MindsetTeam",
					contentType: "application/json",
					async: true,
					success: function(data){
						//TBD
						controller.sNewAppId = data.id;
						controller.sAppId = data.id;
						oViewModel.setProperty("/appDetailTabSelect","SalesTeam");
						oViewModel.setProperty("/AppObject", data);
						controller.onNavBackData = oViewModel.getProperty("/AppCategories");
						oViewModel.setProperty("/buttonChecks/next", false);
						oViewModel.setProperty("/buttonChecks/save", true);
						oViewModel.setProperty("/AppObject/DesignThinking", 1);
						
						controller.onSelectRadio();
						oViewModel.updateBindings(false);
					},
					error: function(err){
						console.log("Error inset data into cloud");
					},
					data: JSON.stringify(object)
				});
			} else{
				MessageToast.show("Please check mandatary fields.....");
			}
		},
		/**
		 * On press Save button.
		 */
		onSavePress : function () {
			var oViewModel = controller.getView().getModel("ViewModel"),
			    oAppObject = oViewModel.getProperty("/AppObject");
			    // oDataModel = controller.getView().getModel();
			oAppObject.cat_id_cat_id = controller.sCatId;
			oAppObject.id = oAppObject.id ? oAppObject.id : controller.sNewAppId;
			
			
			// oDataModel.setDeferredBatchGroups(["IDShipPlantConfigSetBatch"]);
			// for (var idx = 0; idx < oAppObject.appClients.results.length; idx++) {
			// 	var sPath = "/Clients(" + oAppObject.appClients.results[idx].ClientId +")";
			// 	var payload = oAppObject.appClients.results[idx];
			// 	oDataModel.update(sPath, payload, {
			// 		"batchGroupId": "IDShipPlantConfigSetBatch",
			// 		"merge": true
			// 	});
			// }
			// oDataModel.submitChanges({
			// 	batchGroupId: "IDShipPlantConfigSetBatch",
			// 	success: controller._onSuccess.bind(controller)
			// });
			let checkClientFlg = false;
			if(oAppObject && oAppObject.appClients){
				oAppObject.appClients.forEach(element => {
					if(!element.saveFlage){
						checkClientFlg = true;
					}
				});
			}
			if(checkClientFlg){
				MessageBox.show("Please save client data ...!", {
					icon: MessageBox.Icon.WARNING,
					title: "Warning",
					actions: [MessageBox.Action.OK],
					emphasizedAction: MessageBox.Action.OK,
					onClose: function (oAction) {
					
					}
				});
			} else{
				// TBD
				let appClientsCopy = jQuery.extend(true, [], oAppObject.appClients);
				delete oAppObject.appClients;

				$.ajax({
					method: "PATCH",
					url: "/Applibrary/MindsetTeam/" + oAppObject.id,
					contentType: "application/json",
					async: true,
					success: function(data){
						//TBD
						// controller.onUpdateClients(appClients);
						controller.onGetClients(controller.sAppId, 'save');
						// oViewModel.setProperty("/buttonChecks/next", false);
						// oViewModel.setProperty("/buttonChecks/save", true);
						oViewModel.updateBindings(false);
						// MessageBox.show("Data is Saved Successfully ...!", {
						// 	icon: MessageBox.Icon.SUCCESS,
						// 	title: "Success",
						// 	actions: [MessageBox.Action.OK],
						// 	emphasizedAction: MessageBox.Action.OK,
						// 	onClose: function (oAction) {
							
						// 	}
						// });
						controller.saveDialog = new sap.m.Dialog({
							title: "{i18n>save_info}",
							type: "Message",
							content: [
								new sap.m.Label({
									text: "{i18n>saved}"
								})
							],
							beginButton: new sap.m.Button({
								type: "Emphasized",
								text: "{i18n>yes}",
								press: function () {
									controller.saveDialog.close();
									controller.onNavAppDetailBack(oViewModel.getProperty("/AppCategories"));
									
								}
							}),
							endButton: new sap.m.Button({
								text: "{i18n>no}",
								press: function () {										
									controller.saveDialog.close();
									controller.onNavBackData = oViewModel.getProperty("/AppCategories");
								}
							}),
							afterClose: function () {
								controller.saveDialog.destroy();
							}
						});
						controller.getView().addDependent(controller.saveDialog);
						controller.saveDialog.open();
					},
					error: function(err){
						console.log("Error inset data into cloud");
					},
					data: JSON.stringify(oAppObject)
				});
			}
		},
		/**
		 * 
		 * @param {*} sAppId 
		 * @param {*} oAppdata 
		 */
		onGetClients: function(sAppId, sData){
			if(sAppId){
				$.ajax({
					method: "GET",
					url: "/Applibrary/MindsetTeam("+sAppId+")?$expand=appClients",
					contentType: "application/json",
					async: true,
					success: function(data){
						// oAppdata.appClients = data.appClients;
						// oViewModel.setProperty("/AppObject", {});
						if(sData === 'save'){
							oViewModel.setProperty("/AppObject", data);
						} else {
							oViewModel.setProperty("/AppObject/appClients", data.appClients);
						}
						
						if(sData && sData === 'update') { 
							MessageToast.show("Client Saved Successfully ...!");
						} else if(sData && sData === 'delete'){
							MessageToast.show("Client delete Successfully ...!");
						}
					},
					error: function(err){
						console.log("Error");
					}
				});
			}
		},
		/**
		 * 
		 */
		_onSuccess : function(){
			var oModel = controller.getView().getModel("ViewModel");
			var oAppObject = oModel.getProperty("/AppObject");
			delete  oAppObject.appClients;
			var oDataModel = this.getView().getModel();
			oDataModel.update("/MindsetTeam("+controller.sAppId+")",oAppObject,{
				success: function(odata, res) {
					controller.getRouter().navTo("object", {
						objectId :controller.sCatId
					});
				}
			  }); 
		},
		/**
		 * Adding client details
		 */
		 onAddClients : function(){
			var appIdClient = oViewModel.getProperty("/AppObject");
			// var oDataModel = this.getView().getModel();
			var aArray = oViewModel.getProperty("/AppObject/appClients") ? oViewModel.getProperty("/AppObject/appClients") : [];
			let addclientflage = false;
			if(aArray){
				aArray.forEach(element => {
					if(element && !element.ClientName){
						addclientflage = true;
					}
				});
			}
			var oPayload = {
				appId_id : appIdClient.id,
				ClientName: null,
				Location : null,
				Feedback : null,
				DocLinks : null,
				EndUsers : null,
				Rating : null,
				saveFlage: false,
				NPS: null,
				delete: false
			};
			// oDataModel.create("/Clients",oPayload,{
			// 	success: function(odata, res) {
			// 		aArray.push(odata);
			//         oViewModel.updateBindings(false);
			// 	}
			// });
			if(!addclientflage){
				$.ajax({
					method: "POST",
					url: "/Applibrary/Clients",
					contentType: "application/json",
					async: true,
					success: function(data){
						aArray.push(data);
						oViewModel.setProperty("/AppObject/appClients", aArray);
						oViewModel.updateBindings(true);
					},
					error: function(err){
						console.log("Error inset data into cloud");
					},
					data: JSON.stringify(oPayload)
				});
			} else {
				MessageToast.show("Please add Client Name ..!");
			}
		},
		/**
		 * 
		 * @param {*} oEvent 
		 */
		onEditClients: function(oEvent){
			if(oEvent){
				var oModel = controller.getView().getModel("ViewModel"),
					oSrc = oEvent.getSource(),
					oObj = oSrc.getBindingContext("ViewModel").getObject();
				oObj.saveFlage = false;
				oViewModel.updateBindings(false);
			}
		},
		/**
		 * 
		 * @param {*} oEvent 
		 * @param {*} appClients 
		 */
		onUpdateClients : function(oEvent,appClients){
			var oModel = controller.getView().getModel("ViewModel"),
				oSrc = oEvent.getSource(),
				oObj = oSrc.getBindingContext("ViewModel").getObject(),
				sPath = oSrc.getBindingContext("ViewModel").getPath();				

			var aArray = oModel.getProperty("/AppObject/appClients") ? oModel.getProperty("/AppObject/appClients") : appClients;
			// aArray.forEach(function (oTem, iDex) {
			// 	$.ajax({
			// 		method: "PATCH",
			// 		url: "/Applibrary/Clients/" + oTem.appId_id,
			// 		contentType: "application/json",
			// 		async: false,
			// 		success: function(data){
			// 			oViewModel.updateBindings(false);
			// 		},
			// 		error: function(err){
			// 			console.log("Error inset data into cloud");
			// 		},
			// 		data: JSON.stringify(oTem)
			// 	});
			// });
			// Temp fix need to implement new logic
			if(oObj) {		
				oObj.saveFlage = true;
				oObj.NPS = parseInt(oObj.NPS, 0);
				$.ajax({
					method: "PATCH",
					url: "/Applibrary/Clients/" + oObj.ClientId,
					contentType: "application/json",
					async: true,
					success: function(data){
						controller.onGetClients(controller.sAppId, 'update');
						// MessageBox.show("Client Saved Successfully ...!", {
						// 	icon: MessageBox.Icon.SUCCESS,
						// 	title: "Success",
						// 	actions: [MessageBox.Action.OK],
						// 	emphasizedAction: MessageBox.Action.OK,
						// 	onClose: function (oAction) {
							   
						// 	}
						// });
						
					},
					error: function(err){
						console.log("Error inset data into cloud");
					},
					data: JSON.stringify(oObj)
				});	
			} else {
				console.log("========== Error====== ");
			}
		},
		/**
		 * Delete the selected client
		 * @param {*} oEvent 
		 */
		onClientsDelete: function(oEvent){
			var oSrc = oEvent.getSource(),
			    oObj = oSrc.getBindingContext("ViewModel").getObject(),
				sPath= oSrc.getBindingContext("ViewModel").getPath();
			// $.ajax({
			// 	method: "DELETE",
			// 	url: "/Applibrary/Clients/" + oObj.ClientId,
			// 	contentType: "application/json",
			// 	async: true,
			// 	success: function(data){
			// 		$.ajax({
			// 			method: "GET",
			// 			url: "/Applibrary/Clients",
			// 			contentType: "application/json",
			// 			async: true,
			// 			success: function(data){
			// 				controller.onGetClients(controller.sAppId, 'delete');
			// 			}
			// 		});
			// 	},
			// 	error: function(err){
			// 		console.log("Error not deleted cloud");
			// 	}
			// });
			oObj.delete = true;
			$.ajax({
				method: "PATCH",
				url: "/Applibrary/Clients/" + oObj.ClientId,
				contentType: "application/json",
				async: true,
				success: function(data){
					// $.ajax({
					// 	method: "GET",
					// 	url: "/Applibrary/Clients",
					// 	contentType: "application/json",
					// 	async: true,
					// 	success: function(data){
					// 		controller.onGetClients(controller.sAppId, 'delete');
					// 	}
					// });
					controller.onGetClients(controller.sAppId, 'delete');
				},
				data: JSON.stringify(oObj),
				error: function(err){
					console.log("Error not deleted cloud");
					oObj.delete = false;
				}
			});
		}
	});

});