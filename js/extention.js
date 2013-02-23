//////////////////////////////////////////////////
// Show order history

function mode_history() {
	
}

//////////////////////////////////////////////////
// Create checkout page 

function mod_checkout() {
	$order = $('<div></div>');
	$order.addClass('order');
	$order.css('position', 'absolute');
	$order.css('top', $('.mainmenu').height()+50+'px');
	$order.load('checkout/checkout.html?v='+(new Date()).getTime(), function(){
		
		/* // 這是比較炫的信用卡輸入頁面
		$('#card_number').validateCreditCard(function(result) {
	      if (!(result.card_type != null)) {
	        $('.cards li').removeClass('off');
	        $('#card_number').removeClass('valid');
	        $('.vertical.maestro').slideUp({
	          duration: 200
	        }).animate({
	          opacity: 0
	        }, {
	          queue: false,
	          duration: 200
	        });
	        return;
	      }
	      $('.cards li').addClass('off');
	      $('.cards .' + result.card_type.name).removeClass('off');
	      if (result.card_type.name === 'maestro') {
	        $('.vertical.maestro').slideDown({
	          duration: 200
	        }).animate({
	          opacity: 1
	        }, {
	          queue: false
	        });
	      } else {
	        $('.vertical.maestro').slideUp({
	          duration: 200
	        }).animate({
	          opacity: 0
	        }, {
	          queue: false,
	          duration: 200
	        });
	      }
	      if (result.length_valid && result.luhn_valid) {
	        return $('#card_number').addClass('valid');
	      } else {
	        return $('#card_number').removeClass('valid');
	      }
	    });
		
		*/
		
		// Update Shopping Cart
		simpleCart.update();
		
		// popup card tip when mouse hovering
		$(".order a.preview").hover(function(e){
			var parentOffset = $(this).parent().offset(); 
			$(".order").append("<div id='preview'><img src='checkout/card.png'/></div>");	
			$('#preview').css('position', 'relative');							 
			$("#preview")
				.css("top",e.pageY - parentOffset.top + "px")
				.css("left",e.pageX - parentOffset.left + "px")
				.fadeIn("fast");						
	    },
		function(){
			$("#preview").remove();
	    });	
	    
		$(".order a.preview").mousemove(function(e){
			var parentOffset = $(this).parent().offset(); 
			$("#preview")
				.css("top",e.pageY - parentOffset.top + "px")
				.css("left",e.pageX - parentOffset.left + "px");
		});	
		
		// event binding
		$("#checkout_cancel").click(function() {
			openGallery();	
		});

		$("#checkout_confirm").click(function() {
			
			// Set checkout information
			if ($("#checkout_confirm").val() == '確認資料') {
				$.post('checkout/coupon.php', 
				
					{"code":$("#coupon_no").val(),
					 "userid":$.cookie('user_id')},
					 
					function(data) {
						if(data.result == "ok") {
							var _n = parseFloat($(".simpleCart_total").html().replace('$', ''), 10).toFixed(2);
							var _amount = parseFloat($(".simpleCart_quantity").html().replace('$', ''), 10).toFixed(2);
							var discount = (_amount * data.value).toFixed(2);
							$(".simpleCart_total").html("")
				                .fadeIn(300)
				                .append("$" + (_n - discount).toFixed(2).toString());
				            $("#coupon_no").after('<font color="red">已折扣 $'+discount+'</font>');
						}
						else {
							if (data.value == 'used')
								$("#coupon_no").after('<font color="red">已經被使用</font>');
							else if( (data.value == 'invalid'))
								$("#coupon_no").after('<font color="red">無效的折扣碼</font>');
							else
								$("#coupon_no").after('<font color="red">稍後再試</font>');
						}
						$("#checkout_confirm").val("刷卡付款");
					}, "json");
			}
			else {
				simpleCart({
				    checkout: { 
				    	type: "SendForm" , 
				        url: HOST_URL + "checkout/bill.php" ,
				        success: "index.html?b=succeed" , 
				        cancel: "index.html?b=cancel",
				        extra_data: {
				          storename: $(".open").html(),
				          userid: $.cookie('user_id'),
				          token: $.cookie('access_token'),
				          type: $.cookie('source'),
				          card_no: $("#card_no").val(),
				          expiry_date: $("#expiry_date").val(),
				          cvc_no: $("#cvc_no").val(),
				          coupon_no: $("#coupon_no").val(),
				          total: $(".simpleCart_total").html().replace('$', ''),
				          shipping_email: $("#shipping_email").val(),
				          shipping_name: $("#shipping_name").val(),
				          shipping_addr: $("#shipping_address").val(),
				          shipping_city: $("#shipping_city").val(),
				          shipping_country: $("#countrySelect :selected").text()
				        }
				    }
			  	});
			  	
				simpleCart.checkout();	
			}
		});
	});
	$('body').append($order);
		
}

