/*
 * Get instagram user ID
 */
 
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
		res += "<li><a href='"+json.data[i].images.standard_resolution.url+"'><img src=\""+json.data[i].images.standard_resolution.url+"\" class='draggable'/></a></li>";
	}

	$(".ad-thumb-list").html("")
                .fadeIn(300)
                .append(res);
				
	$('.ad-gallery').adGallery({thumb_opacity: 1});
	$('.ad-gallery').css('width',($(window).width()-50)+'px');
	$('.ad-gallery').css({
		"margin": '0 auto',
	});
	
	/* 選取動畫待研究 */
	/*
	$('.draggable').mouseenter(function(){
		$(this).animate({ top: $('#recent').css('top') }, 'fast');
	}).mouseleave(function(){
	});*/
	
	$('.draggable').draggable({
		cursor: 'move', 
		helper: "clone", 
		distance: 10, 
		revert: "invalid",
		drag: function(event, ui) {
			ui.helper.css('z-index','1000');
			ui.helper.css('opacity','0.7');
			if ($(this).attr("class").indexOf("ui-draggable-dragging") >= 0) {
				$(".ui-draggable-dragging").css('z-index','1000');
			}
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
			
			// copy zoomer value
			$(this).children(".draggable").data('zdx', $(this).data('zdx'));
			$(this).children(".draggable").data('zdy', $(this).data('zdy'));
			$(this).children(".draggable").data('zw', $(this).data('zw'));
			$(this).children(".draggable").data('zh', $(this).data('zh'));

			$(this).children(".draggable").css({
				"position": "relative",
				"top": "0px",
				"left": "0px",
				"opacity": "0"
			});
			$(this).children(".draggable").draggable({
				cursor: 'auto', 
				distance: 10, 
				revert:"invalid",
				drag: function(event, ui) {
					if ($(this).attr("class").indexOf("ui-draggable-dragging") >= 0) {
						$(this).parent().css('z-index','1000');
						$(this).css("opacity", "0.7");
					}
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
					autoClipper(divObj.children(".draggable")[0], $dstCanvas);
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
						spinner.stop();
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
			$(this).css('z-index', '998');
			$(this).fadeTo('fast', 0.1);
			$(this).css('opacity', 0);
		},
		out: function(event, ui) {
			if ($(this).children(".draggable").length > 0 ) { 
				if ($(this).children(".draggable").attr("class").indexOf("ui-draggable-dragging") >= 0)
					$(this).addClass("removed");
			}
			$(this).css('z-index', '998');
			$(this).fadeTo('fast', 0.1);
		},
		over: function(event, ui) {
			$(this).css('z-index', '999');
			$(this).fadeTo('fast', 1);
			$(this).data('zdx', $(ui.draggable).data('zdx'));
			$(this).data('zdy', $(ui.draggable).data('zdy'));
			$(this).data('zw', $(ui.draggable).data('zw'));
			$(this).data('zh', $(ui.draggable).data('zh'));
		},
		deactivate: function(event, ui) {
			if ($(this).attr("class").indexOf("removed") >= 0) {
				$(this).children(".draggable").remove();
				$(this).css('cursor', 'default');
				if ($(this).next().attr('class') == '')
					if ($(this).next()[0].tagName.toLowerCase() == 'canvas'.toLowerCase()) {
						$(this).next().remove();
					}
				$(this).removeClass("removed");
				$(this).css('z-index','998');
			}
			$(this).removeData('zdx');
			$(this).removeData('zdy');
			$(this).removeData('zw');
			$(this).removeData('zh');
		}
	});
}

// (ox, oy) is the position of case image
function loadLayout(_maskImg, ox , oy){ 
	maskImg = _maskImg
    //Import CSS
	var cssLocation = "css/layout_2.css";
	$.get(cssLocation, function(css) {
   		$('<style type="text/css"></style>').html(css).appendTo("head");	
		//Import layout js
		layout_oy = oy;
		layout_ox = ox;
		var layoutLocation = "js/layout_2.js";
		$.getScript(layoutLocation)
			.done(function(data, textStatus, jqxhr) {
				setDnD(maskImg, ox, oy); // Define Drag&Drop
			})
			.fail(function(data, textStatus, jqxhr) {
				console.log('load layout.js failed');
			})
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

function setCanvas() {

	var winH=$(window).height();
	var winW=$(window).width();
    $("#mCanvas").css('top', winH * 0.1);
    $("#mCanvas").css('left', '410px');  

    var canvas = document.getElementById('mCanvas');
    var context = canvas.getContext('2d'); // 似乎不相容 IE8 
    var a = new Image();
	a.src = "images/iphone4.png";
	a.onload = function(){
        context.drawImage(a, 0, 0, 391, 657);
    };

	// Get mask image    
    $.getImageData({
        url: "http://insta.camangiwebstation.com/images/iphone4_mask.png",
        server: "http://insta.camangiwebstation.com/proxy/getImageData.php",
        success: function(image){
        	// Load Layout
        	var oy = parseInt($("#mCanvas").css('top'), 10);
        	var ox = parseInt($("#mCanvas").css('left'), 10);
            loadLayout(image, ox, oy);
            console.log("Get iphone4_mask.png");
        },
        error: function(xhr, text_status){
            console.log("Failed to get iphone4_mask.png:"+text_status);
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
 * Initialize on DOM Ready
 */ 
$(function(){

	loadLib('js/mapping.js');
	loadLib('js/clipping.js');

	setAccordionMenu();
	setContainer();
	setFooterTop();
	// Create phone case canvas and layout
	setCanvas();
		
  $.instagramr();
});

$(window).resize(function() { setContainer();setFooterTop()}); 
$(window).scroll(function() { setFooterTop(); });

// If browser didn't support console, then set it empty !
if (!window.console) window.console = {};
if (!window.console.log) window.console.log = function () { };