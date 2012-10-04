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
        access_token: access_token
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
		res += "<li><a href='"+json.data[i].images.standard_resolution.url+"'><img src=\""+json.data[i].images.thumbnail.url+"\" class='draggable'/></a></li>";
	}

	$(".ad-thumb-list").html("")
                .fadeIn(300)
                .append(res);
				
	$('.ad-gallery').adGallery({thumb_opacity: 1});
	$('.ad-gallery').css('width',($(window).width()-50)+'px');
	$('.ad-gallery').css({
		"margin": '0 auto',
	});
	
	$('.draggable').draggable({
		cursor: 'move', 
		helper: "clone", 
		distance: 10, 
		revert: "invalid",
		drag: function(event, ui) {
			ui.helper.css('z-index','1000');
			if ($(this).attr("class").indexOf("ui-draggable-dragging") >= 0) {
				$(".ui-draggable-dragging").css('z-index','1000');
			}
		}
	});
	/*
	$( ".landing" ).droppable({
		accept: ".draggable",
		drop: function( event, ui ) {
			$(this).html('');
			$(this).append($(ui.draggable).clone());
			$(this).children(".draggable").css({
				"position": "relative",
				"top": "0px",
				"left": "0px"
			});
			$(this).children(".draggable").draggable({
				cursor: 'auto', 
				distance: 10, 
				revert:"invalid",
				drag: function(event, ui) {
					if ($(this).attr("class").indexOf("ui-draggable-dragging") >= 0) {
						$(".ui-draggable-dragging").css('z-index','1000');
					}
				}
			});
			$(this).children(".draggable").css('z-index','');
			$(this).removeClass("removed");	
			$(this).children(".draggable").removeClass("ui-draggable-dragging");		
			$('.landing').css('cursor', 'move');
		},
		out: function(event, ui) {
			if($(this).children(".draggable").css('left') != "0px" && 
				$(this).children(".draggable").css('top') != "0px") {
				$(this).addClass("removed");
			}
		},
		deactivate: function(event, ui) {
			if ($(this).attr("class").indexOf("removed") >= 0) {
				$(this).children(".draggable").remove();
				$(this).css('cursor', 'default');
				$(this).html('<p>Drag Here!</p>');
			}
		}
	});
	*/
  };
  
})(jQuery);

//////////////////////////////////////////////////

function cirClipper(ctx, img, diameter) {
    ctx.save(); 
    ctx.beginPath();
    ctx.arc(diameter/2, diameter/2, diameter/2, 0, Math.PI * 2, true);      
    ctx.clip();  
    ctx.globalAlpha = 0.9;        
    ctx.drawImage(img, 0, 0);
    ctx.restore();
}

function boxClipper(ctx, img, length) {
    ctx.save(); 
    ctx.beginPath();
    ctx.rect(0, 0, length, length);      
    ctx.clip();  
    ctx.globalAlpha = 0.9;       
    ctx.drawImage(img, 0, 0);
    ctx.restore();
}

// return value: Canvas Object
// (ox, oy) is the position of case image
function doMasking(oriImg, maskImg, destDiv, ox, oy) {
	console.log("m.width:"+maskImg.width);
	console.log("m.height:"+maskImg.height);
	console.log("ox:"+ox);
	console.log("oy:"+oy);
    var b = parseFloat(destDiv.css('border-left-width'), 10);
    var x = parseFloat(destDiv.css('left'), 10) + b - ox;
    var y = parseFloat(destDiv.css('top'), 10) + b - oy;
    var w = parseFloat(destDiv.css('width'), 10);
    var h = parseFloat(destDiv.css('height'), 10);
    console.log("before adjust, x:"+x+", before y:"+y);
    
    // adjust over position
    if (x+w > maskImg.width) w = maskImg.width - x;
    if (y+h > maskImg.height) y = maskImg.height - y;
    console.log("x:"+x+", y:"+y+", w:"+w+", h:"+h);
    
    // reposition mask image
    var adjustMaskCanvas = document.createElement('canvas');
    var adjustMaskCtx = adjustMaskCanvas.getContext('2d');                        
    adjustMaskCtx.drawImage(maskImg, x, y, w, h, 0, 0, w, h); 
    
    // resize origin image
    var resizeCanvas = document.createElement('canvas');
    var resizeCtx = resizeCanvas.getContext('2d');
    resizeCtx.drawImage(oriImg, 0, 0, w, h);
	
    var resCanvas = document.createElement('canvas');
    var resCtx = resCanvas.getContext('2d');
    resCtx.putImageData(applyCanvasMask(resizeCanvas, adjustMaskCanvas, maskImg.width, maskImg.height), 0, 0);
    return resCanvas;
}

