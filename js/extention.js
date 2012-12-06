//////////////////////////////////////////////////
// Sane design into image source

var scaling = 3; // Image saving ratio
 
function mod_saving(func_complete) {
	// Check if design is completed
	if (!($('.canvas_appended').length != 0 && 
		$('.canvas_appended').length == $('.layout_corner').length)) {
		new Messi('<p>您尚未完成設計哦</p><p>請先將圖片按您的喜好拖拉至所有的區塊後，才能儲存</p>', {title: '提醒您 !', modal: true});
		return;
	}
	
	$("body").append('<div class="modalOverlay"></div>');
	$wDiv = $('.modalOverlay');
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
		resCanvas.width = $("#mCanvas")[0].width * scaling;
		resCanvas.height = $("#mCanvas")[0].height * scaling;
		
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
				$c.css('top', parseInt($(e).css('top'), 10) * scaling + 'px');
				$c.css('left', parseInt($(e).css('left'), 10) * scaling + 'px');
				$c.css('width', parseInt($(e).css('width'), 10) * scaling + 'px');
				$c.css('height', parseInt($(e).css('height'), 10) * scaling + 'px');
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
		    					(parseInt($c.next().css('left'), 10)-layout_x*scaling), 
		    					(parseInt($c.next().css('top'), 10)-layout_y*scaling), 
		    					parseInt($c.next().css('width'), 10),
		    					parseInt($c.next().css('height'), 10));
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
					resCanvas = null;
					mod_gallerysave();
					$( "#progress-bar" ).remove();
					$( "#progress-bar" )[0] = null;
					$wDiv.remove();
					$wDiv[0] = null;
					
					func_complete();
			}
		}
	}
}

/*
 * Save to a image from canvas for gallery display
 * (low resolution)
 */
function mod_gallerysave() {
	var resCanvas = document.createElement('canvas');
    var resCtx = resCanvas.getContext('2d');
    $(resCanvas).attr('id', 'galleryCanvas');
	resCanvas.width = $("#mCanvas")[0].width * 0.7;
	resCanvas.height = $("#mCanvas")[0].height * 0.7;
	resCtx.drawImage($("#mCanvas")[0], 0, 0, resCanvas.width, resCanvas.height);
	$('.canvas_appended').each(function(index) {
    	resCtx.drawImage($(this)[0], 
    					(parseInt($(this).css('left'), 10)-layout_x) * 0.7, 
    					(parseInt($(this).css('top'), 10)-layout_y) * 0.7, 
    					parseInt($(this)[0].width, 10) * 0.7,
    					parseInt($(this)[0].height, 10) * 0.7);
	});
	$(resCanvas).css('position', 'absolute');
	$(resCanvas).css('top', '80px');
	$(resCanvas).css('left', '100px');
	$('body').append($(resCanvas));
}

/*
 * Save image remotelly from canvas for gallery display
 * (high resolution)
 */
function mod_saveremote(resCanvas) {
	var img = $('<img>');
	img.attr('id', 'galleryCanvas');
	img.css('position', 'absolute');
	img.css('top', '80px');
	img.css('left', '100px');
	img.css('width', $("#mCanvas")[0].width*0.7+'px');
	img.css('height', $("#mCanvas")[0].height*0.7+'px');
	$('body').append(img);
	$('#galleryCanvas')[0].src = resCanvas.toDataURL();	
}

/*
 * Generize random design
 */
function mod_randesign() {
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
		$(this).children(".draggable").css({
			"position": "relative",
			"top": "0px",
			"left": "0px",
			"width": $(this).css('width'),
			"height": $(this).css('height'),
			"opacity": "0"
		});
		$(this).children(".draggable").draggable({
			cursor: 'auto', 
			distance: 10, 
			cursorAt: { left: 50, top: 50 },
			revert:"invalid",
			drag: function(event, ui) {
				if ($(this).attr("class").indexOf("ui-draggable-dragging") >= 0) {
					$(this).parent().css('z-index','1000');
					$(this).css("opacity", "0.7");
				}
			},
			start: function(event, ui) {
				$(this).height(100).width(100);
				$('.layout_corner').css('z-index', '998'); 
				$('.layout_corner').animate({ opacity: 1 });
				// set corner object
				$(this).data('corner', $(this).parent());
			}
		});
		
		var imgSrc = $(this).children(".draggable").attr('src');
		var divObj = $(this);
		
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
			},
			error: function(xhr, text_status){
				spinner.stop();
				console.log("Fail to get image:"+imgSrc);
			}
		});
		
		$(this).children(".draggable").css('z-index','');		
		$(this).css('cursor', 'move');
		$(this).css('z-index','998');
	});
}
