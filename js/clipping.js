
//////////////////////////////////////////////////
// Image uncleared warning: original (w0, h0), sized (w1, h1) 
var IS_UNCLEAR = false;
var COUNTER_UNCLEAR = 0;
function isImageUnclear(w0, h0, w1, h1, divObj) {
	if (IS_UNCLEAR == false) {
		if ( w1 > w0 || h1 > h0 ) {
			IS_UNCLEAR = true;
			COUNTER_UNCLEAR++;
			//console.log("圖片失真, w0:"+w0+" h0:"+h0+" w1:"+w1+" h1:"+h1);
			// show warning mark over distination corner
			$warning = $("<div></div>");
			$warning.addClass("warning"+divObj.attr("id"));
			$warning.addClass("warning");
			$warning.css("position", "absolute");
			$warning.css("top", divObj.css("top"));
			$warning.css("left", divObj.css("left"));
			$warning.css("z-index", "998");
			$warning.html('<img src="../css/images/warning.png" />');
			$warning.children("img")[0].width = 32;
			$warning.children("img")[0].height = 32;
			$('body').append($warning);
			
			// show big warning if not exist
			if ($('.warning_big').length <= 0) {
				$warning_big = $("<div></div>");
				$warning.addClass("warning_big");
			}
		}
	}
	else if (IS_UNCLEAR == true) {
		if ( w1 <= w0 && h1 <= h0 ) {
			IS_UNCLEAR = false;
			//console.log("圖片已恢復正常範圍");
			removeUnclearWarning(divObj.attr("id"));
		}
	}
}

function removeUnclearWarning(id) {
	$(".warning"+id).remove();
	COUNTER_UNCLEAR--;
}

//////////////////////////////////////////////////
// autoClipper: deprecated
function autoClipper(srcImgDom, dstCanvas) {
	var $canvas = $('<canvas>');
	var ctx = $canvas[0].getContext('2d'); 
	IS_UNCLEAR = false;
	$canvas[0].width = $(srcImgDom).data('zw');
	$canvas[0].height = $(srcImgDom).data('zh');
	ctx.drawImage(srcImgDom, 0, 0, $(srcImgDom).data('zw'), $(srcImgDom).data('zh')); 	
	var dstCtx = dstCanvas[0].getContext('2d');
	dstCtx.putImageData(
				ctx.getImageData($(srcImgDom).data('zdx'), $(srcImgDom).data('zdy'), dstCanvas[0].width, dstCanvas[0].height),
				0, 0);
}

function max(a, b) {
	if(a >= b) return a;
	else return b;
}

//////////////////////////////////////////////////
// autoClipper2 : resize canvas according to the ration between corner
function autoClipper2(srcImgDom, dstCanvas, srcCorner, dstCorner) {

	// getting ratio from the width/height
	var bdr = Math.round(parseInt(dstCorner.css('border-left-width'), 10));
	var distDiv_w = Math.round(parseInt(dstCorner.css('width'), 10)) + bdr;
	var distDiv_h = Math.round(parseInt(dstCorner.css('height'), 10)) + bdr;
	var srcDiv_w = Math.round(parseInt(srcCorner.css('width'), 10)) + bdr;
	var srcDiv_h = Math.round(parseInt(srcCorner.css('height'), 10)) + bdr;
	
	var r = max(distDiv_w, distDiv_h) / max(srcDiv_w, srcDiv_h);
	// Calculate width & height after scaling
	var w = Math.round($(srcImgDom).data('zw') * r);
	var h = Math.round($(srcImgDom).data('zh') * r);
	if (w < dstCanvas[0].width) {
		w = Math.round(dstCanvas[0].width) + bdr;
		h = Math.round($(srcImgDom).data('zh') * (w/$(srcImgDom).data('zw'))) + bdr;
	}
	if (h < dstCanvas[0].height) {
		h = Math.round(dstCanvas[0].height) + bdr;
		w = Math.round($(srcImgDom).data('zw') * (h/$(srcImgDom).data('zh'))) + bdr;
	}
	
	if ($(srcImgDom).data('is_unclear') == 'true') {
		
		console.log("此圖已失真");
		IS_UNCLEAR = true;
	}
	else
		IS_UNCLEAR = false;
	// Check Image is uncleared and then show warning if any.
	var _img = new Image(); // Get original size
	_img.src = dstCorner.children(".draggable").attr('src');
	isImageUnclear(_img.width, _img.height, w, h, dstCorner);
	
	// store new value
	$(srcImgDom).data('zw', w);
	$(srcImgDom).data('zh', h);
	var zdx = Math.round($(srcImgDom).data('zdx') * r);
	var zdy = Math.round($(srcImgDom).data('zdy') * r);

	// Fix zdy & zdx
	if (h - zdy < distDiv_h)
		zdy = 0;
	if (w - zdx < distDiv_w)
		zdx = 0;
	
	$(srcImgDom).data('zdx', zdx);
	$(srcImgDom).data('zdy', zdy);

	var $canvas = $('<canvas>');
	var ctx = $canvas[0].getContext('2d'); 
	$canvas[0].width = $(srcImgDom).data('zw');
	$canvas[0].height = $(srcImgDom).data('zh');
	// Scale whole image to temp canvas at first.
	ctx.drawImage(srcImgDom, 0, 0, $(srcImgDom).data('zw'), $(srcImgDom).data('zh')); 	
	var dstCtx = dstCanvas[0].getContext('2d');
	// And then draw partial zone into destination canvas.
	dstCtx.putImageData(
				ctx.getImageData($(srcImgDom).data('zdx'), $(srcImgDom).data('zdy'), dstCanvas[0].width, dstCanvas[0].height),
				0, 0);
}

