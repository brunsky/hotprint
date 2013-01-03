//////////////////////////////////////////////////
// Sane design into image source

var scaling = 3; // Image saving ratio
 
function mod_saving(func_complete) {
	$("body").append('<div class="modalOverlay"></div>');
	$wDiv = $('.modalOverlay');
	// Check if design is completed
	if (!($('.canvas_appended').length != 0 && 
		$('.canvas_appended').length == $('.layout_corner').length)) {
		new Messi('<p>您尚未完成設計哦</p><p>請先將圖片按您的喜好拖拉至所有的區塊後，才能儲存</p>', {title: '提醒您 !', modal: true});
		$wDiv.remove();
		return;
	}
	
	
	$("body").append('<div id="progress-bar"><div id="status"></div></div>');
	$( "#progress-bar" ).css('position','fixed');
	$( "#progress-bar" ).css('z-index', '1001');
	$( "#progress-bar" ).css('top', '300px');
	$( "#progress-bar" ).css('left', '500px');
	$status = $('#status');
	var a = new Image();
	a.src = "images/"+PHONE_NAME+"_mask2.png";
	var jsonObj = []; // json array for storing layout&image information
	a.onload = function(){
	
		var resCanvas = document.createElement('canvas');
	    var resCtx = resCanvas.getContext('2d');
		resCanvas.width = Math.round($("#mCanvas")[0].width * scaling);
		resCanvas.height = Math.round($("#mCanvas")[0].height * scaling);
		
		// scaling mask
		var adjustMaskCanvas = document.createElement('canvas');
	    adjustMaskCanvas.width = a.width;
	    adjustMaskCanvas.height = a.height;
	    var adjustMaskCtx = adjustMaskCanvas.getContext('2d');                       
	    adjustMaskCtx.drawImage(a, 0, 0); 
		
		var factor = 100 / $('.layout_corner').length; 
		var inc = 0;
		
		var elements = $('body').find('.layout_corner');
		var index = 0;
		process();
		
		// Using settimeout to let browser update screen.
		function process() {
			var e = elements.get(index++);
			if ($(e).length) {

				$status.css('width', function(){
					inc += factor;
					return inc+"%";
				});
	
				
		    	if (typeof $(e).next()[0] != 'undefined' &&
		    		$(e).next()[0].tagName.toLowerCase() != 'canvas'.toLowerCase()) {
					return true; // the same as continue in C :)
				}
		    	
    			jsonObj.push({
		    		cornerId: $(e).attr('id'), 
		    		cornerClass: $(e).attr('class'),
		    		cornerStyle: $(e).attr('style'),
		    		imgURL: $(e).children(".draggable").data('src'),
		    		zdx: $(e).children(".draggable").data('zdx'),
		    		zdy: $(e).children(".draggable").data('zdy'),
		    		zw: $(e).children(".draggable").data('zw'),
		    		zh: $(e).children(".draggable").data('zh')});
				
				setTimeout(process, 10);
			}
			else {

				$.post("db/save_image.php", {userid: user_id, saveimag:JSON.stringify(jsonObj)}, function(data) {
					delete resCanvas;
					resCanvas = null;
					mod_gallerysave();
						
					$( "#progress-bar" ).remove();
					$( "#progress-bar" )[0] = null;
					$wDiv.remove();
					$wDiv[0] = null;
					
					func_complete();
				});
			}
		}
	}
}