//////////////////////////////////////////////////
// Create gallery page 

function mod_gallery() {
	
	$g = $('<div></div>');
	$('body').append($g);
	$g.attr('id', 'gallery');
	
	// Add deatail of cart
	$('#gallery').before('<div class="shopping_cart">購物車<div> ----------- </div>'+
		'<div class="simpleCart_items"></div><div style="float:left">總計：</div><div class="simpleCart_total"></div><div class="checkout">結帳</div></div>');
	$('.shopping_cart').css('top','100px');
	$('.shopping_cart').css('left','100px');
	simpleCart.bind( 'update' , function() {
		$('.item-decrement').css('padding-right', '12px');
		$('.item-quantity').css('padding-right', '12px');
		$('.headerRow > .item-total').css('padding-left', '100px');	 
		$('#gallery').css('top', Math.round(parseInt($('.shopping_cart').css('top')))+$('.shopping_cart').height()+50+'px');
		
		// Check if anything in the cart
		if ($('.simpleCart_total').html() == '$0.00')
			$('.checkout').hide();
		else
			$('.checkout').show();
	});
	
	// Click chechout button
	$('.checkout').click(function(){
		
		releasePage('Gallery');
		newPage('Checkout');
	});
	
	// Update Shopping Cart
	simpleCart.update();
	
	$g.css('left', '100px');
	
	if($.cookie('user_id')) {
		$.post("db/retrive_gallery.php", 
				{ userid: $.cookie('user_id')
				},  
				function(data) {
					var json = $.parseJSON(data);
					if ($.cookie('user_id') == '1587166409' || 
						$.cookie('user_id') == '100004857218710' || 
						$.cookie('user_id') == '527379830' ||
						$.cookie('user_id') == '54327628' ||
						$.cookie('user_id') == '1709821659') { // Brunsky, Mark, James. Mark's wife
						$.each(json, function(key, val) {
							$('#gallery').append('<div class="simpleCart_shelfItem">'+
							'<div class="g_img_wrap"><img src="'+val.orig_img+'" alt="image" /></div><br />'+
							'<h2 class="item_name">'+val.title_name+'</h2>'+
							val.phone_type+', '+
							val.phone_color+'<br />'+
							val.s_save+'<br />'+
							'<span class="item_price">$'+val.price+'</span><br>'+
							'<a class="item_add" href="javascript:;"> 加入購物車 </a></p>'+
							'<input type="button" value="產生原圖" onClick="_send_factory(\''+val.s_save+'\')">'+'</div>');
						});

					}
					else {
						$.each(json, function(key, val) {
							$('#gallery').append('<div class="simpleCart_shelfItem">'+
							'<img src="'+val.orig_img+'" alt="image" /><br />'+
							'<h2 class="item_name">'+val.phone_type+'</h2>'+
							val.phone_color+'<br />'+
							val.s_save+'<br />'+
							'<span class="item_price">$'+val.price+'</span><br>'+
							'<a class="item_add" href="javascript:;"> 加入購物車 </a></p></div>');
						});
					}
					
		});
	}
	
}

function _send_factory(savetime){
	releasePage(PAGE);
	$.post("db/retrive_image_factory.php", 
			{ userid: $.cookie('user_id'),
			  s_save: savetime
			},  
			function(data) {
				var json = $.parseJSON(data);
				var Obj = $.parseJSON(json[0].saveimag);
				_producing_for_factory(Obj, json[0].phone_type);

				//_producing_for_factory_from_layout(json[0]);
			});
}