//////////////////////////////////////////////////
// realClipper

// preload images
var bMove = new Image();
bMove.src = 'css/images/move.png';
var bZoom = new Image();
bZoom.src = 'css/images/zoom.png';
var bSave = new Image();
bSave.src = 'css/images/ok.png';
var bRemove = new Image();
bRemove.src = 'css/images/del.png';

function realClipper(cornerDiv, srcImg) {
var theSelection;
var canvas;
var ctx;
var iMouseX, iMouseY = 1;
var cornerX = Math.round(parseInt(cornerDiv.css('left'), 10));
var cornerY = Math.round(parseInt(cornerDiv.css('top'), 10));
var cornerW = Math.round(parseInt(cornerDiv.css('width'), 10));
var cornerH = Math.round(parseInt(cornerDiv.css('height'), 10));
var $cDiv;
var $wDiv;
var bdr = Math.round(parseInt(cornerDiv.css('border-left-width'), 10));
var draw_w;
var draw_h;
var ori_ratio;

	function Selection(x, y, w, h){
		this.x = x; // initial positions
		this.y = y;
		this.w = w; // and size
		this.h = h;
		this.px = x; // extra variables to dragging calculations
		this.py = y;
		this.csize = 15; // resize cubes size
		this.bHow = [false, false, false, false]; // hover statuses
		this.iCSize = [this.csize, this.csize, this.csize, this.csize]; // resize cubes sizes
		this.bDrag = [false, false, false, false]; // drag statuses
		this.bDragAll = false; // drag whole selection
		this.oImg = null;
	}

	Selection.prototype.draw = function(){
		if (theSelection.w >= theSelection.h) {
			draw_w = theSelection.w + bdr;
			draw_h = Math.round(srcImg.height * (theSelection.w / srcImg.width)) + bdr;
			if (draw_h < theSelection.h) {
				draw_h = theSelection.h + bdr;
				draw_w = Math.round(srcImg.width * (draw_h / srcImg.height)) + bdr;
			}
		}
		else if (theSelection.w < theSelection.h){
			draw_w = Math.round(srcImg.width * (theSelection.h / srcImg.height)) + bdr;
			draw_h = theSelection.h + bdr;
			if (draw_w <  theSelection.w) {
				draw_w = theSelection.w + bdr;
				draw_h = Math.round(srcImg.height * (draw_w / srcImg.width)) + bdr;
			}
		}
		
		// Check Image is uncleared and then show warning if any.
		isImageUnclear(srcImg.width, srcImg.height, draw_w, draw_h, cornerDiv);

		ctx.drawImage(srcImg, 0, 0, srcImg.width, srcImg.height, 
						theSelection.x + bdr, theSelection.y + bdr, 
						draw_w, draw_h);

		// storing bright region
		theSelection.oImg = ctx.getImageData(cornerX + bdr, cornerY + bdr, cornerW + bdr, cornerH + bdr); 
		
		// covering dark region
		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.fillRect(theSelection.x + bdr, theSelection.y + bdr, 
					 draw_w, draw_h);   

		// drawing stroke rect of whole image
		ctx.strokeStyle = '#fff';
		ctx.lineWidth = bdr;
		ctx.strokeRect(theSelection.x-theSelection.iCSize[0],
					   theSelection.y-theSelection.iCSize[0], 
					   draw_w+bdr*2+theSelection.iCSize[0]*2,
					   draw_h+bdr*2+theSelection.iCSize[0]*2);

		// resoring bright zone 
		
		var c1 = $('<canvas>');
		var c2 = $('<canvas>');

		c2.attr('id', 'clipper.temp');
		c2[0].setAttribute('style', 'position: absolute; z-index:1002;');
		c2[0].style.top = cornerY + bdr + 'px';
		c2[0].style.left = cornerX + bdr + 'px';
		c2[0].width = cornerW + bdr;
		c2[0].height = cornerH + bdr;
		
		c1[0].width = cornerW + bdr;
		c1[0].height = cornerH + bdr;
		
		var _ctx1 = c1[0].getContext('2d');
		var _ctx2 = c2[0].getContext('2d');
		_ctx1.putImageData(theSelection.oImg, 0, 0);
		if ($cDiv.attr("class").indexOf("layout_circle") >= 0) {
			cirClipper(_ctx2, c1[0], cornerW);	
		}
		else if ($cDiv.attr("class").indexOf("layout_square") >= 0) {
			boxClipper(_ctx2, c1[0], cornerW, cornerH);
		}
		
		if (typeof $cDiv.next()[0] != 'undefined' && 
					$cDiv.next()[0].tagName.toLowerCase() == 'canvas'.toLowerCase()) {
			$cDiv.next()[0] = null;
			$cDiv.next().remove();
		}
		$cDiv.after(c2);
		
		// drawing function cubes
		ctx.fillStyle = '#fff';

		ctx.drawImage(bMove, theSelection.x - theSelection.iCSize[0]*2, 
					 theSelection.y - theSelection.iCSize[0]*2, 
					 theSelection.iCSize[0] * 2, theSelection.iCSize[0] * 2);

		ctx.drawImage(bZoom, theSelection.x + draw_w + bdr*2, 
					 theSelection.y - theSelection.iCSize[1]*2, 
					 theSelection.iCSize[1] * 2, theSelection.iCSize[1] * 2);
					 
		ctx.drawImage(bSave, theSelection.x + draw_w+ bdr*2, 
					 theSelection.y + draw_h+ bdr*2, 
					 theSelection.iCSize[2] * 2, theSelection.iCSize[2] * 2);
					 
		ctx.drawImage(bRemove, theSelection.x - theSelection.iCSize[3]*2, 
					 theSelection.y + draw_h+ bdr*2, 
					 theSelection.iCSize[3] * 2, theSelection.iCSize[3] * 2);
	
	}
			
	function drawScene(){ 

		ctx.clearRect(-theSelection.csize/2, -theSelection.csize/2,
						ctx.canvas.width+theSelection.csize,
						ctx.canvas.height+theSelection.csize);

		// draw selection
		theSelection.draw();
	}
	
	if (cornerDiv.children(".draggable").data('is_unclear') == 'true') {
		console.log("此圖已失真");
		IS_UNCLEAR = true;
	}
	else
		IS_UNCLEAR = false;
	
	$("body").append('<div class="modalOverlay"></div>');
	$wDiv = $('.modalOverlay');
	canvas = $('<canvas>');
	canvas[0].width = Math.round(parseInt($('body').css('width'), 10)); 
	canvas[0].height = Math.round(parseInt($(document).height(), 10));
	canvas.css('position', 'absolute');
	canvas.css('left', '0px');
	canvas.css('top', '0px');
	canvas.css('z-index', '1001');
	$("body").append(canvas);
	
	$cDiv = cornerDiv.clone();
	$cDiv.css('z-index', '1003');
	$cDiv.css('opacity', 1);
	$("body").append($cDiv);
	
	$cDiv.mousemove(eventMousemove);
    $cDiv.mousedown(eventMousedown);
    $cDiv.mouseup(eventMouseup);
	
	ctx = canvas[0].getContext('2d');
	if (typeof cornerDiv.children(".draggable").data('zdx') != 'undefined') {
		theSelection = new Selection(Math.round(parseInt(cornerDiv.css('left'), 10)) - cornerDiv.children(".draggable").data('zdx'), 
									Math.round(parseInt(cornerDiv.css('top'), 10)) - cornerDiv.children(".draggable").data('zdy'), 
									cornerDiv.children(".draggable").data('zw')-bdr, 
									cornerDiv.children(".draggable").data('zh')-bdr); 
	}	
	else {
		
		// Try to center corner when create clipping at fitsr time
		var _w, _h, _x, _y;
		if (cornerW >= cornerH) {
			_w = cornerW;
			_h = Math.round(srcImg.height * (cornerW / srcImg.width));
			if (_h < cornerH) {
				_h = cornerH;
				_w = Math.round(srcImg.width * (cornerH / srcImg.height));
			}
		}
		else if (cornerW < cornerH){
			_w = Math.round(srcImg.width * (cornerH / srcImg.height));
			_h = cornerH;
			if (_w <  cornerW) {
				_w = cornerW;
				_h = Math.round(srcImg.height * (_w / srcImg.width));
			}
		}
		if (_w > _h) {
			_x = cornerX - Math.round((_w - cornerW)/2);
			_y = cornerY;
		}
		else if(_h > _w) {
			_x = cornerX;
			_y = cornerY - Math.round((_h - cornerH)/2);
		}
		else {
			_x = cornerX;
			_y = cornerY;
		}
		
		theSelection = new Selection(_x, _y, _w, _h); 
	}
	drawScene();

    canvas.mousemove(eventMousemove);
    canvas.mousedown(eventMousedown);
    canvas.mouseup(eventMouseup);
	canvas.dblclick(eventDbclick);
	canvas.click(eventMouseclick);
	
	function saveImg() {
		
		if (cornerDiv.next()[0].tagName.toLowerCase() == 'canvas'.toLowerCase()) {
			cornerDiv.next()[0] = null;
			cornerDiv.next().remove();
		}
		if (cornerDiv.attr("class").indexOf("layout_circle") >= 0) { // for circle corner
			var c = $('<canvas>');
			c[0].width = cornerW + bdr;
			c[0].height = cornerH + bdr;
			var _ctx = c[0].getContext('2d');
			_ctx.putImageData(theSelection.oImg, 0, 0);
			doClipping( 
				doMasking(c[0], maskImg, cornerDiv, layout_ox, layout_oy), 
				cornerDiv, 
				cirClipper);
		}
		else if (cornerDiv.attr("class").indexOf("layout_square") >= 0) {
			var c = $('<canvas>');
			c[0].width = cornerW + bdr;
			c[0].height = cornerH + bdr;
			var _ctx = c[0].getContext('2d');
			_ctx.putImageData(theSelection.oImg, 0, 0);
			doClipping( 
				doMasking(c[0], maskImg, cornerDiv, layout_ox, layout_oy), 
				cornerDiv, 
				boxClipper);
		}
		// once mouse enter canvas, lower all the other corner div & higher itself
		cornerDiv.next().mouseenter(function() {
			$('.layout_corner').css('z-index', '996');
			$(this).prev().css('z-index', '998');
		});
		cornerDiv.children(".draggable").data('zdx', cornerX - theSelection.x);
		cornerDiv.children(".draggable").data('zdy', cornerY - theSelection.y);
		cornerDiv.children(".draggable").data('zw', draw_w);
		cornerDiv.children(".draggable").data('zh', draw_h);
		
		canvas.unbind();
		$cDiv.unbind();
		
		canvas.remove(); // remove main canvas
		canvas[0] = null;
		$wDiv.remove(); // remove block div
		$wDiv[0] = null;
		$cDiv.next().remove();
		$cDiv.next()[0] = null;
		$cDiv.remove(); // remove div cloned from layout
		$cDiv[0] = null;
		
		$('body').css('cursor', 'default');
	}
	
	function eventDbclick(e) {
        var canvasOffset = $(canvas).offset();
        iMouseX = Math.floor(e.pageX - canvasOffset.left);
        iMouseY = Math.floor(e.pageY - canvasOffset.top);

        if (iMouseX < theSelection.x-theSelection.csize  || 
            iMouseX > theSelection.x+theSelection.w+theSelection.csize ||
            iMouseY < theSelection.y-theSelection.csize || 
            iMouseY > theSelection.y+theSelection.h+theSelection.csize ) {

			saveImg();
        }
    }
	
	function eventMousemove(e) { // binding mouse move event
        var canvasOffset = $(canvas).offset();
        iMouseX = Math.floor(e.pageX - canvasOffset.left); // relative to canvas
        iMouseY = Math.floor(e.pageY - canvasOffset.top);

        // in case of drag of whole selector
        if (theSelection.bDragAll || theSelection.bDrag[0]) {
			$('body').css('cursor', 'move');
            theSelection.x = iMouseX - theSelection.px;
            if (theSelection.x >= cornerX) {	
				theSelection.x = cornerX;
			}
            if (theSelection.x+draw_w <= cornerX+cornerW+bdr+bdr) {
                theSelection.x = cornerX+cornerW+bdr-draw_w;
			}
				
            theSelection.y = iMouseY - theSelection.py;
            if (theSelection.y >= cornerY) {
				theSelection.y = cornerY;
			}
            if (theSelection.y+draw_h <= cornerY+cornerH+bdr+bdr) {
                theSelection.y = cornerY+cornerH+bdr-draw_h;   
			}
        }
		
        for (i = 0; i < 4; i++) {
            theSelection.bHow[i] = false;
            theSelection.iCSize[i] = theSelection.csize;
        }

        // hovering over resize cubes
        if (iMouseX > theSelection.x - theSelection.csize*2 && iMouseX < theSelection.x &&
            iMouseY > theSelection.y - theSelection.csize*2 && iMouseY < theSelection.y) {
			
			$('body').css('cursor', 'move');
            theSelection.bHow[0] = true;
        }
        else if (iMouseX > theSelection.x + draw_w && iMouseX < theSelection.x + draw_w + theSelection.csize*2 &&
            iMouseY > theSelection.y - theSelection.csize*2 && iMouseY < theSelection.y) {
			
			$('body').css('cursor', 'sw-resize');
            theSelection.bHow[1] = true;
        }
        else if (iMouseX > theSelection.x + draw_w && iMouseX < theSelection.x + draw_w + theSelection.csize*2 &&
            iMouseY > theSelection.y + draw_h && iMouseY < theSelection.y + draw_h + theSelection.csize*2) {

			$('body').css('cursor', 'pointer');
            theSelection.bHow[2] = true;
        }
        else if (iMouseX > theSelection.x - theSelection.csize*2 && iMouseX < theSelection.x &&
            iMouseY > theSelection.y + draw_h && iMouseY < theSelection.y + draw_h + theSelection.csize*2) {

			$('body').css('cursor', 'pointer');
            theSelection.bHow[3] = true;
        }
		else {
			$('body').css('cursor', 'default');
		}
		
		/*
        if (theSelection.bDrag[0]) {
			// moving process has been mentioned in 'Drag All'
        }*/
        
		// resize in circle way
		if (theSelection.bDrag[1]) { // in case of dragging of resize cubes
			$('body').css('cursor', 'sw-resize');
			var cx = theSelection.x + draw_w/2;
			var cy = theSelection.y + draw_h/2;
			var dx = iMouseX - cx;
			var dy = iMouseY - cy;
			if (dx < 0)	dx = - dx;
			if (dy < 0) dy = - dy;
			var dist = dx+dy;
			var ratio = dist / (draw_w + draw_h);
			ratio = ratio / ori_ratio;
			var iFW = Math.round(draw_w * ratio);
			var iFH = Math.round(draw_h * ratio);
			var iFX = Math.round(cx - iFW/2);
			var iFY = Math.round(cy - iFH/2);
			
			if (iFW < cornerW)
				theSelection.w = cornerW;
			else
				theSelection.w = iFW;
			if (iFH < cornerH)
				theSelection.h = cornerH;
			else
				theSelection.h = iFH;
			if (iFX > cornerX) {
				theSelection.x = cornerX;
			}
			else {
				if(iFX+iFW < cornerX+cornerW) {
					theSelection.x = cornerX + cornerW - iFW;
				}
				else {
					theSelection.x = iFX;
				}
			}
			if (iFY > cornerY)
				theSelection.y = cornerY;
			else {
				if(iFY+iFH < cornerY+cornerH)
					theSelection.y = cornerY + cornerH - iFH;
				else
					theSelection.y = iFY;
			}
		}
        drawScene();            
    }
	
	function eventMouseclick(e) {
		var canvasOffset = $(canvas).offset();
        iMouseX = Math.floor(e.pageX - canvasOffset.left);
        iMouseY = Math.floor(e.pageY - canvasOffset.top);
		
		// button#3, remove
		if (iMouseX > theSelection.x - theSelection.csize*2 && iMouseX < theSelection.x + theSelection.csize*2 &&
            iMouseY > theSelection.y + draw_h-theSelection.csize*2 && iMouseY < theSelection.y + draw_h + theSelection.csize*2) {
            
            canvas.unbind();
			$cDiv.unbind();
            
            canvas.remove(); // remove main canvas
            canvas[0] = null;
            $wDiv.remove(); // remove block div
            $wDiv[0] = null;
			$cDiv.next().remove();
			$cDiv.next()[0] = null;
			$cDiv.remove(); // remove div cloned from layout
			$cDiv[0] = null;
			
			cornerDiv.children(".draggable").each(function(index) {
			  	$(this)[0] = null;
			  	$(this).remove();
			});
			cornerDiv.removeData('zdx');
			cornerDiv.removeData('zdy');
			cornerDiv.removeData('zw');
			cornerDiv.removeData('zh');
			cornerDiv.css('cursor', 'default');
			if (cornerDiv.next().attr('class') == 'canvas_appended')
				if (cornerDiv.next()[0].tagName.toLowerCase() == 'canvas'.toLowerCase()) {
					cornerDiv.next()[0] = null;
					cornerDiv.next().remove();
				}
			cornerDiv.removeClass("removed");
			cornerDiv.css('z-index','998');
        }
		// button#2, save
		if (iMouseX > theSelection.x + draw_w-theSelection.csize*2 && iMouseX < theSelection.x + draw_w + theSelection.csize*2 &&
            iMouseY > theSelection.y + draw_h-theSelection.csize*2 && iMouseY < theSelection.y + draw_h + theSelection.csize*2) {

            saveImg();
        }
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
            
            // calculate original ratio
            var cx = theSelection.x + draw_w/2;
			var cy = theSelection.y + draw_h/2;
			var dx = iMouseX - cx;
			var dy = iMouseY - cy;
			if (dx < 0)	dx = -dx;
			if (dy < 0) dy = -dy;
			var dist = dx+dy;
			ori_ratio = dist / (draw_w+draw_h);
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
		$('body').css('cursor', 'default');
        for (i = 0; i < 4; i++) {
            theSelection.bDrag[i] = false;
        }
        theSelection.px = 0;
        theSelection.py = 0;
    }
}

