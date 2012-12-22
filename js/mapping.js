// Text Mapping Library
//
//
function cirClipper(ctx, img, diameter, reserved) {
    ctx.save(); 
    ctx.beginPath(); 
	$.browser.chrome = /chrome/.test(navigator.userAgent.toLowerCase()); 
	if ($.browser.chrome) { // Considering Chrome for aliasing issue
		ctx.drawImage(img, 0, 0);
		ctx.restore();
		ctx.save(); 
		ctx.beginPath();
		ctx.globalCompositeOperation = 'destination-in';
		ctx.arc(diameter/2, diameter/2, diameter/2, 0, Math.PI * 2, true); 
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fill();
	}   
	else {
		ctx.arc(diameter/2, diameter/2, diameter/2, 0, Math.PI * 2, true); 
		ctx.clip();      
		ctx.drawImage(img, 0, 0);		
	}
    ctx.restore();
}

function boxClipper(ctx, img, width, height) {
    ctx.save(); 
    ctx.beginPath();
	ctx.rect(0, 0, width, height); 
    ctx.clip();        
    ctx.drawImage(img, 0, 0);
    ctx.restore();
}

// No return value, just draw imgae on canvas inside div
// clipper is the function for clipping
// support circle and square box
function doClipping(srcImg, destDiv, clipper) {
	var bdr = Math.round(parseInt(destDiv.css('border-left-width'), 10));
	var width = Math.round(parseInt(destDiv.css('width'), 10)) + bdr;
	var height = Math.round(parseInt(destDiv.css('height'), 10)) + bdr;
    var destCanvas = document.createElement('canvas');
    var destCtx = destCanvas.getContext('2d');
    destCanvas.setAttribute('style', 'position: absolute; top:0px; left:0px; z-index:997;');
    destCanvas.setAttribute('class', 'canvas_appended');
	destCanvas.style.top = Math.round(parseInt(destDiv.css('top'), 10)) + bdr + 'px';
	destCanvas.style.left = Math.round(parseInt(destDiv.css('left'), 10)) + bdr + 'px';
	destCanvas.width = srcImg.width;
	destCanvas.height = srcImg.height;
	destDiv.after(destCanvas);
    clipper(destCtx, srcImg, width, height);  
}

// return value: Canvas Object
// (ox, oy) is the position of case image
function doMasking(oriImg, maskImg, destDiv, ox, oy) {
/* 	console.log("m.width:"+maskImg.width);
	console.log("m.height:"+maskImg.height);
	console.log("ox:"+ox);
	console.log("oy:"+oy); */
    var b = Math.round(parseInt(destDiv.css('border-left-width'), 10));
    var x = Math.round(parseInt(destDiv.css('left'), 10)) + b - ox;
    var y = Math.round(parseInt(destDiv.css('top'), 10)) + b - oy;
    var w = Math.round(parseInt(destDiv.css('width'), 10)) + b;
    var h = Math.round(parseInt(destDiv.css('height'), 10)) + b;
    
    //console.log("width:"+destDiv.css('width')+",height:"+destDiv.css('height')+",left:"+destDiv.css('left')+",top:"+destDiv.css('top'));
	//console.log("w:"+w+",h:"+h+",x:"+x+",y:"+y+",b:"+b);
	
    // adjust over position
    if (x+w > maskImg.width) w = maskImg.width - x;
    if (y+h > maskImg.height) h = maskImg.height - y;
    
    // reposition mask image
    var adjustMaskCanvas = document.createElement('canvas');
    adjustMaskCanvas.width = w;
    adjustMaskCanvas.height = h;
    var adjustMaskCtx = adjustMaskCanvas.getContext('2d');                        
    adjustMaskCtx.drawImage(maskImg, x, y, w, h, 0, 0, w, h); 
    
    // resize origin image
	var _w;
	var _h;
	if (w >= h) {
		_w = w;
		_h = Math.round(oriImg.height * (_w / oriImg.width));
		if (_h < h) {
			_h = h;
			_w = Math.round(oriImg.width * (_h / oriImg.height));
		}
	}
	else if(w < h) {
		_h = h;
		_w = Math.round(oriImg.width * (_h / oriImg.height));
		if (_w < w) {
			_w = w;
			_h = Math.round(oriImg.height * (_w / oriImg.width));
		}
	} 
	
	//console.log("_w:"+_w+",_h:"+_h);
	
	var resizeCanvas = document.createElement('canvas');
	resizeCanvas.width = _w;
	resizeCanvas.height = _h;
    var resizeCtx = resizeCanvas.getContext('2d');

    resizeCtx.drawImage(oriImg, 0, 0, _w, _h);
	
    var resCanvas = document.createElement('canvas');
	resCanvas.width = _w;
	resCanvas.height = _h;
    var resCtx = resCanvas.getContext('2d');
    resCtx.putImageData(applyCanvasMask(resizeCanvas, adjustMaskCanvas, maskImg.width, maskImg.height), 0, 0);
    return resCanvas;
}