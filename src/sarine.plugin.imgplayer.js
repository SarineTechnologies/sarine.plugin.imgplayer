(function($) {

    // Check if plugin is already loaded
    if (window.sarineAssets && window.sarineAssets.imagePlayerPlugin) 
        return false;    
    
    if ( ! window.sarineAssets) window.sarineAssets = {};
    if ( ! window.sarineAssets.imagePlayerPlugin) window.sarineAssets.imagePlayerPlugin = true;
        
    $.imgplay = function(element, options) {
        var defaults = {
            startImage: 0,
            totalImages: null,
            imageName: null,                            
            urlDir: null,
            rate: null,
            height: null,
            width: null,
            autoPlay: true,
            autoReverse: false,
            userInteraction: true,
            interactionMode: 'default',
            sharding: false
        };

        var el = element;
        var $el = $(element);
        var $canvas = null;
        var screen = null;
        var playing = false;
        var direction = 'forward';
        var page = 1;
        var total = 0;
        var index = 0;
        var playTimer = null;
        var loadProgress = 0;
        var playProgress = 0;
        var isUserInteraction = false;
        var plugin = this;
        var imgExist = true;
        plugin.settings = {};
        plugin.frames = [];
        var cdn_subdomains = window.cdn_subdomains || [];

        plugin.getShardingURL = function (url, imgNum) {
            if (plugin.settings.sharding && cdn_subdomains.length) {
                shard =  cdn_subdomains[imgNum % cdn_subdomains.length]; 
                return url.replace(/\/[^.]*/, '//' + shard)
            }
            return url;
        }

        plugin.init = function() {
            plugin.settings = $.extend({}, defaults, options);

            // Create canvas
            $canvas = $('<canvas class="imgplay-canvas">');
            // $canvas.prop({height: $(plugin.frames[0]).height(), width: $(plugin.frames[0]).width()});
            $canvas.prop({height: options.height, width: options.width});
            
            screen = $canvas.get(0).getContext('2d');
            $el.append($canvas);
            
            // default frame rate
            if ( ! plugin.settings.rate ) {
                plugin.settings.rate = parseInt(plugin.settings.totalImages / 10);
            }

            // Check plugin options
            Object.keys(plugin.settings).map(function(key, index) {
                if (plugin.settings[key] === null) {
                    console.error('Sarine imageplayer error: ' + key + ' is undefined in plugin configuration');
                }
            });

            if (plugin.settings.urlDir.indexOf('{num}') === -1) {
                console.error('Sarine imageplayer error: urlDir should contain {num} string in the image name, like: Image_{num}.jpg');
            }

            // Load images
            var img;
            total = plugin.settings.totalImages;

            img = new Image();
            //img = '<img src="' + plugin.getShardingURL(plugin.settings.urlDir, plugin.settings.startImage).replace('{num}', plugin.settings.startImage) + '" />';                      
            //$(img).get(0).onload = function() {
            img.onload =  function() {

                $el.trigger('firstimgloaded');
                            
                var frameCount = 0;
                for (var i = plugin.settings.startImage; i < plugin.settings.totalImages; ++i) {
                    img = '<img class="imageplay_loaded" src="' + plugin.getShardingURL(plugin.settings.urlDir, i).replace('{num}', i) + '" />';
                    $el.append(img);
                    plugin.frames[frameCount] = $(img).get(0);
                    frameCount++;
                }
            
                $el.addClass('sarine_imgplay');
                $el.css({height: options.height, width: options.width});
                
                initEvents();

                // remove images from DOM
                $el.find('img.imageplay_loaded').detach();

                // max rate is 100 fps and min rate is 0.001 fps
                plugin.settings.rate = (plugin.settings.rate < 0.001) ? 0.001 : plugin.settings.rate;
                plugin.settings.rate = (plugin.settings.rate > 100) ? 100 : plugin.settings.rate;

                if (plugin.settings.autoPlay) {
                    plugin.play();
                }
                else {
                    var imageLoadedInterval = setInterval(function () {
                        if($(img).get(0).complete)
                        {
                            clearInterval(imageLoadedInterval);
                            plugin.toFrame(plugin.settings.startImage == 0 ? 1 : plugin.settings.startImage);
                        }
                    }, 100);
                }
            };
            img.src = plugin.getShardingURL(plugin.settings.urlDir, plugin.settings.startImage).replace('{num}', plugin.settings.startImage);                      
        };

        plugin.play = function() {
            playing = true;
            if(playTimer != null) {
                clearTimeout(playTimer);
            }
            
            drawFrame();
            $el.trigger('play');
        };

        plugin.pause = function() {
            playing = false;
            if(playTimer != null) {
                clearTimeout(playTimer);
            }
            $el.trigger('pause');
        };

        plugin.stop = function() {
            playing = false;
            if (direction == 'forward')
                index = 0;
            else
                index = plugin.frames.length - 1;

            if (plugin.settings.autoReverse) {
                plugin.frames.reverse();
                index = plugin.frames[index] ? index + 1 : index + 2;
            }
            plugin.play();
            $el.trigger('stop', plugin);
        };

        plugin.toFrame = function(i) {
            i = i < 0 ? 0 : i;

            if (plugin.frames[i]) {
                index = i;
                drawFrame();
                return $.Deferred().resolve();
            }            
        };

        var initEvents = function() {
            
            var progress = $('<div class="imgplay-progress" id="imgplay_move">');
            var playBar = $('<div class="imgplay-play-bar">');
          
            function getCurrentPoint (target, e) {
                
                var touch = null, pageX = null;
                if (e.originalEvent && e.originalEvent.touches) {
                    touch = e.originalEvent && e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                    pageX = touch.pageX;
                }
                else {
                    pageX = e.pageX;
                }

                return pageX - target.offset().left;
            }

            function startMove (e) {
                plugin.pause();                    
                progressOnMouseDown = true;
                mousePosOnMouseDown = getCurrentPoint(progress, e); 
                indexOnMouseDown = index;                
            }

            function move (e) {
                if ( ! progressOnMouseDown) return;

                var target = progress;
                var curPosX = getCurrentPoint(target, e);
                                            
                var width = target.width();
                var frame = Math.floor(curPosX / width * total);
                
                isRightDirection = curPosX >= prevPosX;
                if (isRightDirection) {
                    direction = 'forward';
                }
                else {
                    direction = 'backward';
                }
                
                var mousePosOnMouseDownFrame = Math.floor(total / width * mousePosOnMouseDown);
                var curPosXFrame = Math.floor(total / width * curPosX);
                var offset;

                if (curPosXFrame >= mousePosOnMouseDown) {
                    offset = Math.floor(curPosXFrame - mousePosOnMouseDownFrame); 
                    index = indexOnMouseDown + offset;
                }
                else {
                    offset = Math.floor(mousePosOnMouseDownFrame - curPosXFrame);
                    index = indexOnMouseDown - offset;
                }

                if (index > total) {
                    index = index - total;                                
                }
                else if (index < 1) {
                    index = total + index;
                }

                //plugin.toFrame(index);
                //draw image
                var img = plugin.frames[index];
                var $img = $(img);
                if (img && img.complete && $img.prop('naturalHeight') > 0) {
                    screen.clearRect(0, 0, options.width, options.height);
                    screen.drawImage(img, 0, 0, options.width, options.height);  
                }

                prevPosX = curPosX;
            }

            function finishMove () {
                plugin.play();
                progressOnMouseDown = false;
            }

            var progressOnMouseDown = false,
                indexOnMouseDown = -1;
                mousePosOnMouseDown = -1,
                curPosX = 0,
                prevPosX = 0,
                isRightDirection = false;
            if (plugin.settings.userInteraction)
            {
                switch (plugin.settings.interactionMode)
                {
                    default:
                        progress
                        .on('mousedown touchstart', function(e) {
                            if (e.cancelable) 
                                e.preventDefault();
                            isUserInteraction = true;
                            startMove(e);                
                        })
                        .on('mousemove touchmove', function(e) {
                            if (e.cancelable) 
                                e.preventDefault();
                            if( !playing && !plugin.settings.autoPlay && !isUserInteraction )
                                return;
                            move(e);
                        })
                        .on('mouseleave mouseup touchend', function(e) {
                            if( !playing && !plugin.settings.autoPlay && !isUserInteraction )
                                return;

                            finishMove(e);
                        });
                    break;
                }
            }

            progress.append(playBar);
            $el.append(progress);
        };

        var drawFrame = function() {
            if (screen != null) {
                imgExist = true;
                var img = plugin.frames[index];
                var $img = $(img);
                if (img && img.complete && $img.prop('naturalHeight') > 0) {
                    /*
                    var cw = $canvas.width();
                    var ch = $canvas.height();
                    var iw = img.width;
                    var ih = img.height;
                    var vw = 0;
                    var vh = 0;

                    if (cw >= ch) {
                        vw = iw * (ch/ih);
                        vh = ch;
                    } else {
                        vw = cw;
                        vh = ih * (cw/iw);
                    }
                    screen.clearRect(0, 0, cw, ch);
                    screen.drawImage(img, (cw - vw) / 2, (ch - vh) / 2, vw, vh);*/

                    screen.clearRect(0, 0, options.width, options.height);
                    screen.drawImage(img, 0, 0, options.width, options.height);
                }
                else
                    imgExist = false;

                if (index >= (plugin.frames.length -1) && direction == 'forward') {
                    plugin.stop();
                    return;
                }

                if (playing) {
                    if (direction == 'forward') {
                        if(imgExist)
                            index++;
                    } 
                    else {
                        if(imgExist)
                        {
                            index--;

                            if (index < 0) {
                                plugin.stop();
                                return;
                            }
                        }
                    }

                    var curRate = Math.ceil(1000 / (plugin.settings.rate) );

                    playTimer = setTimeout(drawFrame, curRate);
                }

                drawProgress();
            }
        };

        var drawProgress = function() {
            loadProgress = ((plugin.frames.length / total) * 100);
            playProgress = ((index / plugin.frames.length) * 100);

            loadProgress = loadProgress > 100 ? 100 : loadProgress;
            playProgress = playProgress > 100 ? 100 : playProgress;

            $el.find('.imgplay-play-bar').css('width',  playProgress + '%');
        };

        plugin.init();
    };

    $.fn.imgplay = function(options) {
        this.each(function() {
            if($(this).data('imgplay') == undefined) {
                var plugin = new $.imgplay(this, options);
                $(this).data('imgplay', plugin);
            }
        });

        return this;
    };
})(jQuery);