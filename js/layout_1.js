var _x;
var _y;

for (var i=1; i<=23; i++) {
	//Create DIV 
	$destDiv = $(document.createElement('div'));
	$destDiv.attr('id', 'corner'+i);
	$destDiv.attr('class', 'layout_circle');
	$destDiv.addClass('layout_corner');
	$("#mCanvas").after($destDiv);    
	$destDiv.corner("999px");
	// Adjust position according to mCanvas
	_y = parseFloat($destDiv.css('top'), 10);
	_x = parseFloat($destDiv.css('left'), 10);
	$destDiv.css('top', _y+layout_oy+'px');
	$destDiv.css('left', _x+layout_ox+'px');
	$destDiv.css('z-index', '998');
	$destDiv.css('border', '2px solid #F5F5F5');
	$destDiv.data('borderColor', '#F5F5F5');
	$destDiv.data('borderColor2', '#A8A8A8');
	
	$('#corner'+i).dblclick(function(e) {
		if ($(this).children(".draggable").attr("class").indexOf("cached") >= 0) {
			var _img = new Image();
			_img.src = $(this).children(".draggable").attr('src');
			realClipper($(this), _img);
			/*
			_img.onload = function() {
				realClipper($(this), _img);   
			}
			*/
		}
    });
}