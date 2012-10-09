var _x;
var _y;

for (var i=1; i<=23; i++) {
	//Create DIV 
	$destDiv = $(document.createElement('div'));
	$destDiv.attr('id', 'corner'+i);
	$destDiv.attr('class', 'layout_circle');
	$("#mCanvas").after($destDiv);    
	$destDiv.corner("999px");
	// Adjust position according to mCanvas
	_y = parseFloat($destDiv.css('top'), 10);
	_x = parseFloat($destDiv.css('left'), 10);
	$destDiv.css('top', _y+layout_oy+'px');
	$destDiv.css('left', _x+layout_ox+'px');
}