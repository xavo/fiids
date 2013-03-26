var Feeds = new Meteor.Collection("feeds");
var Posts = new Meteor.Collection("posts");
var UserPosts = new Meteor.Collection("userposts");

/** Events **/
Template.user_loggedout.events({
   "click #login": function(){
       Meteor.loginWithGithub({
           requestPermissions: ['user', 'public_repo']
       }, function(err){
           if(err)
               console.log('Error during login: '+err);
       });
   } 
});
Template.user_loggedin.events({
    "click #logout": function(){
       Meteor.logout(function(err){
           if(err)
               console.log('Error during logout:'+err);
       });
    }
});
Template.main.events({
   "click #newfeed": function(){
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
Template.activefeed.events({
   "click #frem": function(){
       if(Session.get("active_feed"))
           Meteor.call("deletefeed", Session.get("active_feed"));
   }
});

/** Init **/
Deps.autorun(function(){
   Meteor.subscribe("feeds");
   Meteor.subscribe("posts");
   Meteor.subscribe("userposts");
});

/** Live data **/
Template.feeds.myfeeds = function(){
    return Feeds.find();
}
Template.activefeed.afeed = function(){
   return Posts.find({feedid:Session.get("active_feed")});
}
Template.feed.selected = function(){
    return Session.get("active_feed") == this._id ? 'active':'';
}
Template.post.readed = function(){
    return UserPosts.find({postid:this._id, readed:true}).count();
}
Template.post.normaldate = function(){
    return moment(this.publishedDate).fromNow();
}