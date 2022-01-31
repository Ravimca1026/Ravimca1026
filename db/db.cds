
using { managed } from '@sap/cds/common';

namespace com.mindset.applibrary;


entity AppCategories {
     key cat_id : UUID;
     categoryname : String;
     delete: Boolean;
     category_type: array of String;
     cat_details : Association to many MindsetTeam on cat_details.cat_id = $self;
}

entity MindsetTeam {
    key id : UUID;
    cat_id : Association to  AppCategories;
    AppName : String;
    Description : String;
    Industry : String;
    TechTags : array of {
        Value: String;
    };
    Status : String;
    DesignThinking : Integer;
    DesignThinkingTeam : array of String;
    DTDate  : Date;
    DTArtifactsGdrive : String;
    PrototypeLink : String;
    DevTeam : array of String;
    Architect : array of String;
    NoofSprints : Integer;
    ScrumMaster : array of String;
    Estimations : Integer;
    GITLink : String;
    AssignTo : array of String;
    DemoReady : Boolean;
    DemoVideo : String;
    IntegratetoAppLibrary : Boolean;
    SemanticObj : String;
    Action : String;
    SalesTeam : array of String;
    SOWLink : String;
    delete: Boolean;
    appClients : Association to many Clients on appClients.appId = $self;
    
}

entity Clients {
    key ClientId : UUID;
    appId : Association to  MindsetTeam;
    ClientName : String;
    Location : String;
    Feedback : String;
    DocLinks : String;
    EndUsers : String;
    Rating : Integer;
    NPS: Integer;
    saveFlage: Boolean;
    delete: Boolean;
}
entity TeamsData {
    key Id : UUID;
     first_name: String;
     last_name : String;
     email: String;
     type: String;
}




