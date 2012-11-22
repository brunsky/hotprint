/*
 * Get instagram user ID
 */
 
 // Global settings
 var PHONE_NAME = 'onex';
 var LAYOUT_NAME = 'layout_3';
 var layout_x = 410;
 var layout_y =  Math.floor($(window).height() * 0.1);
 var CORNER_OPT = 0.1;
 var isCornerFading = false;
 
(function(){
  
  var _init
  ,   _getUserData
  ,   _displayUserData
  ,   _login
  ,   _getUserRecent
  ;
  
  var access_token
  ,   user_id
  ;

  
  $.extend({
    instagramr: function(){
      _init();
    }
  });
  
  _init = function(){
    
    // Remove no-js class
    $('html').removeClass('no-js');
    
    // Check if user is logged in
    _login();
    
  };
  
  _getUserRecent = function() {
  
	var request = $.ajax({
      dataType: "jsonp",
      url: "https://api.instagram.com/v1/users/"+user_id+"/media/recent",
      data: {
        access_token: access_token,
		count: 50
      }
    });
    request.success(_displayUserRecent);
	
  };
  
  _getUserData = function(){
    
    var request = $.ajax({
      dataType: "jsonp",
      url: "https://api.instagram.com/v1/users/self",
      data: {
        access_token: access_token
      }
    });
    request.success(_displayUserData);
    
  };
  
  _login = function(){
    access_token = location.hash.split('=')[1];
    if (access_token === undefined) {
      $('body').addClass('not-logged-in');
    } else {
      $('body').addClass('logged-in');
	  _getUserData();
	  $('#save-design').click(saveImg);
	  $('#random-design').click(randomDesign);
    }
  };
  
  _displayUserData = function(json){
    $("#get-user-data").html("")
                .fadeIn(300)
                .append("ID: " + json.data.id);
	user_id = json.data.id;
	_getUserRecent();
  };
    
  _displayUserRecent = function(json){
	var res = "";
	for(var i=0; i<json.data.length; i++) {
		res += "<li><a href='"+json.data[i].images.standard_resolution.url+"'><img src=\""+json.data[i].images.standard_resolution.url+"\" class='draggable gallery-pool'/></a></li>";
	}

	$(".ad-thumb-list").html("")
                .fadeIn(300)
                .append(res);
				
	$('.ad-gallery').adGallery({thumb_opacity: 1});
	$('.ad-gallery').css('width',($(window).width()-50)+'px');
	$('.ad-gallery').css({
		"margin": '0 auto',
		"-webkit-touch-callout": "none",
		"-webkit-user-select": "none",
		"-khtml-user-select": "none",
		"-moz-user-select": "none",
		"-ms-user-select": "none",
		"user-select": "none"
	});
	
	/*選取動畫待研究*/
	/*
	$('.draggable').mouseenter(function(){
		$(this).animate({ top: $('#recent').css('top') }, 'fast');
	}).mouseleave(function(){
	});*/
	
	$('.draggable').draggable({
		cursor: 'move', 
		helper: "clone", 
		cursorAt: { left: 50, top: 50 },
		distance: 10, 
		revert: "invalid",
		drag: function(event, ui) {
			ui.helper.css('z-index','1000');
			ui.helper.css('opacity','0.7');
			if ($(this).attr("class").indexOf("ui-draggable-dragging") >= 0) {
				$(".ui-draggable-dragging").css('z-index','1000');
			}
		},
		start: function(event, ui) {
			$(this).height(100).width(100);
			$('.layout_corner').css('z-index', '998');
			$('.layout_corner').animate({ opacity: 1});
		},
		stop: function(event, ui) {
			isCornerFading = true;
			$('.layout_corner').animate({ opacity: CORNER_OPT},
				{complete:  function() { 
					$('.layout_corner > .draggable').parent().css('opacity', '0');
					isCornerFading = false;
				} 
			});
		}
	});
  };
  
})(jQuery);

////////////////////////////

