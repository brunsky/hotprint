//////////////////////////////////////////////////
// Show order history

function check_detail(id) {
		$('#detail_'+id).toggle();
}

function mode_history() {
	$.post("db/retrive_order.php", 
			{ userid: $.cookie('user_id')},  
			function(data) {
				var order = $.parseJSON(data);
				//console.log(order);
				
				$('body').append('<div class="order_history" style="top:80px; left:20%; position:absolute" >'+
    					'<p align="center" style="font-size:20px;"><strong>'+$.i18n.prop('Msg_42')+'</strong></p>'+
    					'<table width="800" border="0" align="center" cellpadding="0" cellspacing="0" id="table_sty">'+
    					'<tr><td width="28%" class="title">'+$.i18n.prop('Msg_43')+'</td>'+
					        '<td width="27%" class="title">'+$.i18n.prop('Msg_44')+'</td>'+
					        '<td width="10%" class="title">'+$.i18n.prop('Msg_39')+'</td>'+
					        '<td width="10%" class="title">'+$.i18n.prop('Msg_45')+'</td>'+
					        '<td width="15%" class="title">'+$.i18n.prop('Msg_46')+'</td>'+
					        '<td width="10%" class="title"> </td></tr>'+
    					'</table></div>');
				
				$.each(order, function(i, item){
					var detail = $.parseJSON(order[i].detail);
					//console.log(detail);
					// Detail information
					var _info = '';
					var _total = 0;
					for(var j=1; j<=detail.itemCount; j++) {
						_total += (parseInt(detail['item_quantity_'+j]) || 0);
						var img_path = detail['item_options_'+j].split(',')[0].split(': ')[1];
						var title = detail['item_options_'+j].split(',')[1].split(': ')[1];
						_info += '<img src="'+img_path+'" width="40" height="68" align="absmiddle"/> '+
								title+', '+$.i18n.prop('Msg_48')+'：'+detail['item_price_'+j]+' x'+detail['item_quantity_'+j]+'</img>';
						if (j%4 == 0)	_info += '<br>';
					}		
					
					$('#table_sty').append('<tr><td>'+order[i].order_no+'</td>'+
				        '<td>'+order[i].c_time_local+'</td>'+
				        '<td>'+_total+'</td>'+
				        '<td>'+order[i].payment+'</td>'+
				        '<td>'+detail.card_no.replace(/.(?=.{4})/g, 'x')+'</td>'+
				        '<td><a href="#" onClick="check_detail(\''+order[i].order_no+'\')">'+$.i18n.prop('Msg_47')+'</a></td></tr>');			
					
					// Insert detail into row
					$('#table_sty').append('<tr id="detail_'+order[i].order_no+'" style="display: none">'+
											'<td colspan="6" style="text-align: left">'+'<br>'+_info+
											'<br><br> '+$.i18n.prop('Msg_49')+'： '+ detail.shipping_addr+','+detail.shipping_city+
											','+detail.shipping_country+'<br>'+
											'<br>'+$.i18n.prop('Msg_50')+'： '+detail.shipping_name+'<br>'+
											'<br>email： '+detail.shipping_email+'<br><br>'+
											'</td></tr>');
				});
				
				// Set bottom line
				$('#table_sty').append('<tr><td height="38" class="title">&nbsp;</td>'+
												  '<td class="title">&nbsp;</td>'+
										          '<td class="title">&nbsp;</td>'+
										          '<td class="title">&nbsp;</td>'+
										          '<td class="title">&nbsp;</td>'+
										          '<td class="title">&nbsp;</td></tr>');
				
			});
}

//////////////////////////////////////////////////
// Get local time in my format
function get_time() {
	var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth() + 1; //Months are zero based
    var curr_year = d.getFullYear();
	var curr_hour = d.getHours();
	var curr_min = d.getMinutes();
	var curr_sec = d.getSeconds();
    return (curr_year + "-"  + curr_month + "-"  + curr_date + " " + curr_hour + ":" +  curr_min + ":" + curr_sec);
}

