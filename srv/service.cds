using { com.mindset.applibrary as  myservice } from '../db/db';

service AppCategories @(path : '/Applibrary') {
    entity AppCategories as projection on myservice.AppCategories;
    entity MindsetTeam as projection on myservice.MindsetTeam;
    entity Clients as projection on myservice.Clients;  
}
service MyTeamsDataService @(path : '/ApplibraryTeams') {
// TeamsData
    entity TeamsData as projection on myservice.TeamsData;  
}