//////////////////////////////////////////////////
// Save design into image source

var scaling = 3; // Image saving ratio
 
function mod_saving(func_complete) {
	$("body").append('<div class="modalOverlay"></div>');
	$wDiv = $('.modalOverlay');
	// Check if design is completed
	if (!($('.canvas_appended').length != 0 && 
		$('.canvas_appended').length == $('.layout_corner').length)) {
		new Messi('<p>您尚未完成設計哦</p><p>請先將圖片按您的喜好拖拉至所有的區塊後，才能儲存</p>', {title: '提醒您 !', modal: true});
		$wDiv.remove();
		return;
	}
	// Check if did not set title yet
	if (TITLE_NAME == '') {
		Messi.alert('請輸入名稱 : <input type="text">', function(value, content){
			TITLE_NAME = content;
			saveImg();
		},{title: '提醒您 !', modal: true});
		$wDiv.remove();
		return;
	}
	
	$("body").append('<div id="progress-bar"><div id="status"></div></div>');
	$( "#progress-bar" ).css('position','fixed');
	$( "#progress-bar" ).css('z-index', '1001');
	$( "#progress-bar" ).css('top', '300px');
	$( "#progress-bar" ).css('left', layout_ox+'px');
	$status = $('#status');
	var jsonObj = []; // json array for storing layout&image information
	// counting for progress bar
	var factor = 100 / $('.layout_corner').length; 
	var inc = 0;
	
	var elements = $('body').find('.layout_corner');
	var index = 0;
	process();
	
	// Using settimeout to let browser update screen.
	function process() {
		var e = elements.get(index++);
		if ($(e).length) {

			$status.css('width', function(){
				inc += factor;
				return inc+"%";
			});
	    	
			jsonObj.push({
	    		cornerId: $(e).attr('id'), 
	    		cornerClass: $(e).attr('class'),
	    		cornerStyle: $(e).attr('style')+' width:'+$(e).css('width')+'; height:'+$(e).css('height'),
	    		imgURL: $(e).children(".draggable").data('src'),
	    		zdx: $(e).children(".draggable").data('zdx'),
	    		zdy: $(e).children(".draggable").data('zdy'),
	    		zw: $(e).children(".draggable").data('zw'),
	    		zh: $(e).children(".draggable").data('zh')});
			
			setTimeout(process, 10);
		}
		else {
			$status.after('<br><span style="font-size: 16px; color: white"> 上傳中...</span>');
			var resCanvas = document.createElement('canvas');
			_show_save(resCanvas);
			$.post("db/save_image.php", 
				{ userid: $.cookie('user_id'), 
					user_type: $.cookie('user_type'),
					title_name: TITLE_NAME,
					saveimag: JSON.stringify(jsonObj),
					phone_type: PHONE_NAME,
					layout_no: LAYOUT_NAME,
					phone_color: PHONE_COLOR,
					orig_img: resCanvas.toDataURL()},  
				function(data) {
					// Empty title name
					TITLE_NAME = '';
					// release this resCanvas by 'releasePage()'
					$(resCanvas).attr('id', 'galleryCanvas');
					$(resCanvas).css('position', 'absolute');
					$(resCanvas).css('top', '80px');
					$(resCanvas).css('left', '200px');
					$(resCanvas).css('width', Math.round($("#mCanvas")[0].width*0.7)+'px');
					$(resCanvas).css('height', Math.round($("#mCanvas")[0].height*0.7)+'px');
					$('body').append($(resCanvas));
						
					$( "#progress-bar" ).remove();
					$( "#progress-bar" )[0] = null;
					$wDiv.remove();
					$wDiv[0] = null;
					
					func_complete();
			});
		}
	}
}

/*
 * Save to a image from attached canvas for gallery display and return canvas for storing
 * (low resolution)
 */

