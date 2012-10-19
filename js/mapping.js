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
	var bdr = parseFloat(destDiv.css('border-left-width'), 10);
	var width = parseFloat(destDiv.css('width'), 10) + bdr;
	var height = parseFloat(destDiv.css('height'), 10) + bdr;
    var destCanvas = document.createElement('canvas');
    var destCtx = destCanvas.getContext('2d');
    destCanvas.setAttribute('style', 'position: absolute; top:0px; left:0px; z-index:997;');
	destCanvas.style.top = parseFloat(destDiv.css('top'), 10) + bdr + 'px';
	destCanvas.style.left = parseFloat(destDiv.css('left'), 10) + bdr + 'px';
	destCanvas.width = width;
	destCanvas.height = height;
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
    var b = parseFloat(destDiv.css('border-left-width'), 10);
    var x = parseFloat(destDiv.css('left'), 10) + b - ox;
    var y = parseFloat(destDiv.css('top'), 10) + b - oy;
    var w = parseFloat(destDiv.css('width'), 10) + b;
    var h = parseFloat(destDiv.css('height'), 10) + b;
    
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