# imgplayer
Image sequence player jQuery plugin. 
Fork of https://github.com/nterms/imgplay/ 

## Dev

Run:

~~~
npm i
gulp
~~~

then go to http://localhost:8080/

## Usage

Add styles inside `<head>` tag.

~~~html
<link rel="stylesheet" href="sarine.plugin.imgplayer.min.css" />
~~~

Add plugin at the bottom of the page after jQuery

~~~html
<script type="text/javascript" src="jquery.min.js"></script>
<script type="text/javascript" src="sarine.plugin.imgplayer.min.js"></script>
~~~

List the set of images inside a container `<div>` so that payer can 
pick them and play.

~~~html
<div id="imageplayer"></div>
~~~

Now invoke the player.

~~~html
<script type="text/javascript">
    (function($) {
        $(document).ready(function() {
            $('#imageplayer')
                .imgplay({
                    totalImages: 318,
                    imageName: 'Image_{num}.jpg',                            
                    urlDir: 'https://d3oayecwxm3wp6.cloudfront.net/qa3/demo/new_loupe_poc/',
                    rate: 30,
                    height: 225,
                    width: 250,
                    autoPlay: true
                })
                .on("firstimgloaded", function (event, plugin) {
                })
                .on("play", function (event, plugin) {
                })
                .on("pause", function (event, plugin) {
                })
                .on("stop", function (event, plugin) {                           
                });

        });
    })(jQuery);
</script>
~~~


## Options

Following options are currently available for configuring the plugin.

- `startImage` - First image number (like in img1.jpg or img0.jpg)
- `totalImages` - Number of images (mandatory)
- `imageName` - Image nape pattern. Example: 'Image_{num}.jpg'. {num} is required inside a string (mandatory)
- `urlDir` - URL of images directory (mandatory)
- `rate` - Number of frames per second. Default is `totalImages / 10`
- `height` - Height of canvas (mandatory) 
- `width` - Width of canvas (mandatory)
- `autoPlay` - boolean, is auto play, default true. If false, it's possible to run play on demand using `$('#imageplayer').data('imgplay').play();`
- `autoReverse` - boolean, is auto reverse, default false. If true plays the images from 0-N and then N-0 and so on
- `userInteraction` - boolean, enable user interaction - mouse/touch events, default true
- `sharding` - boolean, enable domain sharding, default false