function autoCentered(cornerDiv, srcImg) {
var theSelection;
var canvas;
var ctx;
var cornerX = Math.round(parseInt(cornerDiv.css('left'), 10));
var cornerY = Math.round(parseInt(cornerDiv.css('top'), 10));
var cornerW = Math.round(parseInt(cornerDiv.css('width'), 10));
var cornerH = Math.round(parseInt(cornerDiv.css('height'), 10));
var $cDiv;
var $wDiv;
var bdr = Math.round(parseInt(cornerDiv.css('border-left-width'), 10));
var draw_w;
var draw_h;
var ori_ratio;

	function Selection(x, y, w, h){
		this.x = x; // initial positions
		this.y = y;
		this.w = w; // and size
		this.h = h;
		this.px = x; // extra variables to dragging calculations
		this.py = y;
		this.csize = 15; // resize cubes size
		this.bHow = [false, false, false, false]; // hover statuses
		this.iCSize = [this.csize, this.csize, this.csize, this.csize]; // resize cubes sizes
		this.bDrag = [false, false, false, false]; // drag statuses
		this.bDragAll = false; // drag whole selection
		this.oImg = null;
	}

	Selection.prototype.draw = function(){
		if (theSelection.w >= theSelection.h) {
			draw_w = theSelection.w + bdr;
			draw_h = Math.round(srcImg.height * (theSelection.w / srcImg.width)) + bdr;
			if (draw_h < theSelection.h) {
				draw_h = theSelection.h + bdr;
				draw_w = Math.round(srcImg.width * (draw_h / srcImg.height)) + bdr;
			}
		}
		else if (theSelection.w < theSelection.h){
			draw_w = Math.round(srcImg.width * (theSelection.h / srcImg.height)) + bdr;
			draw_h = theSelection.h + bdr;
			if (draw_w <  theSelection.w) {
				draw_w = theSelection.w + bdr;
				draw_h = Math.round(srcImg.height * (draw_w / srcImg.width)) + bdr;
			}
		}
		
		// Check Image is uncleared and then show warning if any.
		isImageUnclear(srcImg.width, srcImg.height, draw_w, draw_h, cornerDiv);

		ctx.drawImage(srcImg, 0, 0, srcImg.width, srcImg.height, 
						theSelection.x + bdr, theSelection.y + bdr, 
						draw_w, draw_h);

		// storing bright region
		theSelection.oImg = ctx.getImageData(cornerX + bdr, cornerY + bdr, cornerW + bdr, cornerH + bdr); 
		
		// covering dark region
		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.fillRect(theSelection.x + bdr, theSelection.y + bdr, 
					 draw_w, draw_h);   

		// drawing stroke rect of whole image
		ctx.strokeStyle = '#fff';
		ctx.lineWidth = bdr;
		ctx.strokeRect(theSelection.x-theSelection.iCSize[0],
					   theSelection.y-theSelection.iCSize[0], 
					   draw_w+bdr*2+theSelection.iCSize[0]*2,
					   draw_h+bdr*2+theSelection.iCSize[0]*2);

		// resoring bright zone 
		
		var c1 = $('<canvas>');
		var c2 = $('<canvas>');

		c2.attr('id', 'clipper.temp');
		c2[0].setAttribute('style', 'position: absolute; z-index:1002;');
		c2[0].style.top = cornerY + bdr + 'px';
		c2[0].style.left = cornerX + bdr + 'px';
		c2[0].width = cornerW + bdr;
		c2[0].height = cornerH + bdr;
		
		c1[0].width = cornerW + bdr;
		c1[0].height = cornerH + bdr;
		
		var _ctx1 = c1[0].getContext('2d');
		var _ctx2 = c2[0].getContext('2d');
		_ctx1.putImageData(theSelection.oImg, 0, 0);
		if ($cDiv.attr("class").indexOf("layout_circle") >= 0) {
			cirClipper(_ctx2, c1[0], cornerW);	
		}
		else if ($cDiv.attr("class").indexOf("layout_square") >= 0) {
			boxClipper(_ctx2, c1[0], cornerW, cornerH);
		}
		
		if (typeof $cDiv.next()[0] != 'undefined' && 
					$cDiv.next()[0].tagName.toLowerCase() == 'canvas'.toLowerCase()) {
			$cDiv.next()[0] = null;
			$cDiv.next().remove();
		}
		$cDiv.after(c2);
	
	}
			
	function drawScene(){ 

		ctx.clearRect(-theSelection.csize/2, -theSelection.csize/2,
						ctx.canvas.width+theSelection.csize,
						ctx.canvas.height+theSelection.csize);

		// draw selection
		theSelection.draw();
	}
	
	function saveImg() {
		
		if (cornerDiv.next()[0].tagName.toLowerCase() == 'canvas'.toLowerCase()) {
			cornerDiv.next()[0] = null;
			cornerDiv.next().remove();
		}
		if (cornerDiv.attr("class").indexOf("layout_circle") >= 0) { // for circle corner
			var c = $('<canvas>');
			c[0].width = cornerW + bdr;
			c[0].height = cornerH + bdr;
			var _ctx = c[0].getContext('2d');
			_ctx.putImageData(theSelection.oImg, 0, 0);
			doClipping( 
				doMasking(c[0], maskImg, cornerDiv, layout_ox, layout_oy), 
				cornerDiv, 
				cirClipper);
		}
		else if (cornerDiv.attr("class").indexOf("layout_square") >= 0) {
			var c = $('<canvas>');
			c[0].width = cornerW + bdr;
			c[0].height = cornerH + bdr;
			var _ctx = c[0].getContext('2d');
			_ctx.putImageData(theSelection.oImg, 0, 0);
			doClipping( 
				doMasking(c[0], maskImg, cornerDiv, layout_ox, layout_oy), 
				cornerDiv, 
				boxClipper);
		}
		// once mouse enter canvas, lower all the other corner div & higher itself
		cornerDiv.next().mouseenter(function() {
			$('.layout_corner').css('z-index', '996');
			$(this).prev().css('z-index', '998');
		});
		cornerDiv.children(".draggable").data('zdx', cornerX - theSelection.x);
		cornerDiv.children(".draggable").data('zdy', cornerY - theSelection.y);
		cornerDiv.children(".draggable").data('zw', draw_w);
		cornerDiv.children(".draggable").data('zh', draw_h);
		
		canvas.unbind();
		$cDiv.unbind();
		
		canvas.remove(); // remove main canvas
		canvas[0] = null;
		$wDiv.remove(); // remove block div
		$wDiv[0] = null;
		$cDiv.next().remove();
		$cDiv.next()[0] = null;
		$cDiv.remove(); // remove div cloned from layout
		$cDiv[0] = null;
		
		$('body').css('cursor', 'default');
	}
	
	if (cornerDiv.children(".draggable").data('is_unclear') == 'true') {
		console.log("此圖已失真");
		IS_UNCLEAR = true;
	}
	else
		IS_UNCLEAR = false;
	
	$("body").append('<div class="modalOverlay"></div>');
	$wDiv = $('.modalOverlay');
	canvas = $('<canvas>');
	canvas[0].width = Math.round(parseInt($('body').css('width'), 10)); 
	canvas[0].height = Math.round(parseInt($(document).height(), 10));
	canvas.css('position', 'absolute');
	canvas.css('left', '0px');
	canvas.css('top', '0px');
	canvas.css('z-index', '1001');
	$("body").append(canvas);
	
	$cDiv = cornerDiv.clone();
	$cDiv.css('z-index', '1003');
	$cDiv.css('opacity', 1);
	$("body").append($cDiv);
	
	ctx = canvas[0].getContext('2d');
	if (typeof cornerDiv.children(".draggable").data('zdx') != 'undefined') {
		theSelection = new Selection(Math.round(parseInt(cornerDiv.css('left'), 10)) - cornerDiv.children(".draggable").data('zdx'), 
									Math.round(parseInt(cornerDiv.css('top'), 10)) - cornerDiv.children(".draggable").data('zdy'), 
									cornerDiv.children(".draggable").data('zw')-bdr, 
									cornerDiv.children(".draggable").data('zh')-bdr); 
	}	
	else {
		
		// Try to center corner when create clipping at fitsr time
		var _w, _h, _x, _y;
		if (cornerW >= cornerH) {
			_w = cornerW;
			_h = Math.round(srcImg.height * (cornerW / srcImg.width));
			if (_h < cornerH) {
				_h = cornerH;
				_w = Math.round(srcImg.width * (cornerH / srcImg.height));
			}
		}
		else if (cornerW < cornerH){
			_w = Math.round(srcImg.width * (cornerH / srcImg.height));
			_h = cornerH;
			if (_w <  cornerW) {
				_w = cornerW;
				_h = Math.round(srcImg.height * (_w / srcImg.width));
			}
		}
		if (_w > _h) {
			_x = cornerX - Math.round((_w - cornerW)/2);
			_y = cornerY;
		}
		else if(_h > _w) {
			_x = cornerX;
			_y = cornerY - Math.round((_h - cornerH)/2);
		}
		else {
			if (cornerW > cornerH) {
				_x = cornerX;
				_y = cornerY - Math.round((_h - cornerH)/2);
			}
			else if (cornerW < cornerH) {
				_x = cornerX - Math.round((_w - cornerW)/2);
				_y = cornerY;
			}
			else {
				_x = cornerX;
				_y = cornerY;
			}
		}
		
		theSelection = new Selection(_x, _y, _w, _h); 
	}
	
	drawScene();
	
	saveImg();
}