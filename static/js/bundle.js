(function () {
  var $slideout = $("#slideout");
  $("#slideclick").on("click", function () {
    if ($slideout.hasClass("popped")) {
      $slideout.animate({left: "-222px"}, {queue: false, duration: 500}).removeAttr("class");
    } else {
      $slideout.animate({left: "0px" }, {queue: false, duration: 500}).addClass("popped");
    }
  });
  $("ul ul").hide();
  $("ul li.expanded > a").removeAttr("href");
  $("ul li.expanded > a").click(function () {
    $(this).parent().find("ul").toggle("slow");
    $("i.icon-folder-close").toggleClass("icon-folder-open");
  });
  $(".item").on("click", function () {
    $slideout.animate({left: "-222px"}, {queue: false, duration: 500}).removeAttr("class");
  });
})();
// http://aboutcode.net/2013/01/09/load-images-with-jquery-deferred.html

$.loadImage = function(url) {
  // Define a "worker" function that should eventually resolve or reject the deferred object.
  var loadImage = function(deferred) {
    var image = new Image();
     
    // Set up event handlers to know when the image has loaded
    // or fails to load due to an error or abort.
    image.onload = loaded;
    image.onerror = errored; // URL returns 404, etc
    image.onabort = errored; // IE may call this if user clicks "Stop"
     
    // Setting the src property begins loading the image.
    image.src = url;
     
    function loaded() {
      unbindEvents();
      // Calling resolve means the image loaded sucessfully and is ready to use.
      deferred.resolve(image);
    }
    function errored() {
      unbindEvents();
      // Calling reject means we failed to load the image (e.g. 404, server offline, etc).
      deferred.reject(image);
    }
    function unbindEvents() {
      // Ensures the event callbacks only get called once.
      image.onload = null;
      image.onerror = null;
      image.onabort = null;
    }
  };
   
  // Create the deferred object that will contain the loaded image.
  // We don't want callers to have access to the resolve() and reject() methods, 
  // so convert to "read-only" by calling `promise()`.
  return $.Deferred(loadImage).promise();
};/*---------------------------------------------------------------------------------------------

@author       Constantin Saguin - @brutaldesign
@link            http://bsign.co
@github        http://github.com/brutaldesign/swipebox
@version     1.1.2
@license      MIT License

----------------------------------------------------------------------------------------------*/

