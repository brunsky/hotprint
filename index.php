<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Hotprint Cloud</title>
<script type="text/javascript" src="http://code.jquery.com/jquery-latest.min.js"></script>
<link href="css/layout.css" rel="stylesheet" type="text/css" />
<link rel="shortcut icon" href="images/favicon.ico">
<style type="text/css">
	#abgneBlock {
		width: 960px;
		height: 384px;
		position: relative;
		overflow: hidden;
		float:none;
		margin:auto;
	}
	#abgneBlock ul.list {
		padding: 0;
		margin: 0;
		list-style: none;
		position: absolute;
		width: 9999px;
		height: 100%;
	}
	#abgneBlock ul.list li {
		float: left;
		width: 960px;
		height: 100%;
	}
	#abgneBlock .list img{
		width: 100%;
		height: 100%;
		border: 0;
	}
	#abgneBlock ul.playerControl {
		margin: 0;
		padding: 0;
		list-style: none;
		position: absolute;
		bottom: 5px;
		right: 5px;
		height: 14px;
	}
	#abgneBlock ul.playerControl li {
		float: left;
		width: 23px;
		height: 14px;
		cursor: pointer;
		margin: 0px 2px;
		background: url(images/rect_ctrl.png) no-repeat 0 0;
	}
	#abgneBlock ul.playerControl li.current { 
		background-position: -23px 0;
	}

</style>

<script type="text/javascript">
	$(function(){
		// 先取得必要的元素並用 jQuery 包裝
		// 再來取得 $block 的高度及設定動畫時間
		var $block = $('#abgneBlock'),
			$slides = $('ul.list', $block),
			_width = $block.width(),
			$li = $('li', $slides),
			_animateSpeed = 600, 
			// 加入計時器, 輪播時間及控制開關
			timer, _showSpeed = 5000, _stop = false;

		// 產生 li 選項
		var _str = '';
		for(var i=0, j=$li.length;i<j;i++){
			// 每一個 li 都有自己的 className = playerControl_號碼
			_str += '<li class="playerControl_' + (i+1) + '"></li>';
		}

		// 產生 ul 並把 li 選項加到其中
		var $playerControl = $('<ul class="playerControl"></ul>').html(_str).appendTo($slides.parent()).css('left', function(){
			// 把 .playerControl 移到置中的位置
			return (_width - $(this).width()) / 2;
		});
		
		// 幫 li 加上 click 事件
		var $playerControlLi = $playerControl.find('li').click(function(){
			var $this = $(this);
			$this.addClass('current').siblings('.current').removeClass('current');

			clearTimeout(timer);
			// 移動位置到相對應的號碼
			$slides.stop().animate({
				left: _width * $this.index() * -1
			}, _animateSpeed, function(){
				// 當廣告移動到正確位置後, 依判斷來啟動計時器
				if(!_stop) timer = setTimeout(move, _showSpeed);
			});

			return false;
		}).eq(0).click().end();

		// 如果滑鼠移入 $block 時
		$block.hover(function(){
			// 關閉開關及計時器
			_stop = true;
			clearTimeout(timer);
		}, function(){
			// 如果滑鼠移出 $block 時
			// 開啟開關及計時器
			_stop = false;
			timer = setTimeout(move, _showSpeed);
		});
		
		// 計時器使用
		function move(){
			var _index = $('.current').index();
			$playerControlLi.eq((_index + 1) % $playerControlLi.length).click();
		}
	});
</script>
</head>

<body onload="MM_preloadImages('images/item01_o.png','images/item02_o.png','images/item03_o.png','images/btn01_o.png','images/btn02_o.png')">

<? 
//
include "title.html"
//
?>
<div class="index_pic_bg">
<div id="abgneBlock">
		<ul class="list">
			<li><img src="images/index_02.jpg"></li>
			<li><a href="http://www.hotprintcloud.com/index.html"><img src="images/index_01.jpg"></a></li>
			<li><img src="images/index_03.jpg"></li>
		</ul>
</div>
</div>
<div class="t13" id="index_main">
<p>&nbsp;</p>

<p align="center"><a href="https://www.facebook.com/pages/Hotprintcloud/532450930112692" target="_blank"><img src="images/index_3block_1.png" border="0" style="margin-right:20px" /></a><a href="http://www.hotprintcloud.com/index.html"><img src="images/index_3block_3.png" style="margin-right:20px"></a><img src="images/index_3block_2.png" /></p>

<p>

<p class="clear">&nbsp;</p>
</div>
<? 
//
include "bottom.html"
//
?>
<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-2801329-2']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>
</body>
</html>
