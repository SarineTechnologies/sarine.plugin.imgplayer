# imgplayer
Image sequence player jQuery plugin with 
Fork of https://github.com/nterms/imgplay/ 

## Dev

Run:

npm -i
gulp

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
                .on("play", function (event, plugin) {
                })
                .on("pause", function (event, plugin) {
                })
                .on("stop", function (event, plugin) {                           
                });

            // play on demand
            // make sure that imgplay option autoPlay is false 
            // $('#imageplayer').data('imgplay').play(); 
        });
    })(jQuery);
</script>
~~~


## Options

Following options are currently available for configuring the plugin.

- `rate` - Number of frames per second. Default is `1`.
- `controls` - Whether to show player controls. Default is `true`.


## Methods

Following methods can be called on the player object to programatically
control it's behaviour.

- `play()` - Play the image sequence.
- `pause()` - Pause the player.
- `stop()` - Stop the player.
- `rewind(frames)` - Jump number of `frames` backward.
- `forward(frames)` - Jump number of `frames` forward.
- `fastRewind(rate)` - Play backword at given `rate`.
- `fastForward(rate)` - Play forword at given `rate`.
- `previousFrame()` - Pause and jump to the previous frame.
- `nextFrame()` - Pause and jump to the next frame.
- `toFrame(i)` - Jump to the frame number `i`.
- `fullscreen()` - Toggle fullscreen mode.
    
All the methods are simply callable through the `data` property of the container 
element after initialisation.

~~~js
$('#imageplayer').data('imgplay').play();
~~~


## Contribute

- If you think the idea of imgplay is intersting just let me know
That surely will be a push forward.
- If you find a bug or a way we can improve imgplay, just open a
new issue.
- If you have fixed something or added new feature, just send a pull
request.


## License

MIT License. Please see [LICENSE](LICENSE) for license details.