;(function (window, document, $, undefined) {
	
	$.swipebox = function(elem, options) {

		var defaults = {
			useCSS : true,
			hideBarsDelay : 3000
		},
		
			plugin = this,
			$elem = $(elem),
			elem = elem,
			selector = elem.selector,
			$selector = $(selector),
			isTouch = document.createTouch !== undefined || ('ontouchstart' in window) || ('onmsgesturechange' in window) || navigator.msMaxTouchPoints,
			supportSVG = !!(window.SVGSVGElement),
			html = '<div id="swipebox-overlay">\
					<div id="swipebox-slider"></div>\
					<div id="swipebox-caption"></div>\
					<div id="swipebox-action">\
						<a id="swipebox-close"></a>\
						<a id="swipebox-prev"></a>\
						<a id="swipebox-next"></a>\
					</div>\
			</div>';

		plugin.settings = {}

		plugin.init = function(){

			plugin.settings = $.extend({}, defaults, options);
			
			$selector.click(function(e){
				e.preventDefault();
				e.stopPropagation();
				index = $elem.index($(this));
				ui.target = $(e.target);
				ui.init(index);
			});
		}

		var ui = {

			init : function(index){
				this.target.trigger('swipebox-start');
				this.build();
				this.openSlide(index);
				this.openImg(index);
				this.preloadImg(index+1);
				this.preloadImg(index-1);
			},

			build : function(){
				var $this = this;
				
				$('body').append(html);

				if($this.doCssTrans()){
					$('#swipebox-slider').css({
						'-webkit-transition' : 'left 0.4s ease',
						'-moz-transition' : 'left 0.4s ease',
						'-o-transition' : 'left 0.4s ease',
						'-khtml-transition' : 'left 0.4s ease',
						'transition' : 'left 0.4s ease'
					});
					$('#swipebox-overlay').css({
						'-webkit-transition' : 'opacity 1s ease',
						'-moz-transition' : 'opacity 1s ease',
						'-o-transition' : 'opacity 1s ease',
						'-khtml-transition' : 'opacity 1s ease',
						'transition' : 'opacity 1s ease'
					});
					$('#swipebox-action, #swipebox-caption').css({
						'-webkit-transition' : '0.5s',
						'-moz-transition' : '0.5s',
						'-o-transition' : '0.5s',
						'-khtml-transition' : '0.5s',
						'transition' : '0.5s'
					});
				}


				if(supportSVG){
					var bg = $('#swipebox-action #swipebox-close').css('background-image');
					bg = bg.replace('png', 'svg');
					$('#swipebox-action #swipebox-prev,#swipebox-action #swipebox-next,#swipebox-action #swipebox-close').css({
						'background-image' : bg
					});
				}
				
				$elem.each(function(){
					$('#swipebox-slider').append('<div class="slide"></div>');
				});

				$this.setDim();
				$this.actions();
				$this.keyboard();
				$this.gesture();
				$this.animBars();

				$(window).resize(function() {
					$this.setDim();
				}).resize();
			},

			setDim : function(){
				var sliderCss = {
					width : $(window).width(),
					height : window.innerHeight ? window.innerHeight : $(window).height() // fix IOS bug
				}

				$('#swipebox-overlay').css(sliderCss);

			},

			supportTransition : function() {
				var prefixes = 'transition WebkitTransition MozTransition OTransition msTransition KhtmlTransition'.split(' ');
				for(var i = 0; i < prefixes.length; i++) {
					if(document.createElement('div').style[prefixes[i]] !== undefined) {
						return prefixes[i];
					}
				}
				return false;
			},

			doCssTrans : function(){
				if(plugin.settings.useCSS && this.supportTransition() ){
					return true;
				}
			},

			gesture : function(){
				if ( isTouch ){
					var $this = this,
					distance = null,
					swipMinDistance = 10,
					startCoords = {}, 
					endCoords = {};
					var b = $('#swipebox-caption, #swipebox-action');

					b.addClass('visible-bars');
					$this.setTimeout();
					
					$('body').bind('touchstart', function(e){

						$(this).addClass('touching');

		  				endCoords = e.originalEvent.targetTouches[0];
		    				startCoords.pageX = e.originalEvent.targetTouches[0].pageX;

						$('.touching').bind('touchmove',function(e){
							e.preventDefault();
							e.stopPropagation();
		    					endCoords = e.originalEvent.targetTouches[0];

						});
			           			
			           			return false;

	           			}).bind('touchend',function(e){
	           				e.preventDefault();
						e.stopPropagation();
	   				
	   					distance = endCoords.pageX - startCoords.pageX;
	       				
	       				if( distance >= swipMinDistance ){
	       					// swipeLeft
	       					$this.getPrev();
	       				}

	       				else if( distance <= - swipMinDistance ){
	       					// swipeRight
	       					$this.getNext();
	       				
	       				}else{
	       					// tap
	       					if(!b.hasClass('visible-bars')){
							$this.showBars();
							$this.setTimeout();
						}else{
							$this.clearTimeout();
							$this.hideBars();
						}

	       				}	

	       				$('.touching').off('touchmove').removeClass('touching');
						
					});

           			}
			},

			setTimeout: function(){
				if(plugin.settings.hideBarsDelay > 0){
					var $this = this;
					$this.clearTimeout();
					$this.timeout = window.setTimeout( function(){
						$this.hideBars() },
						plugin.settings.hideBarsDelay
					);
				}
			},
			
			clearTimeout: function(){	
				window.clearTimeout(this.timeout);
				this.timeout = null;
			},

			showBars : function(){
				var b = $('#swipebox-caption, #swipebox-action');
				if(this.doCssTrans()){
					b.addClass('visible-bars');
				}else{
					$('#swipebox-caption').animate({ top : 0 }, 500);
					$('#swipebox-action').animate({ bottom : 0 }, 500);
					setTimeout(function(){
						b.addClass('visible-bars');
					}, 1000);
				}
			},

			hideBars : function(){
				var b = $('#swipebox-caption, #swipebox-action');
				if(this.doCssTrans()){
					b.removeClass('visible-bars');
				}else{
					$('#swipebox-caption').animate({ top : '-50px' }, 500);
					$('#swipebox-action').animate({ bottom : '-50px' }, 500);
					setTimeout(function(){
						b.removeClass('visible-bars');
					}, 1000);
				}
			},

			animBars : function(){
				var $this = this;
				var b = $('#swipebox-caption, #swipebox-action');
					
				b.addClass('visible-bars');
				$this.setTimeout();
				
				$('#swipebox-slider').click(function(e){
					if(!b.hasClass('visible-bars')){
						$this.showBars();
						$this.setTimeout();
					}
				});

				$('#swipebox-action').hover(function() {
				  		$this.showBars();
						b.addClass('force-visible-bars');
						$this.clearTimeout();
					
					},function() { 
						b.removeClass('force-visible-bars');
						$this.setTimeout();

				});
			},

			keyboard : function(){
				var $this = this;
				$(window).bind('keyup', function(e){
					e.preventDefault();
					e.stopPropagation();
					if (e.keyCode == 37){
						$this.getPrev();
					}
					else if (e.keyCode==39){
						$this.getNext();
					}
					else if (e.keyCode == 27) {
						$this.closeSlide();
					}
				});
			},

			actions : function(){
				var $this = this;
				
				if( $elem.length < 2 ){
					$('#swipebox-prev, #swipebox-next').hide();
				}else{
					$('#swipebox-prev').bind('click touchend', function(e){
						e.preventDefault();
						e.stopPropagation();
						$this.getPrev();
						$this.setTimeout();
					});
					
					$('#swipebox-next').bind('click touchend', function(e){
						e.preventDefault();
						e.stopPropagation();
						$this.getNext();
						$this.setTimeout();
					});
				}

				$('#swipebox-close').bind('click touchend', function(e){
					$this.closeSlide();
				});
			},
			
			setSlide : function (index, isFirst){
				isFirst = isFirst || false;
				
				var slider = $('#swipebox-slider');
				
				if(this.doCssTrans()){
					slider.css({ left : (-index*100)+'%' });
				}else{
					slider.animate({ left : (-index*100)+'%' });
				}
				
				$('#swipebox-slider .slide').removeClass('current');
				$('#swipebox-slider .slide').eq(index).addClass('current');
				this.setTitle(index);

				if( isFirst ){
					slider.fadeIn();
				}

				$('#swipebox-prev, #swipebox-next').removeClass('disabled');
				if(index == 0){
					$('#swipebox-prev').addClass('disabled');
				}else if( index == $elem.length - 1 ){
					$('#swipebox-next').addClass('disabled');
				}
			},
		
			openSlide : function (index){
				
				$('html').addClass('swipebox');
				$(window).trigger('resize'); // fix scroll bar visibility on desktop
				this.setSlide(index, true);
			},
		
			preloadImg : function (index){
				var $this = this;
				setTimeout(function(){
					$this.openImg(index);
				}, 1000);
			},
			
			openImg : function (index){
				var $this = this;
				if(index < 0 || index >= $elem.length){
					return false;
				}

				$this.loadImg($elem.eq(index).attr('href'), function(){
					$('#swipebox-slider .slide').eq(index).html(this);
				});
			},


			setTitle : function(index, isFirst){
				$('#swipebox-caption').empty();
				
				if($elem.eq(index).attr('title')){
					$('#swipebox-caption').append($elem.eq(index).attr('title'));
				}
			},
			
			loadImg : function (src, callback){
				var img = $('<img>').on('load', function(){
					callback.call(img);
				});
				
				img.attr('src',src);
			},
			
			getNext : function (){
				var $this = this;
				index = $('#swipebox-slider .slide').index($('#swipebox-slider .slide.current'));
				if(index+1 < $elem.length){
					index++;
					$this.setSlide(index);
					$this.preloadImg(index+1);
				}
				else{
					
					$('#swipebox-slider').addClass('rightSpring');
					setTimeout(function(){
						$('#swipebox-slider').removeClass('rightSpring');
					},500);
				}
			},
			
			getPrev : function (){
				var $this = this;
				index = $('#swipebox-slider .slide').index($('#swipebox-slider .slide.current'));
				if(index > 0){
					index--;
					$this.setSlide(index);
					$this.preloadImg(index-1);
				}
				else{
					
					$('#swipebox-slider').addClass('leftSpring');
					setTimeout(function(){
						$('#swipebox-slider').removeClass('leftSpring');
					},500);
				}
			},


			closeSlide : function (){
				var $this = this;
				$(window).trigger('resize');
				$('html').removeClass('swipebox');
				$this.destroy();
			},

			destroy : function(){
				var $this = this;
				$(window).unbind('keyup');
				$('body').unbind('touchstart');
				$('body').unbind('touchmove');
				$('body').unbind('touchend');
				$('#swipebox-slider').unbind();
				$('#swipebox-overlay').remove();
				$elem.removeData('_swipebox');
				$this.target.trigger('swipebox-destroy');
 			}

		}

		plugin.init();
		
	}

	$.fn.swipebox = function(options){
		if (!$.data(this, "_swipebox")) {
			var swipebox = new $.swipebox(this, options);
			this.data('_swipebox', swipebox);
		}
	}

}(window, document, jQuery));
//if (data.length != 0) {
function loadGallery(data){

	// Global variables that hold state

	var page = 0,
		per_page = 100,
		photo_default_size = 150,
		picture_width = photo_default_size,
		picture_height = photo_default_size,
		max_w_photos, max_h_photos;
		//data = [];

	// Global variables that cache selectors

	var win = $(window),
		loading = $('#loading'),
		gallery = $('#gallery');

	// Fetch all the available images with
	// a GET AJAX request

	/*$.get('load.php', function(response){

		// response.data holds the photos

		data = response.data;

		// Trigger our custom data-ready event
		gallery.trigger('data-ready');

	});*/

	// Redraw the photos on screen
	gallery.on('data-ready window-resized page-turned', function(event, direction){

		var cache = [],
			deferreds = [];

		gallery.trigger('loading');

		// The photos that we should be showing on the new screen
		var set = data.slice(get_page_start(), get_page_start() + get_per_page());

		$.each(set, function(){

			// Create a deferred for each image, so
			// we know when they are all loaded
			deferreds.push($.loadImage(this.thumb));

			// build the cache
			cache.push('<a href="' + this.large + '" class="swipebox"' +
						'style="width:' + picture_width + 'px;height:' + picture_height + 'px;background-image:url(' + this.thumb + ')">'+
						'</a>');
		});

		if(is_prev_page()){
			cache.unshift('<a class="prev" style="width:' + picture_width + 'px;height:' + picture_height + 'px;"></a>');
		}

		if(is_next_page()){
			cache.push('<a class="next" style="width:' + picture_width + 'px;height:' + picture_height + 'px;"></a>');
		}

		if(!cache.length){
			// There aren't any images
			return false;
		}

		// Call the $.when() function using apply, so that
		// the deferreds array is passed as individual arguments.
		// $.when(arg1, arg2) is the same as $.when.apply($, [arg1, arg2])

		$.when.apply($, deferreds).always(function(){

			// All images have been loaded!

			if(event.type == 'window-resized'){

				// No need to animate the photos
				// if this is a resize event

				gallery.html(cache.join(''));
				show_photos_static();

				// Re-initialize the swipebox
				$('#gallery .swipebox').swipebox();

			}
			else{

				// Create a fade out effect
				gallery.fadeOut(function(){

					// Add the photos to the gallery
					gallery.html(cache.join(''));

					if(event.type == 'page-turned' && direction == 'br'){
						show_photos_with_animation_br();
					}
					else{
						show_photos_with_animation_tl();
					}

					// Re-initialize the swipebox
					$('#gallery .swipebox').swipebox();

					gallery.show();

				});
			}

			gallery.trigger('loading-finished');
		});

	});


	gallery.on('loading',function(){
		// show the preloader
		loading.show();
	});

	gallery.on('loading-finished',function(){
		// hide the preloader
		loading.hide();
	});

	gallery.on('click', '.next', function(){
		page++;
		gallery.trigger('page-turned',['br']);
	});

	gallery.on('click', '.prev', function(){
		page--;
		gallery.trigger('page-turned',['tl']);
	});


	// Monitor window resizing or changing device orientation
	win.on('resize', function(e) {
		var width = $("#gallery").innerWidth(),
			height = $(window).height() - 100,
            //height = $(window).height() - $("div.navbar.navbar-top").height(),
            gallery_width, gallery_height,
			difference;
        //document.write(height);
        //document.write(width);

		// How many photos can we fit on one line?
		max_w_photos = Math.ceil(width/photo_default_size);

		// Difference holds how much we should shrink each of the photos
		difference = (max_w_photos * photo_default_size - width) / max_w_photos;

		// Set the global width variable of the pictures.
		picture_width = Math.ceil(photo_default_size - difference);

		// Set the gallery width
		gallery_width = max_w_photos * picture_width;

		// Let's do the same with the height:

		max_h_photos = Math.ceil(height/photo_default_size);
		difference = (max_h_photos * photo_default_size - height) / max_h_photos;
		picture_height = Math.ceil(photo_default_size - difference);
		gallery_height = max_h_photos * picture_height;

		// How many photos to show per page?
		per_page = max_w_photos*max_h_photos;

		// Resize the gallery holder
		gallery.width(gallery_width).height(gallery_height);

		gallery.trigger('window-resized');

	}).resize();

	function show_photos_static(){

		// Show the images without any animations
		gallery.find('a').addClass('static');

	}

	function show_photos_with_animation_tl(){

		// Animate the images from the top-left

		var photos = gallery.find('a');

		for(var i=0; i<max_w_photos + max_h_photos; i++){

			var j = i;

			// Loop through all the lines
			for(var l = 0; l < max_h_photos; l++){

				// If the photo is not of the current line, stop.
				if(j < l*max_w_photos) break;

				// Schedule a timeout. It is wrapped in an anonymous
				// function to preserve the value of the j variable

				(function(j){
					setTimeout(function(){
						photos.eq(j).addClass('show');
					}, i*50);
				})(j);

				// Increment the counter so it points to the photo
				// to the left on the line below

				j += max_w_photos - 1;
			}
		}
	}

	function show_photos_with_animation_br(){

		// Animate the images from the bottom-right

		var photos = gallery.find('a');

		for(var i=0; i<max_w_photos + max_h_photos; i++){

			var j = per_page - i;

			// Loop through all the lines
			for(var l = max_h_photos-1; l >= 0; l--){

				// If the photo is not of the current line, stop.
				if(j > (l+1)*max_w_photos-1) break;

				// Schedule a timeout. It is wrapped in an anonymous
				// function to preserve the value of the j variable

				(function(j){
					setTimeout(function(){
						photos.eq(j).addClass('show');
					}, i*50);
				})(j);

				// Decrement the counter so it points to the photo
				// to the right on the line above

				j -= max_w_photos - 1;
			}
		}
	}

	/* Helper functions */

	function get_per_page(){

		// How many pictures should be shown on current page

		// The first page has only one arrow,
		// so we decrease the per_page argument with 1
		if(page === 0){
			return per_page - 1;
		}

		// Is this the last page?
		if(get_page_start() + per_page - 1 > data.length - 1){
			// It also has 1 arrow.
			return per_page - 1;
		}

		// The other pages have two arrows.
		return per_page - 2;
	}

	function get_page_start(p){

		// Which position holds the first photo
		// that is to be shown on the give page

		if(p === undefined){
			p = page;
		}

		if(p === 0){
			return 0;
		}

		// (per_page - 2) because the arrows take up two places for photos
		// + 1 at the end because the first page has only a next arrow.

		return (per_page - 2)*p + 1;
	}

	function is_next_page(){

		// Should we show the next arrow?

		return data.length > get_page_start(page + 1);
	}

	function is_prev_page(){

		// Should we show the previous arrow?

		return page > 0;
	}

}