//////////////////////////////////////////////////
// Create checkout page 

function switchNum(str){
   var rep = /(\d)(\d)(\d)(\d)/gi;
   var result = str.replace(rep,"$3$4$1$2");
   return result;
}

// Check if all the input is blnk or invalid 
function checkValid() {
	var isValid = true;
	
	$('.order :input').each(function() {
		if ($(this).val() == "" && $(this).attr('id') != 'coupon_no') {
			$(this).after("<span class='fillcheck'><font color='red'>"+$.i18n.prop('Msg_51')+"<font></span>");
			isValid = false;
		}
	}); 
	
	return isValid;
}

// fill blank automatically for free charge
function autoComplete() {
	$('.order :input').each(function() {
		if ($(this).val() == "" && $(this).attr('id') != 'coupon_no') {
			if ($(this).attr('id') == 'card_no')
				$(this).val('1111111111111111');
			else if ($(this).attr('id') == 'expiry_date') 
				$(this).val('1223');
			else if ($(this).attr('id') == 'cvc_no') 
				$(this).val('111');
		}
	});
}

function mod_checkout() {
	
	var discount = 0;
	
	$order = $('<div></div>');
	$order.addClass('order');
	$order.css('position', 'absolute');
	$order.css('top', $('.mainmenu').height()+50+'px');
	
	$order.load('checkout/checkout.html?v='+(new Date()).getTime(), function(){
		
		// Setup helper
		dust.helpers.i18n = function (chunk, ctx, bodies, params) {
		  var key = dust.helpers.tap(params.key, chunk, ctx);
		  return chunk.write($.i18n.map[key]);
		};
		var compiled = dust.compile($(this).html(), "checkout");
		dust.loadSource(compiled);
		// rendering html by helper
		dust.render("checkout", null, function(err, out) {
		  $order.html(out);
		});
		// change text manually
		$('#checkout_cancel').val($.i18n.prop('Msg_90'));
		$('#checkout_confirm').val($.i18n.prop('Msg_91'));

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
			$(".order").append("<div id='cvc'><img src='checkout/card.png'/></div>");	
			$('#cvc').css('position', 'absolute');							 
			$("#cvc")
				.css("top",e.pageY  - parentOffset.top + "px")
				.css("left",e.pageX  - parentOffset.left + "px")
				.fadeIn("fast");						
	    },
		function(){
			$("#cvc").remove();
	    });	
	    
		$(".order a.preview").mousemove(function(e){
			var parentOffset = $(this).parent().offset(); 
			$("#cvc")
				.css("top",e.pageY  - parentOffset.top + "px")
				.css("left",e.pageX  - parentOffset.left + "px");
		});	
		
		// event binding
		$("#checkout_cancel").click(function() {
			openGallery();	
		});

		$("#checkout_confirm").click(function() {
			// Remove valid checker if any
			$('.fillcheck').remove();
			// Set checkout information
			if ($("#checkout_confirm").val() == $.i18n.prop('Msg_91') && $("#coupon_no").val() != '') {
					$("#couponcheck").remove();
					$.post('checkout/coupon.php', 
					
						{"code":$("#coupon_no").val(),
						 "userid":$.cookie('user_id'),
						 "currency": simpleCart.currency().code},
						 
						function(data) {

							if(data.result == "ok") {
								var _n = parseFloat(simpleCart.grandTotal(), 10).toFixed(2);
				 				//var _amount = parseInt($(".simpleCart_quantity").html(), 10);
								discount = data.value;
					
								// Prevent negative price for some special discount (ex. VIP coupon)
								if (_n - discount <= 0) {
									discount = _n;
									$('.chk_hide').hide();
									autoComplete();
									$("#coupon_no").hide();
									$("#checkout_confirm").val($.i18n.prop('Msg_52'));
								}
								else
									$("#checkout_confirm").val($.i18n.prop('Msg_57'));
									
								var _price = parseFloat(_n - discount).toFixed(2);
	
								$(".simpleCart_total").html("")
					                .fadeIn(300)
					                .append(DOLLAR_SIGN + _price.toString());
					            $("#coupon_no").after('<span id="couponcheck"><font color="red">'+$.i18n.prop('Msg_53')+' '+DOLLAR_SIGN+discount+'</font></span>');
							}
							else {
								if (data.value == 'used')
									$("#coupon_no").after('<span id="couponcheck"><font color="red">'+$.i18n.prop('Msg_54')+'</font></span>');
								else if( (data.value == 'invalid'))
									$("#coupon_no").after('<span id="couponcheck"><font color="red">'+$.i18n.prop('Msg_55')+'</font></span>');
								else if( (data.value == 'due'))
									$("#coupon_no").after('<span id="couponcheck"><font color="red">'+$.i18n.prop('Msg_93')+'</font></span>');
								else
									$("#coupon_no").after('<span id="couponcheck"><font color="red">'+$.i18n.prop('Msg_56')+'</font></span>');
								$("#coupon_no").val('');
							}
							
						}, "json");
			}
			else {
				if (checkValid() == false) {
					return;
				}

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
				          expiry_date: switchNum($("#expiry_date").val()),
				          cvc_no: $("#cvc_no").val(),
				          coupon_no: $("#coupon_no").val(),
				          total: simpleCart.grandTotal() - discount,
				          shipping_email: $("#shipping_email").val(),
				          shipping_name: $("#shipping_name").val(),
				          shipping_addr: $("#shipping_address").val(),
				          shipping_city: $("#shipping_city").val(),
				          shipping_country: $("#countrySelect :selected").text(),
				          c_time: get_time(),
				          lang: MY_LANG,
				          currency: simpleCart.currency().code
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

/*
	$.get('/js/template/shopping_cart.html?v='+(new Date()).getTime(), function(template) {
		$('#gallery').before(template);
	});
*/
	// Add deatail of cart
	$('#gallery').before('<div class="shopping_cart">'+$.i18n.prop('Msg_58')+'<div> ----------- </div>'+
		'<div class="simpleCart_items"></div><div style="float:left">'+$.i18n.prop('Msg_59')+'：</div><div class="simpleCart_total"></div></div>');
	$('.shopping_cart').css('top','100px');
	$('.shopping_cart').css('left','100px');
	
	// Add cart2 for showing
	$('#gallery').before('<div class="shopping_cart2" style="top:80px; left:25%; position:absolute" >'+
    					'<p align="center" style="font-size:20px;"><strong>'+$.i18n.prop('Msg_58')+'</strong></p>'+
    					'<table width="650" border="0" align="center" cellpadding="0" cellspacing="0" id="table_sty">'+
    					'</table></div>');
    		
    // Check language and currency before add			
    simpleCart.bind( 'beforeAdd' , function( item ) {
    	//console.log(item.fields());
		if (item.fields().currency != simpleCart.currency().code) {
			alert($.i18n.prop('Msg_92'));
			return false;
		}
    });
  	
	// Update event of cart
	simpleCart.bind( 'update' , function() {
		// Clear table row
		$('#table_sty').html('');
		// Add table title
	    $('#table_sty').append('<tr><td width="5%" class="title">　</td>'+
	    					  '<td width="30%" class="title">'+$.i18n.prop('Msg_37')+'</td>'+
					          '<td width="20%" class="title">'+$.i18n.prop('Msg_38')+'</td>'+
					          '<td width="10%" class="title">'+$.i18n.prop('Msg_39')+'</td>'+
					          '<td width="20%" class="title">'+$.i18n.prop('Msg_40')+'</td>'+
					          '<td width="15%" class="title">&nbsp;</td></tr>');
					          
		// For each itemRow
		$('.itemRow').each(function(index) {

			$('#table_sty').append('<tr><td><img src="'+$(this).children('.item-image').html()+'" width="40" height="68" /></td>'+
								  '<td>'+$(this).children('.item-title').html()+'</td>'+
								  '<td>'+$(this).children('.item-price').html()+'</td>'+
								  '<td>'+$(this).children('.item-quantity').html()+'</td>'+
								  '<td>'+$(this).children('.item-total').html()+'</td>'+
								  '<td><img id="cart2_'+$(this).attr('id')+'" style="cursor:pointer" src="css/images/delete.png" width="18" height="18" /></td></tr>');
			
			var $thisItem = $(this);
			$('#cart2_'+$(this).attr('id')).click(function() {
					$thisItem.find('.simpleCart_remove').click();
			});
		});
		// Set bottom line
		$('#table_sty').append('<tr><td height="38" class="title">&nbsp;</td>'+
												  '<td class="title">&nbsp;</td>'+
										          '<td class="title">&nbsp;</td>'+
										          '<td class="title">&nbsp;</td>'+
										          '<td class="title">&nbsp;</td>'+
										          '<td class="title">&nbsp;</td></tr>');
		// Add summary line								          
		$('#table_sty').append('<tr><td colspan="4" class="amount">'+$.i18n.prop('Msg_59')+' '+$('.simpleCart_total').html()+'　</td>'+
												'<td style="border-bottom: none;"><div class="checkout">'+$.i18n.prop('Msg_60')+'</div></td></tr>');
												
			
		// Click chechout button
		$('.checkout').click(function(){
			releasePage('Gallery');
			newPage('Checkout');
		});
		
		$('.item-decrement').css('padding-right', '12px');
		$('.item-quantity').css('padding-right', '12px');
		$('.headerRow > .item-total').css('padding-left', '100px');	 
		
		// Adjust gallery top position
		$('#gallery').css('top', Math.round(parseInt($('.shopping_cart2').css('top')))+$('.shopping_cart2').height()+50+'px');
		
		// Check if anything in the cart
		if (simpleCart.grandTotal() == 0)
			$('.checkout').hide();
		else
			$('.checkout').show();
	});
	
	// Init Shopping Cart
	simpleCart.init();
	
	if($.cookie('user_id')) {
		$.post("db/retrive_gallery.php", 
				{ userid: $.cookie('user_id')
				},  
				function(data) {
					$('#gallery').append('<p align="center" style="font-size:20px;"><strong>'+$.i18n.prop('Msg_61')+'</strong></p>')
					
					var json = $.parseJSON(data);
					$.each(json, function(key, val) {
						// set currency
						var currency = '';
						if (val.currency == 'USD')
							currency = 'USD';
						else if (val.currency == 'NTD')
							currency = 'NTD';
						else
							currency = 'USD';
							
						$('#gallery').append('<div class="simpleCart_shelfItem">'+
						'<div class="list_pic"><img src="'+val.orig_img+'" alt="image" width="120" height="202"/></div>'+
						'<span class="item_image" style="display:none">'+val.orig_img+'</span>'+
						'<div class="list_txt"><p><strong class="item_title">'+val.title_name+'</strong><span class="item_name" style="display:none">'+val.s_name+'</span></p>'+
						'<p>'+val.phone_type+' / '+val.phone_color+'</p>'+
						'<p><span class="item_price">'+currency+val.price+'</span></p>'+
						'<span class="item_currency" style="display:none">'+currency+'</span>'+
						'<a class="item_add" href="javascript:;"><img src="css/images/add_shoppingcar.png" width="18" height="18" /></a></div>');

					});
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
		new Messi($.i18n.prop('Msg_62'), {title: $.i18n.prop('Msg_63'), modal: true});
		$wDiv.remove();
		return;
	}
	// Check if did not set title yet
	if (TITLE_NAME == '') {
		Messi.alert($.i18n.prop('Msg_64')+' <input type="text">', function(value, content){
			TITLE_NAME = content;
			saveImg();
		},{title: $.i18n.prop('Msg_63'), modal: true});
		$wDiv.remove();
		return;
	}
	
	$("body").append('<div id="progress-bar"><div id="status"></div></div>');
	$( "#progress-bar" ).css('position','fixed');
	$( "#progress-bar" ).css('z-index', '1001');
	$( "#progress-bar" ).css('top', '337px');
	$( "#progress-bar" ).css('left', layout_ox+40+'px');
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
	    		imgURL_h: $(e).children(".draggable").data('src_h'),
	    		zdx: $(e).children(".draggable").data('zdx'),
	    		zdy: $(e).children(".draggable").data('zdy'),
	    		zw: $(e).children(".draggable").data('zw'),
	    		zh: $(e).children(".draggable").data('zh')});
			
			setTimeout(process, 10);
		}
		else {
			$status.after('<br><span style="font-size: 16px; color: white">'+$.i18n.prop('Msg_65')+'...</span>');
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
					orig_img: resCanvas.toDataURL(),
					lang: MY_LANG},  
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
	
	var urlExists = function(url){
	    $.ajax({
	        type: 'HEAD',
	        url: url,
	        async: false,
	        success: function() {
	            return true;
	        },
	        error: function() {
	            return false;
	        }            
	    });
	}

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
				
				function getRemoteAgain() {
					console.log('ready to get again');
					var _data
					if (typeof e.imgURL_h == 'undefined') {
						_data = (e.imgURL.split("hotprintcloud.com/proxy/tmp/"))[1].replace(/\+/g, "\/");
					}
					else {
						_data = (e.imgURL_h.split("hotprintcloud.com/proxy/tmp/"))[1].replace(/\+/g, "\/");
					}
						
				    $.ajax({
				        type: "GET",
				        url: HOST_URL+"proxy/getImageData.php",
				        data: {url: _data},
				        async: false
				    });
				    console.log('get complete');
				}
				
				// getImageData again
				getRemoteAgain();

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
				if (typeof e.imgURL_h == 'undefined') {
					b.attr('src', e.imgURL);
					console.log('imgURL loading...'+e.imgURL);
				}
				else {
					b.attr('src', e.imgURL_h);
					console.log('imgURL_h loading...'+e.imgURL_h);
				}

				
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
				// Remove warning mark
				removeUnclearWarning($(this).parent().attr('id'));
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
		new Messi($.i18n.prop('Msg_66'), 
			{title: $.i18n.prop('Msg_67'), 
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
	//$('.layout_corner').html('');
	
	if ( $('.layout_corner').length ) {
		$('.layout_corner').children('.draggable').each(function(index) {
			removeUnclearWarning($(this).parent().attr('id'));
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
		
		var imgSrc;
		imgSrc = $(this).children(".draggable").attr('src');
	
		var divObj = $(this);
		// copy img url from gallery-pool object
		// Fixed url to hotprintCloud server
		var str = HOST_URL + TEMP_DIR + imgSrc.replace(/\//g, "+");
		$(this).children(".draggable").data('src', str);
		
		var str_h = HOST_URL + TEMP_DIR + $(this).children(".draggable").attr('delay_src_h').replace(/\//g, "+");
		$(this).children(".draggable").data('src_h', str_h);
		
		var spinner_color = '#000';
		if(PHONE_COLOR == 'black')
			spinner_color = '#FFF';
		
		var opts = {
		  lines: 13, // The number of lines to draw
		  length: 7, // The length of each line
		  width: 4, // The line thickness
		  radius: 10, // The radius of the inner circle
		  corners: 1, // Corner roundness (0..1)
		  rotate: 0, // The rotation offset
		  color: spinner_color, // #rgb or #rrggbb
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
		new Messi($.i18n.prop('Msg_68'), 
			{title: $.i18n.prop('Msg_69'), 
			 buttons: [{id: 0, label: 'Yes', val: 'Y'}, 
						{id: 1, label: 'No', val: 'N'}], 
			 callback: function(val, content) {  
			 	//console.log(val+','+content);
				if (val === 'Y') {
					if ( $('.layout_corner').length ) {
						$('.layout_corner').children('.draggable').each(function(index) {
							removeUnclearWarning($(this).parent().attr('id'));
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