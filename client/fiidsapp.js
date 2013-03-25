var Feeds = new Meteor.Collection("feeds");
var Posts = new Meteor.Collection("posts");

Template.user_loggedout.events({
   "click #login": function(e,tmpl){
       Meteor.loginWithGithub({
           requestPermissions: ['user', 'public_repo']
       }, function(err){
           if(err)
               console.log('Error during login: '+err);
       });
   } 
});

Template.user_loggedin.events({
    "click #logout": function(e,tmpl){
       Meteor.logout(function(err){
           if(err)
               console.log('Error during logout:'+err);
       });
    }
});

Deps.autorun(function(){
   Meteor.subscribe("feeds");
   Meteor.subscribe("posts");
});
Template.feeds.myfeeds = function(){
    return Feeds.find();
}
Template.main.events({
   "click #newfeed": function(e,tmpl){
        var furl = $("#feedurl");
        if(furl.val()!="")
            Meteor.call("newfeed",furl.val());
   } 
});
Template.feed.events({
   "click":function(){
       console.log('Feed selected');
       console.log(this);
       Session.set("active_feed", this._id);
   }
});
Template.activefeed.afeed = function(){
   console.log("Find posts from feed: "+Session.get("active_feed"));
   return Posts.find({feedid:Session.get("active_feed")});
}
Template.feed.selected = function(){
    return Session.get("active_feed") == this._id ? 'active':'';
}