// Define Drag&Drop
function setDnD(maskImg, ox, oy) {
	$( ".layout_corner" ).droppable({
		accept: ".draggable",
		drop: function( event, ui ) {
			if ($(this).next()[0].tagName.toLowerCase() == 'canvas'.toLowerCase()) {
				$(this).next().remove();
			}
			$(this).html('');
			$(this).append($(ui.draggable).clone());
			
			// if it is draged from gallery list then don't animate corner
			if (isCornerFading == false) {
				$('.layout_corner').animate({ opacity: CORNER_OPT},
					{complete:  function() { 
						$('.layout_corner > .draggable').parent().css('opacity', '0');
					} 
				});
			}
			
			// copy zoomer value
			$(this).children(".draggable").data('zdx', $(this).data('zdx'));
			$(this).children(".draggable").data('zdy', $(this).data('zdy'));
			$(this).children(".draggable").data('zw', $(this).data('zw'));
			$(this).children(".draggable").data('zh', $(this).data('zh'));
			// copy corner object
			$(this).children(".draggable").data('corner', $(this).data('corner'));

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
				cursorAt: { left: 50, top: 50 },
				distance: 10, 
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
			
			if ($(this).children(".draggable").attr("class").indexOf("cached") >= 0) {
				// get image from cached
				var _img = new Image();
				
				if (typeof divObj.children(".draggable").data('zdx') != 'undefined') { // if image has been scaled
					var $dstCanvas = $('<canvas>');
					$dstCanvas[0].width = parseInt(divObj.css('width'), 10) + parseInt(divObj.css('border-left-width'), 10);
					$dstCanvas[0].height = parseInt(divObj.css('height'), 10) + parseInt(divObj.css('border-left-width'), 10);
					//autoClipper(divObj.children(".draggable")[0], $dstCanvas);
					autoClipper2(divObj.children(".draggable")[0], $dstCanvas, 
								divObj.children(".draggable").data('corner'), divObj);
					_img.src = $dstCanvas[0].toDataURL();
					_img.width = $dstCanvas[0].width;
					_img.height = $dstCanvas[0].height;
				}
				else {
					_img.src = imgSrc;
				}
				
				_img.onload = function() { // very important here. you need to wait for loading
					if (divObj.attr("class").indexOf("layout_circle") >= 0) {
						doClipping( 
							doMasking(_img, maskImg, divObj, ox, oy), 
							divObj, 
							cirClipper);	
					}
					else if (divObj.attr("class").indexOf("layout_square") >= 0) {
						doClipping( 
							doMasking(_img, maskImg, divObj, ox, oy), 
							divObj, 
							boxClipper);
					}
					divObj.css('opacity', '0');
				}
				
			}
			else {		// get image from original URL
			
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
								doMasking(image, maskImg, divObj, ox, oy), 
								divObj, 
								cirClipper);	
						}
						else if (divObj.attr("class").indexOf("layout_square") >= 0) {
							doClipping( 
								doMasking(image, maskImg, divObj, ox, oy), 
								divObj, 
								boxClipper);
						}
						//spinner.stop();
						//divObj.css('opacity', '0');
						divObj.animate({ opacity: 0},
							{complete:  function() { 
								spinner.stop();
							} 
						});
						
					},
					error: function(xhr, text_status){
						spinner.stop();
						console.log("Fail to get image:"+imgSrc);
					}
				});
			}
			
			$(this).children(".draggable").css('z-index','');
			$(this).removeClass("removed");	
			$(this).children(".draggable").removeClass("ui-draggable-dragging");		
			$(this).css('cursor', 'move');
			$(this).css('z-index','998');
		},
		out: function(event, ui) {
			if ($(this).children(".draggable").length > 0 ) { 
				if ($(this).children(".draggable").attr("class").indexOf("ui-draggable-dragging") >= 0)
					$(this).addClass("removed");
			}
		},
		over: function(event, ui) {
			$(this).data('zdx', $(ui.draggable).data('zdx'));
			$(this).data('zdy', $(ui.draggable).data('zdy'));
			$(this).data('zw', $(ui.draggable).data('zw'));
			$(this).data('zh', $(ui.draggable).data('zh'));
			$(this).data('corner', $(ui.draggable).data('corner'));
		},
		deactivate: function(event, ui) {
			//
			// Please considering to remove draggable inside drop: status
			// For you have got "removed" class. 
			// That should be more effective :)
			//
			if ($(this).attr("class").indexOf("removed") >= 0) {
				$(this).children(".draggable").remove();
				$(this).css('cursor', 'default');
				if ($(this).next().attr('class') == 'canvas_appended')
					if ($(this).next()[0].tagName.toLowerCase() == 'canvas'.toLowerCase()) {
						$(this).next().remove();
					}
				$(this).removeClass("removed");
				$(this).css('z-index','998');
				$('.layout_corner').animate({ opacity: CORNER_OPT},
					{complete:  function() { 
						$('.layout_corner > .draggable').parent().css('opacity', '0');
					} 
				});
			}
			$(this).removeData('zdx');
			$(this).removeData('zdy');
			$(this).removeData('zw');
			$(this).removeData('zh');
			$(this).removeData('corner');
		}
	});
}