// No return value, just draw imgae on canvas inside div
// clipper is the function for clipping
// support circle and square box
function doClipping(srcImg, destDiv, clipper) {
    var len = parseFloat(destDiv.css('width'), 10);
    var destCanvas = document.createElement('canvas');
    var destCtx = destCanvas.getContext('2d');
    destCanvas.setAttribute('style', 'position: absolute; top:0px; left:0px; opacity:0.9; -webkit-backface-visibility:hidden');
    //destCanvas.setAttribute('style', 'position: absolute; top:0px; left:0px; opacity:0.9; z-index:998;');
	destDiv.append(destCanvas);
    clipper(destCtx, srcImg, len);  
}

////////////////////////////
// (ox, oy) is the position of case image
function loadLayout(maskImg, ox , oy){
    //Create DIV 
    //var destDiv = document.createElement('div');
    $destDiv = $(document.createElement('div'));
    $destDiv.attr('id', 'corner1');
    $destDiv.attr('class', 'layout_circle');
    $("#mCanvas").after($destDiv);    
    $destDiv.corner("999px");
    
    //Import CSS
	var cssLocation = "css/layout.css";
	$.get(cssLocation, function(css) {
   		$('<style type="text/css"></style>')
      		.html(css)
      		.appendTo("head");
	});
	
	// Adjust position according to mCanvas
	var _x = parseFloat($destDiv.css('top'), 10);
	var _y = parseFloat($destDiv.css('left'), 10);
	$destDiv.css('top', _y+oy+'px');
	$destDiv.css('left', _x+ox+'px');

    // Define Drag&Drop
    $( ".layout_circle" ).droppable({
		accept: ".draggable",
		drop: function( event, ui ) {
			$(this).html('');
			$(this).append($(ui.draggable).clone());
			$(this).children(".draggable").css({
				"position": "relative",
				"top": "0px",
				"left": "0px",
				"opacity": "0.0"
			});
			$(this).children(".draggable").draggable({
				cursor: 'auto', 
				distance: 10, 
				revert:"invalid",
				drag: function(event, ui) {
					if ($(this).attr("class").indexOf("ui-draggable-dragging") >= 0) {
						$(".ui-draggable-dragging").css('z-index','1000');
					}
				}
			});
			
			var imgSrc = $(this).children(".draggable").attr('src');
			var divObj = $(this);
			
			$.getImageData({
        		url: imgSrc,
        		server: "http://insta.camangiwebstation.com/proxy/getImageData.php",
        		success: function(image){
        			 /*
        			 // for testing
        			 var _img = doMasking(image, maskImg, divObj, ox, oy);

        			var adjustMaskCanvas = document.createElement('canvas');
    				var adjustMaskCtx = adjustMaskCanvas.getContext('2d'); 
    				adjustMaskCanvas.setAttribute('style', 'position: absolute; top:0px; left:0px; opacity:0.9; z-index:998');                       
    				adjustMaskCtx.drawImage(_img, 0, 0);
    				divObj.append(adjustMaskCanvas);
    				*/
            		doClipping( 
            			doMasking(image, maskImg, divObj, ox, oy), 
            			divObj, 
            			cirClipper);
            		
            		console.log("Get image:"+imgSrc);
        		},
        		error: function(xhr, text_status){
            		console.log("Fail to get image:"+imgSrc);
        		}
    		});
			
			$(this).children(".draggable").css('z-index','');
			$(this).removeClass("removed");	
			$(this).children(".draggable").removeClass("ui-draggable-dragging");		
			$('.landing').css('cursor', 'move');
		},
		out: function(event, ui) {
			if($(this).children(".draggable").css('left') != "0px" && 
				$(this).children(".draggable").css('top') != "0px") {
				$(this).addClass("removed");
			}
		},
		deactivate: function(event, ui) {
			if ($(this).attr("class").indexOf("removed") >= 0) {
				$(this).children(".draggable").remove();
				$(this).css('cursor', 'default');
			}
		}
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
    var docH=$(document).height();  
    $('.recent').css('top',winH-$('.recent').height()+'px');  
    $('.recent').css('width',$(window).width()+'px');  
	$('.ad-gallery').css('width',($(window).width()-50)+'px');
}

function setCanvas() {

	var winH=$(window).height();  
    var docH=$(document).height();
    $("#mCanvas").css('top', winH * 0.1);
    $("#mCanvas").css('left', docH/2);  

    var canvas = document.getElementById('mCanvas');
    var context = canvas.getContext('2d');
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
        	var oy = parseFloat($("#mCanvas").css('top'), 10);
        	var ox = parseFloat($("#mCanvas").css('left'), 10);
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
 * Initialize on DOM Ready
 */ 
$(function(){

	setAccordionMenu();
	setContainer();
	setFooterTop();
	// Create phone case canvas and layout
	setCanvas();
	
	
  $.instagramr();
});

$(window).resize(function() { setContainer();setFooterTop(); }); 