function _show_save(resCanvas) {
	var bdr = Math.round(parseInt($('.layout_corner').css('border-left-width'), 10));
    var resCtx = resCanvas.getContext('2d');
    $(resCanvas).attr('id', 'galleryCanvas');
	resCanvas.width = Math.round($("#mCanvas")[0].width);
	resCanvas.height = Math.round($("#mCanvas")[0].height);
	resCtx.drawImage($("#mCanvas")[0], 0, 0, resCanvas.width, resCanvas.height);
	$('.canvas_appended').each(function(index) {
    	resCtx.drawImage($(this)[0], 
    					(Math.round(parseInt($(this).css('left'), 10))-layout_ox), 
    					(Math.round(parseInt($(this).css('top'), 10))-layout_oy), 
    					Math.round(parseInt($(this)[0].width, 10)),
    					Math.round(parseInt($(this)[0].height, 10)));
	});
}

/*
 * HD ouput for factory 
 */
function _producing_for_factory(json, phone_type) {

	$("body").append('<div class="modalOverlay"></div>');
	$wDiv = $('.modalOverlay');
	
	$("body").append('<div id="progress-bar"><div id="status"></div></div>');
	$( "#progress-bar" ).css('position','fixed');
	$( "#progress-bar" ).css('z-index', '1001');
	$( "#progress-bar" ).css('top', '300px');
	$( "#progress-bar" ).css('left', layout_ox+'px');
	$status = $('#status');
	var a = new Image();
	a.src = "images/"+phone_type+"_mask3.png";
	//console.log(a.src);
	a.onload = function(){
	
		var resCanvas = document.createElement('canvas');
	    var resCtx = resCanvas.getContext('2d');
		resCanvas.width = Math.round(a.width);
		resCanvas.height = Math.round(a.height);
		
		// scaling mask
		var adjustMaskCanvas = document.createElement('canvas');
	    adjustMaskCanvas.width = a.width;
	    adjustMaskCanvas.height = a.height;
	    var adjustMaskCtx = adjustMaskCanvas.getContext('2d');                       
	    adjustMaskCtx.drawImage(a, 0, 0); 
		
		var factor = 100 / json.length; 
		var inc = 0;
		
		var elements = json;
		
		var index = 0;
		process();
		
		// Using settimeout to let browser update screen.
		function process() {
			var e = elements[index++];
			if ($(e).length) {

				$status.css('width', function(){
					inc += factor;
					return inc+"%";
				});
	
				// parse CSS
				var _stylestemp = e.cornerStyle.split(';');
				var styles = {};
			    var _c = '';
			    for (var x in _stylestemp) {
			    	_c = _stylestemp[x].split(':');
			    	styles[$.trim(_c[0])] = $.trim(_c[1]);
			   	}
			   
				var $c = $('<div></div>');
				$c.css('position', 'absolute');
				$c.css('top', Math.round(parseInt(styles.top), 10) * scaling + 'px');
				$c.css('left', Math.round(parseInt(styles.left), 10) * scaling + 'px');
				$c.css('width', Math.round(parseInt(styles.width), 10) * scaling + 'px');
				$c.css('height', Math.round(parseInt(styles.height), 10) * scaling + 'px');
				$c.css('border', '6px solid silver'); // setup border in manually !!
				
				// parse Attribute
			   	$c.addClass(e.cornerClass);
			   	$c.attr('id',e.cornerId);
			   	
				$('body').append($c);
				
				var b = $('<img/>');
				b.attr('src', e.imgURL);
				if (typeof e.imgURL == 'undefined') {
					alert(e.cornerId);
				}
				//console.log(e.imgURL);
				//console.log(e.cornerId);
		
				b.load(function() {
					var bb = new Image();
					// Get transform automatically
					if (typeof e.zdx != 'undefined') { 
						// parse data
						b.data('zdx', e.zdx * scaling);
						b.data('zdy', e.zdy * scaling);
						b.data('zw', e.zw * scaling);
						b.data('zh', e.zh * scaling);

						var $dstCanvas = $('<canvas>');
						var $srcDiv = $c.clone();
						$dstCanvas[0].width = parseInt($c.css('width'), 10) + parseInt($c.css('border-left-width'), 10);
						$dstCanvas[0].height = parseInt($c.css('height'), 10) + parseInt($c.css('border-left-width'), 10);
						autoClipper2(b[0], $dstCanvas, $srcDiv, $c);
						bb.src = $dstCanvas[0].toDataURL();
						bb.width = $dstCanvas[0].width;
						bb.height = $dstCanvas[0].height;
					}
					else {
						bb.src = b.attr('src');
					}
					
					bb.onload = function() {
						if ($c.attr("class").indexOf("layout_circle") >= 0) {
							doClipping( 
								doMasking(bb, adjustMaskCanvas, $c, layout_ox*scaling, layout_oy*scaling), 
								$c, 
								cirClipper);	
						}
						else if ($c.attr("class").indexOf("layout_square") >= 0) {
							doClipping( 
								doMasking(bb, adjustMaskCanvas, $c, layout_ox*scaling, layout_oy*scaling), 
								$c, 
								boxClipper);
						}
					
						resCtx.drawImage($c.next()[0], 
				    					(Math.round(parseInt($c.next().css('left'), 10))-layout_ox*scaling), 
				    					(Math.round(parseInt($c.next().css('top'), 10))-layout_oy*scaling), 
				    					Math.round(parseInt($c.next().css('width'), 10)),
				    					Math.round(parseInt($c.next().css('height'), 10)));
				    	$c.next().remove();
				    	$c.next()[0] = null;			
				    	$c.remove();
				    	$c[0] = null;
						
						setTimeout(process, 10);
					}					
				});
			}
			else {

				mod_saveremote(resCanvas);
				delete resCanvas;
				resCanvas = null;
				$( "#progress-bar" ).remove();
				$( "#progress-bar" )[0] = null;
				$wDiv.remove();
				$wDiv[0] = null;

			}
		}
	}

}

