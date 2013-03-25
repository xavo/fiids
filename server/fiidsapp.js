var Feeds = new Meteor.Collection("feeds");
var Posts = new Meteor.Collection("posts");

Meteor.startup(function () {
    console.log('Init');
    Meteor.publish('feeds', function(){
        return Feeds.find({user:this.userId});
    });
    Meteor.publish('posts', function(){
       return Posts.find(); 
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
                        user: this.userId,
                        feedurl: feedurl,
                        feedname: fd.title,
                        countunread:entries.length
                    });
               for(var i in entries){
                   var v = entries[i];
                   Posts.insert({
                       feedid: fid,
                       title: v.title,
                       link: v.link,
                       author: v.author,
                       publishedDate: v.publishedDate,
                       contentSnippet: v.contentSnippet,
                       content: v.content,
                       categories: v.categories
                   })
               }
           }
       }
   }
});