function mod_saving_for_host(func_complete) {
	$("body").append('<div class="modalOverlay"></div>');
	$wDiv = $('.modalOverlay');
	// Check if design is completed
	if (!($('.canvas_appended').length != 0 && 
		$('.canvas_appended').length == $('.layout_corner').length)) {
		new Messi('<p>您尚未完成設計哦</p><p>請先將圖片按您的喜好拖拉至所有的區塊後，才能儲存</p>', {title: '提醒您 !', modal: true});
		$wDiv.remove();
		return;
	}
	
	
	$("body").append('<div id="progress-bar"><div id="status"></div></div>');
	$( "#progress-bar" ).css('position','fixed');
	$( "#progress-bar" ).css('z-index', '1001');
	$( "#progress-bar" ).css('top', '300px');
	$( "#progress-bar" ).css('left', '500px');
	$status = $('#status');
	var a = new Image();
	a.src = "images/"+PHONE_NAME+"_mask2.png";
	a.onload = function(){
	
		var resCanvas = document.createElement('canvas');
	    var resCtx = resCanvas.getContext('2d');
		resCanvas.width = Math.round($("#mCanvas")[0].width * scaling);
		resCanvas.height = Math.round($("#mCanvas")[0].height * scaling);
		
		// scaling mask
		var adjustMaskCanvas = document.createElement('canvas');
	    adjustMaskCanvas.width = a.width;
	    adjustMaskCanvas.height = a.height;
	    var adjustMaskCtx = adjustMaskCanvas.getContext('2d');                       
	    adjustMaskCtx.drawImage(a, 0, 0); 
		
		var factor = 100 / $('.layout_corner').length; 
		var inc = 0;
		
		var elements = $('body').find('.layout_corner');
		var index = 0;
		process();
		
		// Using settimeout to let browser update screen.
		function process() {
			var e = elements.get(index++);
			if ($(e).length) {

				$status.css('width', function(){
					inc += factor;
					return inc+"%";
				});
	
				
		    	if (typeof $(e).next()[0] != 'undefined' &&
		    		$(e).next()[0].tagName.toLowerCase() != 'canvas'.toLowerCase()) {
					return true; // the same as continue in C :)
				}
		    	
				var $c = $('<div></div>');
				
				$c.css('position', 'absolute');
				$c.css('top', Math.round(parseInt($(e).css('top'), 10)) * scaling + 'px');
				$c.css('left', Math.round(parseInt($(e).css('left'), 10)) * scaling + 'px');
				$c.css('width', Math.round(parseInt($(e).css('width'), 10)) * scaling + 'px');
				$c.css('height', Math.round(parseInt($(e).css('height'), 10)) * scaling + 'px');
				$c.css('border', '6px solid silver'); // setup border in manually !!
				//$c.css('border', $(this).css('border'));
				//$c.css('border-left-width', parseInt($(this).css('border-left-width'), 10) * scaling + 'px');
				$('body').append($c);
				
				var $imgSrc = $(e).children(".draggable");
				//$imgSrc.css('width', $imgSrc[0].width+'px');
				//$imgSrc.css('height',$imgSrc[0].height+'px');
				$imgSrc.css('width', '612px');
				$imgSrc.css('height','612px');
		
		    	if ($(e).attr("class").indexOf("layout_circle") >= 0) {
					doClipping( 
						doMasking($imgSrc[0], adjustMaskCanvas, $c, layout_x*scaling, layout_y*scaling), 
						$c, 
						cirClipper);	
				}
				else if ($(e).attr("class").indexOf("layout_square") >= 0) {
					doClipping( 
						doMasking($imgSrc[0], adjustMaskCanvas, $c, layout_x*scaling, layout_y*scaling), 
						$c, 
						boxClipper);
				}
			
				resCtx.drawImage($c.next()[0], 
		    					(Math.round(parseInt($c.next().css('left'), 10))-layout_x*scaling), 
		    					(Math.round(parseInt($c.next().css('top'), 10))-layout_y*scaling), 
		    					Math.round(parseInt($c.next().css('width'), 10)),
		    					Math.round(parseInt($c.next().css('height'), 10)));
		    	$c.next().remove();
		    	$c.next()[0] = null;			
		    	$c.remove();
		    	$c[0] = null;
		    	
		    	$imgSrc.css('width', '');
				$imgSrc.css('height','');
				
				setTimeout(process, 10);
			}
			else {
				
				/*
				$.ajax({
					  url:"db/save_image.php",
					  type:"POST",
					  data:resCanvas.toDataURL("image/png"),
					  contentType:"application/upload",
					  success: function(){
							delete resCanvas;
							resCanvas = null;
							mod_gallerysave();
								
							$( "#progress-bar" ).remove();
							$( "#progress-bar" )[0] = null;
							$wDiv.remove();
							$wDiv[0] = null;
							
							func_complete();
					  }
				});*/
				/*
				$.post("db/save_image.php", resCanvas.toDataURL("image/png"), function(data) {
					delete resCanvas;
					resCanvas = null;
					mod_gallerysave();
						
					$( "#progress-bar" ).remove();
					$( "#progress-bar" )[0] = null;
					$wDiv.remove();
					$wDiv[0] = null;
					
					func_complete();
				}, 'application/upload');*/
				
				delete resCanvas;
				mod_saveremote(resCanvas);
				resCanvas = null;
				$( "#progress-bar" ).remove();
				$( "#progress-bar" )[0] = null;
				$wDiv.remove();
				$wDiv[0] = null;
				// callback to notify application.js
				func_complete();
			}
		}
	}
}

/*
 * Save to a image from attached canvas for gallery display
 * (low resolution)
 */
