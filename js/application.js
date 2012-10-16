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
  };
  
})(jQuery);

//////////////////////////////////////////////////
// autoClipper
function autoClipper(srcImgDom, dstCanvas) {
	var $canvas = $('<canvas>');
	var ctx = $canvas[0].getContext('2d'); 
	$canvas[0].width = $(srcImgDom).data('zw');
	$canvas[0].height = $(srcImgDom).data('zh');
	ctx.drawImage(srcImgDom, 0, 0, $(srcImgDom).data('zw'), $(srcImgDom).data('zh')); 	
	var dstCtx = dstCanvas[0].getContext('2d');
	dstCtx.putImageData(
				ctx.getImageData($(srcImgDom).data('zdx'), $(srcImgDom).data('zdy'), dstCanvas[0].width, dstCanvas[0].height),
				0, 0);
}

//////////////////////////////////////////////////
// realClipper
function realClipper(cornerDiv, srcImg) {
var theSelection;
var canvas;
var ctx;
var iMouseX, iMouseY = 1;
var cornerX = parseFloat(cornerDiv.css('left'), 10);
var cornerY = parseFloat(cornerDiv.css('top'), 10);
var cornerW = parseFloat(cornerDiv.css('width'), 10);
var cornerH = parseFloat(cornerDiv.css('height'), 10);

var $cDiv;

	function Selection(x, y, w, h){
		this.x = x; // initial positions
		this.y = y;
		this.w = w; // and size
		this.h = h;
		this.px = x; // extra variables to dragging calculations
		this.py = y;
		this.csize = 10; // resize cubes size
		this.csizeh = 15; // resize cubes size (on hover)
		this.bHow = [false, false, false, false]; // hover statuses
		this.iCSize = [this.csize, this.csize, this.csize, this.csize]; // resize cubes sizes
		this.bDrag = [false, false, false, false]; // drag statuses
		this.bDragAll = false; // drag whole selection
		this.oImg;
	}

	Selection.prototype.draw = function(){
		ctx.drawImage(srcImg, 0, 0, srcImg.width, srcImg.height, 
					  theSelection.x,theSelection.y, 
					  theSelection.w,theSelection.h); 	
		// storing bright region
		theSelection.oImg = ctx.getImageData(cornerX, cornerY, cornerW, cornerH);   
		// covering dark region
		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.fillRect(theSelection.x,theSelection.y, 
					 theSelection.w, theSelection.h);   
		  
		// drawing stroke rect of whole image
		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 1;
		ctx.strokeRect(theSelection.x-theSelection.iCSize[0],
					   theSelection.y-theSelection.iCSize[0], 
					   theSelection.w+theSelection.iCSize[0]*2,
					   theSelection.h+theSelection.iCSize[0]*2);
		
		// resoring bright zone 
		var c1 = $('<canvas>');
		var c2 = $('<canvas>');
		c2[0].width = cornerW;
		c2[0].height = cornerH;
		c2.css('position', 'absolute');
		c2.css('z-index', '1002');
		c2.css('left', '0px');
		c2.css('top', '0px');
		var _ctx1 = c1[0].getContext('2d');
		var _ctx2 = c2[0].getContext('2d');
		_ctx1.putImageData(theSelection.oImg, 0, 0);
		if ($cDiv.attr("class").indexOf("layout_circle") >= 0) {
			cirClipper(_ctx2, c1[0], cornerW);	
		}
		else if ($cDiv.attr("class").indexOf("layout_squal") >= 0) {
			boxClipper(_ctx2, c1[0], cornerW);
		}
		$cDiv.html('');
		$cDiv.append(c2);
		
		//ctx.strokeRect(cornerX, cornerY, cornerW, cornerH);
			
		// drawing resize cubes
		ctx.fillStyle = '#fff';
		ctx.fillRect(theSelection.x - theSelection.iCSize[0]*2, 
					 theSelection.y - theSelection.iCSize[0]*2, 
					 theSelection.iCSize[0] * 2, theSelection.iCSize[0] * 2);
		ctx.fillRect(theSelection.x + theSelection.w, 
					 theSelection.y - theSelection.iCSize[1]*2, 
					 theSelection.iCSize[1] * 2, theSelection.iCSize[1] * 2);
		ctx.fillRect(theSelection.x + theSelection.w, 
					 theSelection.y + theSelection.h, 
					 theSelection.iCSize[2] * 2, theSelection.iCSize[2] * 2);
		ctx.fillRect(theSelection.x - theSelection.iCSize[3]*2, 
					 theSelection.y + theSelection.h, 
					 theSelection.iCSize[3] * 2, theSelection.iCSize[3] * 2);
	}
			
	function drawScene(){ 
	
		ctx.clearRect(-theSelection.csize/2, -theSelection.csize/2,
						ctx.canvas.width+theSelection.csize,
						ctx.canvas.height+theSelection.csize);
	
		// draw selection
		theSelection.draw();
	}
	
	$("body").append('<div class="modalOverlay"></div>');
	$wDiv = $('.modalOverlay');
	
	canvas = $('<canvas>');
	canvas[0].width =parseFloat($wDiv.css('width'), 10); 
	canvas[0].height =parseFloat($(document).height(), 10);
	canvas.css('position', 'absolute');
	canvas.css('left', '0px');
	canvas.css('top', '0px');
	canvas.css('z-index', '1001');
	$("body").append(canvas);
	
	$cDiv = cornerDiv.clone();
	$cDiv.css('z-index', '1003');
	$("body").append($cDiv);
	
	$cDiv.mousemove(eventMousemove);
    $cDiv.mousedown(eventMousedown);
    $cDiv.mouseup(eventMouseup);
	
	ctx = canvas[0].getContext('2d');
	if (typeof cornerDiv.children(".draggable").data('zdx') != 'undefined') {
		theSelection = new Selection(parseFloat(cornerDiv.css('left'), 10) - cornerDiv.children(".draggable").data('zdx'), 
									parseFloat(cornerDiv.css('top'), 10) - cornerDiv.children(".draggable").data('zdy'), 
									cornerDiv.children(".draggable").data('zw'), 
									cornerDiv.children(".draggable").data('zh')); 
	}	
	else {
		theSelection = new Selection(cornerX, cornerY, cornerW, cornerH); 
	}
	drawScene();

    canvas.mousemove(eventMousemove);
    canvas.mousedown(eventMousedown);
    canvas.mouseup(eventMouseup);
	canvas.dblclick(eventDbclick);
	
	function eventDbclick(e) {
        var canvasOffset = $(canvas).offset();
        iMouseX = Math.floor(e.pageX - canvasOffset.left);
        iMouseY = Math.floor(e.pageY - canvasOffset.top);

        if (iMouseX < theSelection.x-theSelection.csize  || 
            iMouseX > theSelection.x+theSelection.w+theSelection.csize ||
            iMouseY < theSelection.y-theSelection.csize || 
            iMouseY > theSelection.y+theSelection.h+theSelection.csize ) {

			if (cornerDiv.next()[0].tagName.toLowerCase() == 'canvas'.toLowerCase()) {
					cornerDiv.next().remove();
			}
			if (cornerDiv.attr("class").indexOf("layout_circle") >= 0) { // for circle corner
				var c = $('<canvas>');
				c[0].width = cornerW;
				c[0].height = cornerH;
				var ctx = c[0].getContext('2d');
				ctx.putImageData(theSelection.oImg, 0, 0);
				doClipping( 
					doMasking(c[0], maskImg, cornerDiv, layout_ox, layout_oy), 
					cornerDiv, 
					cirClipper);
			}
			cornerDiv.children(".draggable").data('zdx', cornerX - theSelection.x);
			cornerDiv.children(".draggable").data('zdy', cornerY - theSelection.y);
			cornerDiv.children(".draggable").data('zw', theSelection.w);
			cornerDiv.children(".draggable").data('zh', theSelection.h);
            canvas.remove(); // remove main canvas
            $wDiv.remove(); // remove block div
			$cDiv.remove(); // remove div cloned from layout
        }
    }
	
	function eventMousemove(e) { // binding mouse move event
        var canvasOffset = $(canvas).offset();
        iMouseX = Math.floor(e.pageX - canvasOffset.left);
        iMouseY = Math.floor(e.pageY - canvasOffset.top);

        // in case of drag of whole selector
        if (theSelection.bDragAll) {
            theSelection.x = iMouseX - theSelection.px;
            if (theSelection.x >= cornerX) theSelection.x = cornerX;
            if (theSelection.x+theSelection.w <= cornerX+cornerW) 
                theSelection.x = cornerX+cornerW-theSelection.w;
            theSelection.y = iMouseY - theSelection.py;
            if (theSelection.y >= cornerY) theSelection.y = cornerY;
            if (theSelection.y+theSelection.h <= cornerY+cornerH) 
                theSelection.y = cornerY+cornerH-theSelection.h;   
        }

        for (i = 0; i < 4; i++) {
            theSelection.bHow[i] = false;
            theSelection.iCSize[i] = theSelection.csize;
        }

        // hovering over resize cubes
        if (iMouseX > theSelection.x - theSelection.csizeh && iMouseX < theSelection.x + theSelection.csizeh &&
            iMouseY > theSelection.y - theSelection.csizeh && iMouseY < theSelection.y + theSelection.csizeh) {

            theSelection.bHow[0] = true;
            //theSelection.iCSize[0] = theSelection.csizeh;
        }
        if (iMouseX > theSelection.x + theSelection.w-theSelection.csizeh && iMouseX < theSelection.x + theSelection.w + theSelection.csizeh &&
            iMouseY > theSelection.y - theSelection.csizeh && iMouseY < theSelection.y + theSelection.csizeh) {

            theSelection.bHow[1] = true;
            //theSelection.iCSize[1] = theSelection.csizeh;
        }
        if (iMouseX > theSelection.x + theSelection.w-theSelection.csizeh && iMouseX < theSelection.x + theSelection.w + theSelection.csizeh &&
            iMouseY > theSelection.y + theSelection.h-theSelection.csizeh && iMouseY < theSelection.y + theSelection.h + theSelection.csizeh) {

            theSelection.bHow[2] = true;
            //theSelection.iCSize[2] = theSelection.csizeh;
        }
        if (iMouseX > theSelection.x - theSelection.csizeh && iMouseX < theSelection.x + theSelection.csizeh &&
            iMouseY > theSelection.y + theSelection.h-theSelection.csizeh && iMouseY < theSelection.y + theSelection.h + theSelection.csizeh) {

            theSelection.bHow[3] = true;
            //theSelection.iCSize[3] = theSelection.csizeh;
        }

        // in case of dragging of resize cubes
        var iFW, iFH;
        if (theSelection.bDrag[0]) {
            var iFX = iMouseX - theSelection.px;
            var iFY = iMouseY - theSelection.py;
            if (iFX > cornerX) iFX = cornerX;
            if (iFY > cornerY) iFY = cornerY;
            iFW = theSelection.w + theSelection.x - iFX;
            iFH = theSelection.h + theSelection.y - iFY;
        }
        if (theSelection.bDrag[1]) {
            var iFX = theSelection.x;
            var iFY = iMouseY - theSelection.py;
            if (iFY > cornerY) iFY = cornerY;
            iFW = iMouseX - theSelection.px - iFX;
            iFH = theSelection.h + theSelection.y - iFY;
        }
        if (theSelection.bDrag[2]) {
            var iFX = theSelection.x;
            var iFY = theSelection.y;
            iFW = iMouseX - theSelection.px - iFX;
            iFH = iMouseY - theSelection.py - iFY;
        }
        if (theSelection.bDrag[3]) {
            var iFX = iMouseX - theSelection.px;
            if (iFX > cornerX) iFX = cornerX;
            var iFY = theSelection.y;
            iFW = theSelection.w + theSelection.x - iFX;
            iFH = iMouseY - theSelection.py - iFY;
        }

        if (iFW > theSelection.csizeh * 2 && iFH > theSelection.csizeh * 2) {
            
            if (iFX+iFW >= cornerX+cornerW && iFY+iFH >= cornerY+cornerH) {
            
                if (iFW >= iFH) {
                    var r = iFW / theSelection.w;
                    theSelection.w = iFW;
                    theSelection.h = r * theSelection.h;
                }
                else {
                    var r = iFH / theSelection.h;
                    theSelection.w = r * theSelection.w;
                    theSelection.h = iFH;
                }
            }
            theSelection.x = iFX;
            theSelection.y = iFY;
        }
        drawScene();            
    }
	
	function eventMousedown(e) { // binding mousedown event
        var canvasOffset = $(canvas).offset();
        iMouseX = Math.floor(e.pageX - canvasOffset.left);
        iMouseY = Math.floor(e.pageY - canvasOffset.top);

        theSelection.px = iMouseX - theSelection.x;
        theSelection.py = iMouseY - theSelection.y;

        if (theSelection.bHow[0]) {
            theSelection.px = iMouseX - theSelection.x;
            theSelection.py = iMouseY - theSelection.y;
        }
        if (theSelection.bHow[1]) {
            theSelection.px = iMouseX - theSelection.x - theSelection.w;
            theSelection.py = iMouseY - theSelection.y;
        }
        if (theSelection.bHow[2]) {
            theSelection.px = iMouseX - theSelection.x - theSelection.w;
            theSelection.py = iMouseY - theSelection.y - theSelection.h;
        }
        if (theSelection.bHow[3]) {
            theSelection.px = iMouseX - theSelection.x;
            theSelection.py = iMouseY - theSelection.y - theSelection.h;
        }
        

        if (iMouseX > theSelection.x && iMouseX < theSelection.x+theSelection.w &&
            iMouseY > theSelection.y && iMouseY < theSelection.y+theSelection.h ) {

            theSelection.bDragAll = true;
        }

        for (i = 0; i < 4; i++) {
            if (theSelection.bHow[i]) {
                theSelection.bDrag[i] = true;
            }
        }
    }
	
	function eventMouseup(e) { // binding mouseup event
        theSelection.bDragAll = false;

        for (i = 0; i < 4; i++) {
            theSelection.bDrag[i] = false;
        }
        theSelection.px = 0;
        theSelection.py = 0;
    }
}

