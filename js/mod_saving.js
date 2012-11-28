//////////////////////////////////////////////////
// Sane design into image source

function mod_saving(maskImg) {
	// Create a div as container and set suitable size
	/*
	var $c = $("<div></div>");
	$c.css('position', 'absolute');
	$c.css('top', '80px');
	$c.css('left', '800px');
	$c.css('width', '500px');
	$c.css('height', '800px');
	$('body').append($c);
	*/
	
	var resCanvas = document.createElement('canvas');
    var resCtx = resCanvas.getContext('2d');
	resCanvas.width = $("#mCanvas")[0].width;
	resCanvas.height = $("#mCanvas")[0].height;
		
	// scaling size of layout corner and put it inside container
	$('.layout_corner').each(function(index) {
		
		$temp = $(this).clone();
		$temp.html('');
		
		var _y = parseInt($(this).css('top'), 10);
		var _x = parseInt($(this).css('left'), 10);
		var _w = parseInt($(this).css('width'), 10);
		var _h = parseInt($(this).css('height'), 10);
		console.log(_x+','+_y+','+_w+','+_h);
		$temp.css('top', _y+'px');
		$temp.css('left', _x+'px');
		$temp.css('width', _w+'px');
		$temp.css('height', _h+'px');
		$temp.css('z-index', '998');
		$temp.css('opacity', 1);
		
		//$('body').append($temp);

		// put image into layout
		//var imgSrc = $(this).children(".draggable").attr('src');
		var imgSrc = $(this).children(".draggable");
		var divObj = $temp;
		
		
		resCtx.drawImage(imgSrc[0], 
	    					(parseInt(divObj.css('left'), 10)-layout_x), 
	    					(parseInt(divObj.css('top'), 10)-layout_y), 
	    					parseInt(divObj[0].width, 10),
	    					parseInt(divObj[0].height, 10));
		/*
		if (divObj.attr("class").indexOf("layout_circle") >= 0) {
			doClipping( 
				doMasking($(this).children(".draggable")[0], maskImg, $temp, 0, 0), 
				divObj, 
				cirClipper);	
		}
		else if (divObj.attr("class").indexOf("layout_square") >= 0) {
			doClipping( 
				doMasking($(this).children(".draggable")[0], maskImg, $temp, 0, 0), 
				divObj, 
				boxClipper);
		}
		*/
		
		/*
		var _img = new Image();
		_img.src = imgSrc;
		_img.onload = function() { // very important here. you need to wait for loading
			console.log('image:'+this.src+', div id:'+divObj.attr('id'))
			if (divObj.attr("class").indexOf("layout_circle") >= 0) {
				doClipping( 
					doMasking(this, maskImg, divObj, 0, 0), 
					divObj, 
					cirClipper);	
			}
			else if (divObj.attr("class").indexOf("layout_square") >= 0) {
				doClipping( 
					doMasking(this, maskImg, divObj, 0, 0), 
					divObj, 
					boxClipper);
			}
		}
		*/
	});
	var img = $('<img>');
	img.attr('id', 'canvasImg');
	img.css('position', 'absolute');
	img.css('top', '80px');
	img.css('left', '800px');
	$('body').append(img);
	$('#canvasImg')[0].src = resCanvas.toDataURL();
}
