var Feeds = new Meteor.Collection("feeds");
var Posts = new Meteor.Collection("posts");
var UserFeeds = new Meteor.Collection("userfeeds");
var UserPosts = new Meteor.Collection("userposts");

Meteor.startup(function () {
    console.log('Init');
    Meteor.publish('feeds', function(){
        return Feeds.find({_id:{$in:_.pluck(UserFeeds.find({user:this.userId}).fetch(),'feedid')}});
    });
    Meteor.publish('posts', function(){
       var uf = Feeds.find({_id:{$in:_.pluck(UserFeeds.find({user:this.userId}).fetch(),'feedid')}}).fetch();
       var pk = _.pluck(uf, '_id');
       return Posts.find({feedid:{$in:pk}}); 
    });
    Meteor.publish('userposts', function(){
       return UserPosts.find({user:this.userId}); 
    });
});

Accounts.onCreateUser(function(options,user){
   var at = user.services.github.accessToken,
       result,
       profile;
       
   result = Meteor.http.get("https://api.github.com/user",{
       params: {access_token: at}
   });
   
   if(result.error)
       throw result.error;
   
   profile = _.pick(result.data,
        "login",
        "name",
        "avatar_url",
        "url",
        "company",
        "blog",
        "location",
        "email",
        "bio",
        "html_url"
   );
       
   user.profile = profile;
   return user; 
});

Meteor.methods({
   newfeed: function(feedurl){
       var feed = Feeds.findOne({feedurl:feedurl});
       if(!feed){
           var fs = Meteor.http.get("https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=20&q="+feedurl);
           if(fs.error){
                   console.log('Error getting feed: '+err);
           }else{
               var fd = fs.data.responseData.feed;
               var entries = fd.entries;
               console.log('New feed: '+fd.title);
               var fid = Feeds.insert({
                        feedurl: feedurl,
                        feedname: fd.title,
                        countunread:entries.length
                    });
               UserFeeds.insert({
                   feedid:fid,
                   user: this.userId
               })
               for(var i in entries){
                   var v = entries[i];
                   var idp = Posts.insert({
                       feedid: fid,
                       title: v.title,
                       link: v.link,
                       author: v.author,
                       publishedDate: v.publishedDate,
                       contentSnippet: v.contentSnippet,
                       content: v.content,
                       categories: v.categories
                   });
                   UserPosts.insert({
                       postid: idp,
                       user: this.userId,
                       readed: false,
                       favorite: false
                   });
               }
               
           }
       }
   },
   deletefeed: function(feedid){
       /**
        * TODO: When a feed is deleted, don't delete de feed, delete the relation to the user!!
        */
       Feeds.remove(feedid);
   }
});