function _producing_for_factory_from_layout(json) {
	
	var canvas = document.createElement('Canvas');
    canvas.setAttribute('id', 'mCanvas');
    var context = canvas.getContext('2d');
    $('.mainmenu').before(canvas);
	
	$("link[type='text/css']#layout_css").remove();
    //Import CSS
    var cssFile = jQuery("<link>");
    cssFile.attr({
      rel:  "stylesheet",
      type: "text/css",
      href: "css/"+json.phone_type+"_"+json.layout_no+".css?v="+(new Date()).getTime(),
      id: "layout_css"
    });   

    $("head").append(cssFile);
	// Import layout js
	styleOnload(cssFile[0],function() {
		var layoutLocation = "js/"+json.phone_type+"_"+json.layout_no+".js?v="+(new Date()).getTime();
		$.getScript(layoutLocation)
			.done(function(data, textStatus, jqxhr) {
				//console.log(json.saveimag);
				_producing($.parseJSON(json.saveimag));
			})
			.fail(function(data, textStatus, jqxhr) {
				//console.log('_producing_for_factory: load layout.js failed');
			});

	});
	
	function _producing(json) {
	
		$("body").append('<div class="modalOverlay"></div>');
		$wDiv = $('.modalOverlay');
		
		$("body").append('<div id="progress-bar"><div id="status"></div></div>');
		$( "#progress-bar" ).css('position','fixed');
		$( "#progress-bar" ).css('z-index', '1001');
		$( "#progress-bar" ).css('top', '300px');
		$( "#progress-bar" ).css('left', layout_ox+'px');
		$status = $('#status');
		var a = new Image();
		a.src = "images/"+PHONE_NAME+"_mask3.png";
		//console.log('_producing:'+a.src)
		a.onload = function(){
		
			var resCanvas = document.createElement('canvas');
		    var resCtx = resCanvas.getContext('2d');
			resCanvas.width = Math.round(a.width);
			resCanvas.height = Math.round(a.height);
			
			// scaling mask
			var adjustMaskCanvas = document.createElement('canvas');
		    adjustMaskCanvas.width = a.width;
		    adjustMaskCanvas.height = a.height;
		    var adjustMaskCtx = adjustMaskCanvas.getContext('2d');                       
		    adjustMaskCtx.drawImage(a, 0, 0); 
			
			var factor = 100 / json.length; 
			var inc = 0;
			
			var elements = json;
			
			var index = 0;
			process();
			
			// Using settimeout to let browser update screen.
			function process() {

				var e = elements[index++];
				if ($(e).length) {
	
					$status.css('width', function(){
						inc += factor;
						return inc+"%";
					});
		
					// parse CSS
					var _stylestemp = e.cornerStyle.split(';');
					var styles = {};
				    var _c = '';
				    for (var x in _stylestemp) {
				    	_c = _stylestemp[x].split(':');
				    	styles[$.trim(_c[0])] = $.trim(_c[1]);
				    }
			   
			   		//console.log('corner id:'+e.cornerId);
			   
					var $c = $('<div></div>');
					$c.css('position', 'absolute');
					$c.css('top', Math.round(parseInt(styles.top), 10) * scaling + 'px');
					$c.css('left', Math.round(parseInt(styles.left), 10) * scaling + 'px');
					$c.css('width', Math.round(parseInt($('body').find('#'+e.cornerId).css('width')), 10) * scaling + 'px');
					$c.css('height', Math.round(parseInt($('body').find('#'+e.cornerId).css('height')), 10) * scaling + 'px');
					$c.css('border', '6px solid silver'); // setup border in manually !!
					
					// parse Attribute
				   	$c.addClass(e.cornerClass);
				   	
					$('body').append($c);
					
					var b = $('<img/>');
					b.attr('src', e.imgURL);
			
					b.load(function() {
						var bb = new Image();
						// Get transform automatically
						if (typeof e.zdx != 'undefined') { 
							// parse data
							b.data('zdx', e.zdx * scaling);
							b.data('zdy', e.zdy * scaling);
							b.data('zw', e.zw * scaling);
							b.data('zh', e.zh * scaling);
	
							var $dstCanvas = $('<canvas>');
							var $srcDiv = $c.clone();
							$dstCanvas[0].width = parseInt($c.css('width'), 10) + parseInt($c.css('border-left-width'), 10);
							$dstCanvas[0].height = parseInt($c.css('height'), 10) + parseInt($c.css('border-left-width'), 10);
							autoClipper2(b[0], $dstCanvas, $srcDiv, $c);
							bb.src = $dstCanvas[0].toDataURL();
							bb.width = $dstCanvas[0].width;
							bb.height = $dstCanvas[0].height;
						}
						else {
							bb.src = b.attr('src');
						}
						
						bb.onload = function() {
							if ($c.attr("class").indexOf("layout_circle") >= 0) {
								doClipping( 
									doMasking(bb, adjustMaskCanvas, $c, layout_ox*scaling, layout_oy*scaling), 
									$c, 
									cirClipper);	
							}
							else if ($c.attr("class").indexOf("layout_square") >= 0) {
								doClipping( 
									doMasking(bb, adjustMaskCanvas, $c, layout_ox*scaling, layout_oy*scaling), 
									$c, 
									boxClipper);
							}
						
							resCtx.drawImage($c.next()[0], 
					    					(Math.round(parseInt($c.next().css('left'), 10))-layout_ox*scaling), 
					    					(Math.round(parseInt($c.next().css('top'), 10))-layout_oy*scaling), 
					    					Math.round(parseInt($c.next().css('width'), 10)),
					    					Math.round(parseInt($c.next().css('height'), 10)));
					    	$c.next().remove();
					    	$c.next()[0] = null;			
					    	$c.remove();
					    	$c[0] = null;
							
							setTimeout(process, 10);
						}					
					});
				}
				else {
	
					mod_saveremote(resCanvas);
					delete resCanvas;
					resCanvas = null;
					$( "#progress-bar" ).remove();
					$( "#progress-bar" )[0] = null;
					$wDiv.remove();
					$wDiv[0] = null;
	
				}
			}
		}
	} // End of _producing()
}