function mod_gallerysave() {
	var bdr = Math.round(parseInt($('.layout_corner').css('border-left-width'), 10));
	var resCanvas = document.createElement('canvas');
    var resCtx = resCanvas.getContext('2d');
    $(resCanvas).attr('id', 'galleryCanvas');
	resCanvas.width = Math.round($("#mCanvas")[0].width);
	resCanvas.height = Math.round($("#mCanvas")[0].height);
	resCtx.drawImage($("#mCanvas")[0], 0, 0, resCanvas.width, resCanvas.height);
	$('.canvas_appended').each(function(index) {
    	resCtx.drawImage($(this)[0], 
    					(Math.round(parseInt($(this).css('left'), 10))-layout_x), 
    					(Math.round(parseInt($(this).css('top'), 10))-layout_y), 
    					Math.round(parseInt($(this)[0].width, 10)),
    					Math.round(parseInt($(this)[0].height, 10)));
	});
	/* 
	 * Using canvas to show image
	 * 
	 */
	/*
	$(resCanvas).css('position', 'absolute');
	$(resCanvas).css('top', '80px');
	$(resCanvas).css('left', '100px');
	$('body').append($(resCanvas));
	*/
	/* 
	 * Using img tag to show image
	 * 
	 */
	var img = $('<img>');
	img.attr('id', 'galleryCanvas');
	img.css('position', 'absolute');
	img.css('top', '80px');
	img.css('left', '100px');
	img.css('width', Math.round($("#mCanvas")[0].width*0.7)+'px');
	img.css('height', Math.round($("#mCanvas")[0].height*0.7)+'px');
	$('body').append(img);
	$('#galleryCanvas')[0].src = resCanvas.toDataURL();	
}

/*
 * Save image remotelly from <img> inside corner for gallery display
 * (high resolution)
 */
function mod_saveremote(resCanvas) {
	var img = $('<img>');
	img.attr('id', 'galleryCanvas');
	img.css('position', 'absolute');
	img.css('top', '80px');
	img.css('left', '100px');
	img.css('width', Math.round($("#mCanvas")[0].width*0.7)+'px');
	img.css('height', Math.round($("#mCanvas")[0].height*0.7)+'px');
	$('body').append(img);
	$('#galleryCanvas')[0].src = resCanvas.toDataURL();	
	
	// Preparing saving data in JSON formate
	var jsonObj = [];
	$('.layout_corner').each(function(index) {
    	jsonObj.push({
    		cornerId: $(this).attr('id'), 
    		cornerClass: $(this).attr('class'),
    		cornerStyle: $(this).attr('style'),
    		imgURL: $(this).children(".draggable").data('src'),
    		zdx: $(this).children(".draggable").data('zdx'),
    		zdy: $(this).children(".draggable").data('zdy'),
    		zw: $(this).children(".draggable").data('zw'),
    		zh: $(this).children(".draggable").data('zh')});
	});
	console.log(jsonObj);
}

/*
 * Set up object for draggable
 */
function setDragObj(divObj) {
	divObj.children(".draggable").draggable({
		scroll: false,
		cursor: 'auto', 
		cursorAt: { left: 35, top: 35 },
		revert:"valid",
		drag: function(event, ui) {
			if ($(this).attr("class").indexOf("ui-draggable-dragging") >= 0) {
				$(this).parent().css('z-index','1000');
				$(this).css("opacity", "0.7");
			}
		},
		start: function(event, ui) {
			disable_scroll();
			$(this).height($(this).data('oh')).width($(this).data('ow'));
			$('.layout_corner').css('z-index', '998'); 
			$('.layout_corner').stop(true, true).animate({ opacity: 1 });
			// set corner object
			$(this).data('corner', $(this).parent());
		},
		stop: function( event, ui ) {
			enable_scroll();
			if ($(this).parent().attr("class").indexOf("removed") >= 0) {
				clearCorner($(this).parent());
			}
		}
	});
	divObj.children(".draggable").css('z-index','');
	divObj.removeClass("removed");	
	divObj.children(".draggable").removeClass("ui-draggable-dragging");		
	divObj.css('cursor', 'move');
	divObj.css('z-index','998');
}

/*
 * Generize random design
 */