// load phone canvas in menu
function menuLoadPhone(_phoneName) {
	PHONE_NAME = _phoneName;
	setCanvas(_phoneName);
}

// load layout in menu
function menuLoadLayout(_layoutName) {
	LAYOUT_NAME = _layoutName;
	loadLayout(maskImg, layout_ox, layout_oy, PHONE_NAME+'_'+LAYOUT_NAME);
}

// (ox, oy) is the position of case image
function loadLayout(_maskImg, ox , oy, _layoutName){ 
	console.log('layout:'+layout_x+','+layout_y);
	maskImg = _maskImg
	// Cleanup
	$('.layout_corner').remove();
	$('.canvas_appended').remove();
    $("link[type='text/css']#layout_css").remove();
    //Import CSS
    //var cssFile = $('<link rel="stylesheet" href="" type="text/css" id="layout_css">');
    //cssFile.attr({href : "css/"+_layoutName+".css?v="+(new Date()).getTime()});
    var cssFile = jQuery("<link>");
    cssFile.attr({
      rel:  "stylesheet",
      type: "text/css",
      href: "css/"+_layoutName+".css?v="+(new Date()).getTime(),
      id: "layout_css"
    });   
    $("head").append(cssFile);
	// Import layout
	$('#layout_css').load(function() {
		var layoutLocation = "js/"+_layoutName+".js?v="+(new Date()).getTime();
		$.getScript(layoutLocation)
			.done(function(data, textStatus, jqxhr) {
				setDnD(maskImg, ox, oy); // Define Drag&Drop
			})
			.fail(function(data, textStatus, jqxhr) {
				console.log('load layout.js failed');
			});
	});
}

function setContainer(){  
    var winH=$(window).height();  
    var docH=$(document).height();  
    $('#wrapper').css('height',winH-$('.recent').height()+'px');  
    //$('#wrapper').css('width',$(window).width()+'px');  
}  
  
function setFooterTop(){  
    var winH=$(window).height();   
    $('.recent').css('top',winH-$('.recent').height()+$(document).scrollTop()+'px');  
    $('.recent').css('width',$(window).width()+'px');  
	$('.ad-gallery').css('width',($(window).width()-50)+'px');
}