/*
 * Save image remotelly from <img> inside corner for gallery display
 * (high resolution)
 */
function mod_saveremote(resCanvas) {
	var img = $('<img>');
	img.attr('id', 'galleryCanvas');
	img.css('position', 'absolute');
	img.css('top', '80px');
	img.css('left', '100px');
	img.css('width', Math.round(resCanvas.width.width*0.7)+'px');
	img.css('height', Math.round(resCanvas.width.height*0.7)+'px');
	$('body').append(img);
	$('#galleryCanvas')[0].src = resCanvas.toDataURL();	
	
}

/*
 * Set up object for draggable
 */
function setDragObj(divObj) {
	divObj.children(".draggable").draggable({
		scroll: false,
		cursor: 'auto', 
		cursorAt: { left: 35, top: 35 },
		revert:"valid",
		drag: function(event, ui) {
			if ($(this).attr("class").indexOf("ui-draggable-dragging") >= 0) {
				$(this).parent().css('z-index','1000');
				$(this).css("opacity", "0.7");
			}
		},
		start: function(event, ui) {
			disable_scroll();
			$(this).height($(this).data('oh')).width($(this).data('ow'));
			$('.layout_corner').css('z-index', '998'); 
			$('.layout_corner').stop(true, true).animate({ opacity: 1 });
			// set corner object
			$(this).data('corner', $(this).parent());
		},
		stop: function( event, ui ) { // It's triggered once drag out of corner 
			enable_scroll();
			if ($(this).parent().attr("class").indexOf("removed") >= 0) {
				clearCorner($(this).parent());
			}
		}
	});
	divObj.children(".draggable").css('z-index','');
	divObj.removeClass("removed");	
	divObj.children(".draggable").removeClass("ui-draggable-dragging");		
	divObj.css('cursor', 'move');
	divObj.css('z-index','998');
}