function mod_randesign() {
	if($('.layout_corner').children('.spinner').length > 0) {
		console.log('waiting spin stop');
		return;
	}
	
	// clear content
	$('.layout_corner').css('opacity', CORNER_OPT);
	$('.layout_corner').html('');
	$('.layout_corner > draggable').each(function(index) {
	  	$(this).remove();
	  	$(this)[0] = null;
	});
	$('.canvas_appended').each(function(index) {
	  	$(this).remove();
	  	$(this)[0] = null;
	});

	// visit image gallery in randomly
	$('.layout_corner').each(function(index) {

		var r = Math.floor(Math.random() * $('.gallery-pool').length);
		// put image into layout
		$(this).append($($('.gallery-pool')[r]).clone());
		$(this).children(".draggable").removeClass('gallery-pool'); // remove to prevent getting the same one
		// copy original size
		$(this).children(".draggable").data('oh', Math.round($('.gallery-pool')[r].height*0.7));
		$(this).children(".draggable").data('ow', Math.round($('.gallery-pool')[r].width*0.7));
			
		$(this).children(".draggable").css({
			"position": "relative",
			"top": "0px",
			"left": "0px",
			"width": $(this).css('width'),
			"height": $(this).css('height'),
			"opacity": "0"
		});
		
		var imgSrc = $(this).children(".draggable").attr('src');
		var divObj = $(this);
		// copy img url from gallery-pool object
		$(this).children(".draggable").data('src', imgSrc);
		
		var opts = {
		  lines: 13, // The number of lines to draw
		  length: 7, // The length of each line
		  width: 4, // The line thickness
		  radius: 10, // The radius of the inner circle
		  corners: 1, // Corner roundness (0..1)
		  rotate: 0, // The rotation offset
		  color: '#000', // #rgb or #rrggbb
		  speed: 1, // Rounds per second
		  trail: 60, // Afterglow percentage
		  shadow: false, // Whether to render a shadow
		  hwaccel: false, // Whether to use hardware acceleration
		  className: 'spinner', // The CSS class to assign to the spinner
		  zIndex: 2e9, // The z-index (defaults to 2000000000)
		  top: 'auto', // Top position relative to parent in px
		  left: 'auto' // Left position relative to parent in px
		};

		var spinner = new Spinner(opts).spin($(this)[0]);
		$.getImageData({
			url: imgSrc,
			server: "http://insta.camangiwebstation.com/proxy/getImageData.php",
			success: function(image){
				divObj.children(".draggable").attr('src', image.src);
				divObj.children(".draggable").addClass("cached");
				if (divObj.attr("class").indexOf("layout_circle") >= 0) {
					doClipping( 
						doMasking(image, maskImg, divObj, layout_ox, layout_oy), 
						divObj, 
						cirClipper);	
				}
				else if (divObj.attr("class").indexOf("layout_square") >= 0) {
					doClipping( 
						doMasking(image, maskImg, divObj, layout_ox, layout_oy), 
						divObj, 
						boxClipper);
				}
				// set corner div to invisible
				divObj.css('opacity','0');
				spinner.stop();
				setDragObj(divObj);
			},
			error: function(xhr, text_status){
				spinner.stop();
				console.log("Fail to get image:"+imgSrc);
			}
		});
	});
}

/*
 * CLear button
 */
function clearDesign() {
	// Check if any design already
	if ($('.canvas_appended').length != 0 ) {
		$("body").append('<div class="modalOverlay"></div>');
		new Messi('你確定要清除設計嗎？所有的圖片將會被清空！', 
			{title: '清除內容', 
			 buttons: [{id: 0, label: 'Yes', val: 'Y'}, 
						{id: 1, label: 'No', val: 'N'}], 
			 callback: function(val) {  
				if (val === 'Y') {
					if ( $('.layout_corner').length ) {
						$('.layout_corner').children('.draggable').each(function(index) {
					  		$(this).remove();
						  	$(this)[0] = null;
						});
					}
					if ( $('.canvas_appended').length ) {
						$('.canvas_appended').each(function(index) {
						  	$(this).remove();
						  	$(this)[0] = null;
						});
					}
				}
				$('.modalOverlay').remove();
				$('.layout_corner').animate({ opacity: CORNER_OPT});
			}});
	}
}

/*
 * CSS loader
 */

function styleOnload(node, callback) {
    if (node.attachEvent) {
      node.attachEvent('onload', callback);
    }
    else {
      setTimeout(function() {
        poll(node, callback);
      }, 0);
    }
}

function poll(node, callback) {
  if (callback.isCalled) {
    return;
  }

  var isLoaded = false;

  if (/webkit/i.test(navigator.userAgent)) {//webkit
    if (node['sheet']) {
      isLoaded = true;
    }
  }else if (node['sheet']) {
    try {
      if (node['sheet'].cssRules) {
        isLoaded = true;
      }
    } catch (ex) {
      if (ex.code === 1000) {
        isLoaded = true;
      }
    }
  }

  if (isLoaded) {
    setTimeout(function() {
      callback();
    }, 1);
  }
  else {
    setTimeout(function() {
      poll(node, callback);
    }, 1);
  }
}

// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = [37, 38, 39, 40];

function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.returnValue = false;
}

function keydown(e) {
    for (var i = keys.length; i--;) {
        if (e.keyCode === keys[i]) {
            preventDefault(e);
            return;
        }
    }
}
/*
 * Disable/Enable scrolling
 */
function wheel(e) {
    preventDefault(e);
}

function disable_scroll() {
    if (window.addEventListener) {
        window.addEventListener('DOMMouseScroll', wheel, false);
    }
    window.onmousewheel = document.onmousewheel = wheel;
    document.onkeydown = keydown;
}

function enable_scroll() {
    if (window.removeEventListener) {
        window.removeEventListener('DOMMouseScroll', wheel, false);
    }
    window.onmousewheel = document.onmousewheel = document.onkeydown = null;
}
