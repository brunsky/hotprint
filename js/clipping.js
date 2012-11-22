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
// autoClipper2 : resize canvas according to the ration between corner
function autoClipper2(srcImgDom, dstCanvas, srcCorner, dstCorner) {
	// getting ratio from the width/height
	var r = parseInt(dstCorner.css('width'), 10) / parseInt(srcCorner.css('width'), 10);
	// store new value
	$(srcImgDom).data('zw', Math.round($(srcImgDom).data('zw') * r));
	$(srcImgDom).data('zh', Math.round($(srcImgDom).data('zh') * r));
	$(srcImgDom).data('zdx', Math.round($(srcImgDom).data('zdx') * r));
	$(srcImgDom).data('zdy', Math.round($(srcImgDom).data('zdy') * r));

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
var cornerX = parseInt(cornerDiv.css('left'), 10);
var cornerY = parseInt(cornerDiv.css('top'), 10);
var cornerW = parseInt(cornerDiv.css('width'), 10);
var cornerH = parseInt(cornerDiv.css('height'), 10);
var $cDiv;
var $wDiv;
var bdr = parseInt(cornerDiv.css('border-left-width'), 10);
var draw_w;
var draw_h;

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
		this.oImg;
	}

	Selection.prototype.draw = function(){
		if (theSelection.w >= theSelection.h) {
			draw_w = theSelection.w + bdr;
			draw_h = srcImg.height * (theSelection.w / srcImg.width) + bdr;
		}
		else {
			draw_w = srcImg.width * (theSelection.h / srcImg.height) + bdr;
			draw_h = theSelection.h + bdr;
		}
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
			$cDiv.next().remove();
		}
		$cDiv.after(c2);
			
		// drawing function cubes
		ctx.fillStyle = '#fff';

		ctx.drawImage(bMove, theSelection.x - theSelection.iCSize[0]*2, 
					 theSelection.y - theSelection.iCSize[0]*2, 
					 theSelection.iCSize[0] * 2, theSelection.iCSize[0] * 2);

		ctx.drawImage(bZoom, theSelection.x + theSelection.w + bdr*2, 
					 theSelection.y - theSelection.iCSize[1]*2, 
					 theSelection.iCSize[1] * 2, theSelection.iCSize[1] * 2);
					 
		ctx.drawImage(bSave, theSelection.x + theSelection.w+ bdr*2, 
					 theSelection.y + theSelection.h+ bdr*2, 
					 theSelection.iCSize[2] * 2, theSelection.iCSize[2] * 2);
					 
		ctx.drawImage(bRemove, theSelection.x - theSelection.iCSize[3]*2, 
					 theSelection.y + theSelection.h+ bdr*2, 
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
	canvas[0].width =parseInt($('body').css('width'), 10); 
	canvas[0].height =parseInt($(document).height(), 10);
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
		theSelection = new Selection(parseInt(cornerDiv.css('left'), 10) - cornerDiv.children(".draggable").data('zdx'), 
									parseInt(cornerDiv.css('top'), 10) - cornerDiv.children(".draggable").data('zdy'), 
									cornerDiv.children(".draggable").data('zw')-bdr, 
									cornerDiv.children(".draggable").data('zh')-bdr); 
	}	
	else {
		theSelection = new Selection(cornerX, cornerY, cornerW, cornerH); 
	}
	drawScene();

    canvas.mousemove(eventMousemove);
    canvas.mousedown(eventMousedown);
    canvas.mouseup(eventMouseup);
	canvas.dblclick(eventDbclick);
	canvas.click(eventMouseclick);
	
	function saveImg() {
		if (cornerDiv.next()[0].tagName.toLowerCase() == 'canvas'.toLowerCase()) {
			cornerDiv.next().remove();
		}
		if (cornerDiv.attr("class").indexOf("layout_circle") >= 0) { // for circle corner
			var c = $('<canvas>');
			c[0].width = cornerW + bdr;
			c[0].height = cornerH + bdr;
			var ctx = c[0].getContext('2d');
			ctx.putImageData(theSelection.oImg, 0, 0);
			doClipping( 
				doMasking(c[0], maskImg, cornerDiv, layout_ox, layout_oy), 
				cornerDiv, 
				cirClipper);
		}
		else if (cornerDiv.attr("class").indexOf("layout_square") >= 0) {
			var c = $('<canvas>');
			c[0].width = cornerW + bdr;
			c[0].height = cornerH + bdr;
			var ctx = c[0].getContext('2d');
			ctx.putImageData(theSelection.oImg, 0, 0);
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
		canvas.remove(); // remove main canvas
		$wDiv.remove(); // remove block div
		$cDiv.next().remove();
		$cDiv.remove(); // remove div cloned from layout
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
        iMouseX = Math.floor(e.pageX - canvasOffset.left);
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
        else if (iMouseX > theSelection.x + theSelection.w && iMouseX < theSelection.x + theSelection.w + theSelection.csize*2 &&
            iMouseY > theSelection.y - theSelection.csize*2 && iMouseY < theSelection.y) {
			
			$('body').css('cursor', 'sw-resize');
            theSelection.bHow[1] = true;
        }
        else if (iMouseX > theSelection.x + theSelection.w && iMouseX < theSelection.x + theSelection.w + theSelection.csize*2 &&
            iMouseY > theSelection.y + theSelection.h && iMouseY < theSelection.y + theSelection.h + theSelection.csize*2) {

			$('body').css('cursor', 'pointer');
            theSelection.bHow[2] = true;
        }
        else if (iMouseX > theSelection.x - theSelection.csize*2 && iMouseX < theSelection.x &&
            iMouseY > theSelection.y + theSelection.h&& iMouseY < theSelection.y + theSelection.h + theSelection.csize*2) {

			$('body').css('cursor', 'pointer');
            theSelection.bHow[3] = true;
        }
		else {
			$('body').css('cursor', 'default');
		}
		
		/* resize in circle way
		if (theSelection.bDrag[1]) { // in case of dragging of resize cubes
			var cx = (theSelection.x + draw_w) / 2;
			var cy = (theSelection.y + draw_h) / 2;
			var dx = iMouseX - cx;
			var dy = iMouseY - cy;
			if (dx < 0)	dx = -dx;
			if (dy < 0) dy = -dy;
			var dist = dx+dy;
			var ratio = dist / draw_w;
			var iFW = 
		}
		*/
        
        var iFW = 0, iFH = 0;
        if (theSelection.bDrag[0]) {
			// moving process has been mentioned in 'Drag All'
        }
		
        if (theSelection.bDrag[1]) { // in case of dragging of resize cubes
			$('body').css('cursor', 'sw-resize');
            var iFX = theSelection.x;
            var iFY = iMouseY - theSelection.py;
            if (iFY > cornerY) iFY = cornerY;
            iFW = iMouseX - theSelection.px - iFX;
            iFH = theSelection.h + theSelection.y - iFY;
        }

        if (iFW > theSelection.csize * 2 && iFH > theSelection.csize * 2) {
            
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
	
	function eventMouseclick(e) {
		var canvasOffset = $(canvas).offset();
        iMouseX = Math.floor(e.pageX - canvasOffset.left);
        iMouseY = Math.floor(e.pageY - canvasOffset.top);
		
		// button#3, remove
		if (iMouseX > theSelection.x - theSelection.csize*2 && iMouseX < theSelection.x + theSelection.csize*2 &&
            iMouseY > theSelection.y + theSelection.h-theSelection.csize*2 && iMouseY < theSelection.y + theSelection.h + theSelection.csize*2) {
            canvas.remove(); // remove main canvas
            $wDiv.remove(); // remove block div
			$cDiv.next().remove();
			$cDiv.remove(); // remove div cloned from layout
			
			cornerDiv.children(".draggable").remove();
			cornerDiv.removeData('zdx');
			cornerDiv.removeData('zdy');
			cornerDiv.removeData('zw');
			cornerDiv.removeData('zh');
			cornerDiv.css('cursor', 'default');
			if (cornerDiv.next().attr('class') == 'canvas_appended')
				if (cornerDiv.next()[0].tagName.toLowerCase() == 'canvas'.toLowerCase()) {
					cornerDiv.next().remove();
				}
			cornerDiv.removeClass("removed");
			cornerDiv.css('z-index','998');
        }
		// button#2, save
		if (iMouseX > theSelection.x + theSelection.w-theSelection.csize*2 && iMouseX < theSelection.x + theSelection.w + theSelection.csize*2 &&
            iMouseY > theSelection.y + theSelection.h-theSelection.csize*2 && iMouseY < theSelection.y + theSelection.h + theSelection.csize*2) {

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