/*
 * Generize random design
 */

function mod_randesign() {

	if($('.layout_corner').children('.spinner').length > 0) {
		//console.log('waiting spin stop');
		return;
	}
	
	if ($('.canvas_appended').length != 0 ) {
		$("body").append('<div class="modalOverlay"></div>');
		new Messi('您確定要重新隨機設計嗎？之前的圖片將會被清空！', 
			{title: '隨機設計', 
			 buttons: [{id: 0, label: 'Yes', val: 'Y'}, 
						{id: 1, label: 'No', val: 'N'}], 
			 callback: function(val, content) {  
				if (val === 'Y') {
					_randesign();
				}
				$('.modalOverlay').remove();
				$('.layout_corner').animate({ opacity: CORNER_OPT});
			}});
	}
	else
		_randesign();
}

function _randesign() {

	// clear content
	$('.layout_corner').css('opacity', CORNER_OPT);
	$('.layout_corner').html('');
	$('.layout_corner > draggable').each(function(index) {
	  	$(this).remove();
	  	$(this)[0] = null;
	});
	$('.canvas_appended').each(function(index) {
	  	$(this).remove();
	  	$(this)[0] = null;
	});

	// visit image gallery in randomly
	$('.layout_corner').each(function(index) {

		var r = Math.floor(Math.random() * $('.gallery-pool').length);
		// put image into layout
		$(this).append($($('.gallery-pool')[r]).clone());
		$(this).children(".draggable").removeClass('gallery-pool'); // remove to prevent getting the same one
		// copy original size
		$(this).children(".draggable").data('oh', Math.round($('.gallery-pool')[r].height*0.7));
		$(this).children(".draggable").data('ow', Math.round($('.gallery-pool')[r].width*0.7));
			
		$(this).children(".draggable").css({
			"position": "relative",
			"top": "0px",
			"left": "0px",
			"width": $(this).css('width'),
			"height": $(this).css('height'),
			"opacity": "0"
		});
		
		var imgSrc = $(this).children(".draggable").attr('src');
		var divObj = $(this);
		// copy img url from gallery-pool object
		// Fixed url to hotprintCloud server
		var str = HOST_URL + TEMP_DIR + imgSrc.replace(/\//g, "+");
		$(this).children(".draggable").data('src', str);
		
		var opts = {
		  lines: 13, // The number of lines to draw
		  length: 7, // The length of each line
		  width: 4, // The line thickness
		  radius: 10, // The radius of the inner circle
		  corners: 1, // Corner roundness (0..1)
		  rotate: 0, // The rotation offset
		  color: '#000', // #rgb or #rrggbb
		  speed: 1, // Rounds per second
		  trail: 60, // Afterglow percentage
		  shadow: false, // Whether to render a shadow
		  hwaccel: false, // Whether to use hardware acceleration
		  className: 'spinner', // The CSS class to assign to the spinner
		  zIndex: 2e9, // The z-index (defaults to 2000000000)
		  top: 'auto', // Top position relative to parent in px
		  left: 'auto' // Left position relative to parent in px
		};

		var spinner = new Spinner(opts).spin($(this)[0]);
		$.getImageData({
			url: imgSrc,
			server: HOST_URL+"proxy/getImageData.php",
			success: function(image){
				divObj.children(".draggable").attr('src', image.src);
				divObj.children(".draggable").addClass("cached");
				/*
				if (divObj.attr("class").indexOf("layout_circle") >= 0) {
					doClipping( 
						doMasking(image, maskImg, divObj, layout_ox, layout_oy), 
						divObj, 
						cirClipper);	
				}
				else if (divObj.attr("class").indexOf("layout_square") >= 0) {
					doClipping( 
						doMasking(image, maskImg, divObj, layout_ox, layout_oy), 
						divObj, 
						boxClipper);
				}*/
				
				autoCentered(divObj, image);
				
				// set corner div to invisible
				divObj.css('opacity','0');
				spinner.stop();
				setDragObj(divObj);
			},
			error: function(xhr, text_status){
				spinner.stop();
				//console.log("Fail to get image:"+imgSrc);
			}
		});
	});
}

/*
 * CLear button
 */
function clearDesign() {
	
	if($('.layout_corner').children('.spinner').length > 0) {
		//console.log('waiting spin stop');
		return;
	}
	
	// Check if any design already
	if ($('.canvas_appended').length != 0 ) {
		$("body").append('<div class="modalOverlay"></div>');
		new Messi('您確定要清除設計嗎？所有的圖片將會被清空！', 
			{title: '清除內容', 
			 buttons: [{id: 0, label: 'Yes', val: 'Y'}, 
						{id: 1, label: 'No', val: 'N'}], 
			 callback: function(val, content) {  
			 	//console.log(val+','+content);
				if (val === 'Y') {
					if ( $('.layout_corner').length ) {
						$('.layout_corner').children('.draggable').each(function(index) {
					  		$(this).remove();
						  	$(this)[0] = null;
						});
					}
					if ( $('.canvas_appended').length ) {
						$('.canvas_appended').each(function(index) {
						  	$(this).remove();
						  	$(this)[0] = null;
						});
					}
				}
				$('.modalOverlay').remove();
				$('.layout_corner').animate({ opacity: CORNER_OPT});
			}});
	}
}

/*
 * CSS loader
 */

function styleOnload(node, callback) {
    if (node.attachEvent) {
      node.attachEvent('onload', callback);
    }
    else {
      setTimeout(function() {
        poll(node, callback);
      }, 0);
    }
}

function poll(node, callback) {
  if (callback.isCalled) {
    return;
  }

  var isLoaded = false;

  if (/webkit/i.test(navigator.userAgent)) {//webkit
    if (node['sheet']) {
      isLoaded = true;
    }
  }else if (node['sheet']) {
    try {
      if (node['sheet'].cssRules) {
        isLoaded = true;
      }
    } catch (ex) {
      if (ex.code === 1000) {
        isLoaded = true;
      }
    }
  }

  if (isLoaded) {
    setTimeout(function() {
      callback();
    }, 1);
  }
  else {
    setTimeout(function() {
      poll(node, callback);
    }, 1);
  }
}

// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = [37, 38, 39, 40];

function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.returnValue = false;
}

function keydown(e) {
    for (var i = keys.length; i--;) {
        if (e.keyCode === keys[i]) {
            preventDefault(e);
            return;
        }
    }
}
/*
 * Disable/Enable scrolling
 */
function wheel(e) {
    preventDefault(e);
}

function disable_scroll() {
    if (window.addEventListener) {
        window.addEventListener('DOMMouseScroll', wheel, false);
    }
    window.onmousewheel = document.onmousewheel = wheel;
    document.onkeydown = keydown;
}

function enable_scroll() {
    if (window.removeEventListener) {
        window.removeEventListener('DOMMouseScroll', wheel, false);
    }
    window.onmousewheel = document.onmousewheel = document.onkeydown = null;
}