//////////////////////////////////////////////////

function cirClipper(ctx, img, diameter) {
    ctx.save(); 
    ctx.beginPath();
    ctx.arc(diameter/2, diameter/2, diameter/2+1, 0, Math.PI * 2, true);      
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

// No return value, just draw imgae on canvas inside div
// clipper is the function for clipping
// support circle and square box
function doClipping(srcImg, destDiv, clipper) {
    var len = parseFloat(destDiv.css('width'), 10);
	var bdr = parseFloat(destDiv.css('border-left-width'), 10);
    var destCanvas = document.createElement('canvas');
    var destCtx = destCanvas.getContext('2d');
    //destCanvas.setAttribute('style', 'position: absolute; top:0px; left:0px; opacity:0.9; -webkit-backface-visibility:hidden; z-index: 1');
    destCanvas.setAttribute('style', 'position: absolute; top:0px; left:0px; opacity:0.9; z-index:997;');
	destCanvas.style.top = parseFloat(destDiv.css('top'), 10) + bdr + 'px';
	destCanvas.style.left = parseFloat(destDiv.css('left'), 10) + bdr + 'px';
	destDiv.after(destCanvas);
    clipper(destCtx, srcImg, len);  
}

// return value: Canvas Object
// (ox, oy) is the position of case image
function doMasking(oriImg, maskImg, destDiv, ox, oy) {
/* 	console.log("m.width:"+maskImg.width);
	console.log("m.height:"+maskImg.height);
	console.log("ox:"+ox);
	console.log("oy:"+oy); */
    var b = parseFloat(destDiv.css('border-left-width'), 10);
    var x = parseFloat(destDiv.css('left'), 10) + b - ox;
    var y = parseFloat(destDiv.css('top'), 10) + b - oy;
    var w = parseFloat(destDiv.css('width'), 10);
    var h = parseFloat(destDiv.css('height'), 10);
    
    // adjust over position
    if (x+w > maskImg.width) w = maskImg.width - x;
    if (y+h > maskImg.height) y = maskImg.height - y;
    
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

////////////////////////////

// Define Drag&Drop
function setDnD(maskImg, ox, oy) {
	$( ".layout_circle" ).droppable({
		accept: ".draggable",
		drop: function( event, ui ) {
			if ($(this).next()[0].tagName.toLowerCase() == 'canvas'.toLowerCase()) {
				$(this).next().remove();
			}
			$(this).html('');
			$(this).append($(ui.draggable).clone());
			// copy zoomer value
			$(this).children(".draggable").data('zdx', $(this).data('zdx'));
			$(this).removeData('zdx');
			$(this).children(".draggable").data('zdy', $(this).data('zdy'));
			$(this).removeData('zdy');
			$(this).children(".draggable").data('zw', $(this).data('zw'));
			$(this).removeData('zw');
			$(this).children(".draggable").data('zh', $(this).data('zh'));
			$(this).removeData('zh');

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
						$(this).css("opacity", "0.9");
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
					$dstCanvas[0].width = parseFloat(divObj.css('width'), 10);
					$dstCanvas[0].height = parseFloat(divObj.css('height'), 10);
					autoClipper(divObj.children(".draggable")[0], $dstCanvas);
					_img.src = $dstCanvas[0].toDataURL();
					_img.width = $dstCanvas[0].width;
					_img.height = $dstCanvas[0].height;
				}
				else
					_img.src = imgSrc;
				
				_img.onload = function() { // very important here. you need to wait for loading
					doClipping( 
					doMasking(_img, maskImg, divObj, ox, oy), 
					divObj, 
					cirClipper);
				}
				
			}
			else {		// get image from original URL
				$.getImageData({
					url: imgSrc,
					server: "http://insta.camangiwebstation.com/proxy/getImageData.php",
					success: function(image){
						divObj.children(".draggable").attr('src', image.src);
						divObj.children(".draggable").addClass("cached");
						doClipping( 
							doMasking(image, maskImg, divObj, ox, oy), 
							divObj, 
							cirClipper);
					},
					error: function(xhr, text_status){
						console.log("Fail to get image:"+imgSrc);
					}
				});
			}
			
			$(this).children(".draggable").css('z-index','');
			$(this).removeClass("removed");	
			$(this).children(".draggable").removeClass("ui-draggable-dragging");		
			$(this).css('cursor', 'move');
		},
		out: function(event, ui) {
			if ($(this).children(".draggable").length > 0 ) { 
				if ($(this).children(".draggable").attr("class").indexOf("ui-draggable-dragging") >= 0)
					$(this).addClass("removed");
			}
		},
		over: function(event, ui) {
			// copy zoomer value
			$(this).data('zdx', $(ui.draggable).data('zdx'));
			$(this).data('zdy', $(ui.draggable).data('zdy'));
			$(this).data('zw', $(ui.draggable).data('zw'));
			$(this).data('zh', $(ui.draggable).data('zh'));
		},
		deactivate: function(event, ui) {
			if ($(this).attr("class").indexOf("removed") >= 0) {
				$(this).children(".draggable").remove();
				$(this).removeData('zdx');
				$(this).removeData('zdy');
				$(this).removeData('zw');
				$(this).removeData('zh');
				$(this).css('cursor', 'default');
				if ($(this).next().attr('class') == '')
				if ($(this).next()[0].tagName.toLowerCase() == 'canvas'.toLowerCase()) {
					$(this).next().remove();
				}
				$(this).removeClass("removed");
				$(this).css('z-index','998');
			}
		}
	});
}

// (ox, oy) is the position of case image
function loadLayout(_maskImg, ox , oy){ 
	maskImg = _maskImg
    //Import CSS
	var cssLocation = "css/layout_1.css";
	$.get(cssLocation, function(css) {
   		$('<style type="text/css"></style>').html(css).appendTo("head");	
		//Import layout js
		layout_oy = oy;
		layout_ox = ox;
		var layoutLocation = "js/layout_1.js";
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
    $("#mCanvas").css('top', winH * 0.1);
    $("#mCanvas").css('left', winH/2);     // 需要調整!!

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
$(window).scroll(function() { setFooterTop(); });

// If browser didn't support console, then set it empty !
if (!window.console) window.console = {};
if (!window.console.log) window.console.log = function () { };