#Flickr Node Jade Single Page Gallery (FNJv3)

*Version 3 now a "single page app" through AJAX loading*  

This gallery connects via the Flickr API (using oauth) and retreives Photosets  
and photos on the fly.  

###Installation:  
    git clone git://github.com/manxam/fnj-gallery-V3.git
    npm install

###Configuration:  
edit config.json to suit your needs. 

If '"node_env": "development"' then json files will be written for the data received from
Flickr to 'tmp' for inspection purposes and the JS files served will be non-minified for easier debugging. 
If '"runServer": "false" as well then the webserver will not start either. The photoset/collection data will be written and then the app
will exit.  

Else, set to "production" to disable this behavior. JSON files will not be written and JS files served will be the minified versions.    

If your photos are arranged in sets this will produce a "flat" gallery where
all albums are at the root of the listings.  

If your photosets on flickr are arranged into collections then change "use" to collections.  
This will enable recursive listings such that the Collection name is the Album
root and the photosets beneath are the sub-albums.  

_e.g. "My Trip to Italy" -> "Day 1"_

"title" sets the title of the photo gallery's index page.  
"quote" is the inspirational quote displayed on the index page.  
"quoteAuthor" is the author of the above quote.  

    
    {
        "use": "sets",
        "title": "My Photo Gallery",
        "quote": "“My Inspirational Quote Here”",
        "quoteAuthor": "Unknown",
        "host": "127.0.0.1", 
        "port": "8080", 
        "node_env": "production", 
        "runServer": true
    }  

###Flickr Authentication
edit flickr.json as follows:

    {
        "api_key":"YourAPIKey",
        "api_secret":"YourAPISecret",
        "oauth_token":"YourOAUTHToken",
        "oauth_secret":"YourOAUTHSecret"
    }

Obtaining these keys is beyond the scope of this document. You can obtain your  
API key and API Secret by creating a new 'App' in your Flickr dashboard. To  
obtain your OAuth keys you'll have to do the 'OAuth Dance'. I suggest trying:
[This OAuth Tool](http://term.ie/oauth/example/client.php)

###Running:  
    node app.js
**Voila!**