function setCanvas(_phoneName) {
	
	if($('#mCanvas').length > 0) {
		$('#mCanvas').remove();
	}
	
    var canvas = document.createElement('Canvas');
    canvas.setAttribute('id', 'mCanvas');
    var context = canvas.getContext('2d');
    $('.mainmenu').before(canvas);

	var winH=$(window).height();
	var winW=$(window).width(); 
    layout_oy = Math.floor(winH * 0.1);
    layout_ox = 410;
    $("#mCanvas").css('top', layout_oy+'px');
    $("#mCanvas").css('left', layout_ox+'px'); 

    var a = new Image();
	a.src = "images/"+_phoneName+".png";
	a.onload = function(){
		console.log('get image:'+a.width+', '+a.height);
		$("#mCanvas")[0].width = a.width;
        $("#mCanvas")[0].height = a.height;
        context.drawImage(a, 0, 0, a.width, a.height);
    };

	// Get mask image    
    $.getImageData({
        url: "http://insta.camangiwebstation.com/images/"+_phoneName+"_mask.png",
        server: "http://insta.camangiwebstation.com/proxy/getImageData.php",
        success: function(image){
        	// Load Layout
        	//layout_oy = parseInt($("#mCanvas").css('top'), 10);
        	//layout_ox = parseInt($("#mCanvas").css('left'), 10);
        	console.log("Get "+_phoneName+", "+layout_ox+', '+layout_oy);
            loadLayout(image, layout_ox, layout_oy, _phoneName+'_'+LAYOUT_NAME);
        },
        error: function(xhr, text_status){
            console.log("Failed to get "+_phoneName+": "+text_status);
        }
    });
}

function setAccordionMenu() {
	// Store variables		
	var accordion_head = $('.accordion > li > a'),
		accordion_body = $('.accordion li > .sub-menu');

	// Open the first tab on load

	accordion_head.first().addClass('active').next().slideDown('normal');

	// Click function

	//accordion_head.on('click', function(event) {
	accordion_head.click(function(event) {
		// Disable header links
		
		event.preventDefault();

		// Show and hide the tabs on click

		if ($(this).attr('class') != 'active'){
			accordion_body.slideUp('normal');
			$(this).next().stop(true,true).slideToggle('normal');
			accordion_head.removeClass('active');
			$(this).addClass('active');
		}
	});
}

/*
 * Load external library
 */
function loadLib(path) {
	var layoutLocation = path;
	$.getScript(layoutLocation)
		.done(function(data, textStatus, jqxhr) {
			console.log('load '+path+' OK');
		})
		.fail(function(data, textStatus, jqxhr) {
			console.log('load '+path+' failed');
		})
}

/*
 * Save to a image
 * 注意: 需要調整為高解析的圖檔
 */
function saveImg() {
	var resCanvas = document.createElement('canvas');
    var resCtx = resCanvas.getContext('2d');
	resCanvas.width = $("#mCanvas")[0].width * 0.7;
	resCanvas.height = $("#mCanvas")[0].height * 0.7;
	//resCtx.drawImage($("#mCanvas")[0], 0, 0, resCanvas.width, resCanvas.height);
	$('.canvas_appended').each(function(index) {
    	resCtx.drawImage($(this)[0], 
    					(parseInt($(this).css('left'), 10)-layout_x) * 0.7, 
    					(parseInt($(this).css('top'), 10)-layout_y) * 0.7, 
    					parseInt($(this)[0].width, 10) * 0.7,
    					parseInt($(this)[0].height, 10) * 0.7);
	});
	var img = $('<img>');
	img.attr('id', 'canvasImg');
	img.css('position', 'absolute');
	img.css('top', '80px');
	img.css('left', '800px');
	$('body').append(img);
	$('#canvasImg')[0].src = resCanvas.toDataURL();
}

/*
 * Generize random design
 */
function randomDesign() {
	// clear content
	$('.layout_corner').css('opacity', CORNER_OPT);
	$('.layout_corner').html('');
	$('.canvas_appended').remove();
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

/*
 * Initialize on DOM Ready
 */ 
$(function(){
	// For direfox, to dealing with wrong dragging position
	if (navigator.userAgent.indexOf("Firefox")!=-1) {
		$('body').css('overflow', 'auto');
	}

	loadLib('js/mapping.js?v='+(new Date()).getTime());
	loadLib('js/clipping.js?v='+(new Date()).getTime());

	setAccordionMenu();
	setContainer();
	setFooterTop();
	// Create phone case canvas and layout
	setCanvas(PHONE_NAME);
		
  $.instagramr();
});

$(window).resize(function() { setContainer();setFooterTop()}); 
$(window).scroll(function() { setFooterTop(); });

// If browser didn't support console, then set it empty !
if (!window.console) window.console = {};
if (!window.console.log) window.console.log = function () { };