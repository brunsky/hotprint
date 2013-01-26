/*
 * Get instagram user ID
 */
 
 // Global settings
 var SANDBOX		= true;
 var HOST_URL		= '';
 if (SANDBOX)
 	HOST_URL		= 'http://sandbox.hotprintcloud.com/';
 else
 	HOST_URL		= 'http://www.hotprintcloud.com/';
 var TEMP_DIR		= 'proxy/tmp/'
 var PHONE_NAME 	= 'iphone5';
 var LAYOUT_NAME 	= 'layout_3';
 var PHONE_COLOR	= 'white';
 var layout_ox 		= 410;
 var layout_oy 		= Math.floor($(window).height() * 0.1);
 var CORNER_OPT 	= 0.1;
 var isCornerFading = false;
 var PAGE			= 'Design';
 var TITLE_NAME		= '';
 var maskImg;
  
  var _init
  ,   _getUserData
  ,   _displayUserData
  ,   _instaCrossLogin
  ,	  _instalogin
  ,	  _instalogout
  ,   _getUserRecent
  ,	  _facebookPhotoAlbum
  ,	  _fblogin
  ,	  _fbCrossLogin
  ,	  _fblogout
  ,	  _logout
  ,	  _loadLayout
  ;
  
  var access_token
  ,   user_id
  ,	  source_type
  ;
 
(function(){
 
  $.extend({
    instagramr: function(){
      _init();
    }
  });
  
  _init = function() {
    // Remove no-js class
    $('html').removeClass('no-js');
    $('body').addClass('not-logged-in');
    // connect button and operations
    $('#login').click({isPopup: false}, _instalogin);
    $('#login2').click({isPopup: false}, _fblogin);
    $('#facebook-source-login').click({isPopup: true}, _fblogin);
    $('#instagram-source-login').click({isPopup: true}, _instalogin);
    $('.layout_item').each(function(index) {
     	$(this).click({param: $(this).attr('id')}, _loadLayout);
    });
    $('.phone_item').each(function(index) {
     	$(this).click({param: $(this).attr('id')}, _loadPhone);
    });
    $('.color_item').each(function(index) {
     	$(this).click({param: $(this).attr('id')}, _loadColor);
    });
    // Check if instagram has login already
    if (location.hash != '') {
	    var token_item = location.hash.split('&')[0];
	    var source_item = location.hash.split('&')[1];
	    if (source_item) {
		    if (source_item.split('=')[1] == 'instagram')
			    _instaCrossLogin(token_item.split('=')[1]);
			else if(source_item.split('=')[1] == 'facebook')
				_fbCrossLogin(token_item.split('=')[1]);
			else {
				$.removeCookie('source');
  				$.removeCookie('access_token');
				parent.location.hash = '';
				return;
			}
			parent.location.hash = '';
			$.cookie('access_token', token_item.split('=')[1]);
		}
		else {
			$.removeCookie('source');
  			$.removeCookie('access_token');
		}
	}
	else {
		$.removeCookie('source');
  		$.removeCookie('access_token');
	}
  };
  
  function _loadLayout(event) {
  	menuLoadLayout(event.data.param);
  }
  
  function _loadPhone(event) {
  	menuLoadPhone(event.data.param);
  }
  
  function _loadColor(event) {
  	menuLoadColor(event.data.param);
  }
  
  function bindFunc() {
  	$('#save-design').unbind('click');
	$('#random-design').unbind('click');
	$('#clear-design').unbind('click');
	$('#start-design').unbind('click');
	$('#my-gallery').unbind('click');
	$('#logout').unbind('click');
	$('#go-to-my-gallery').unbind('click');
	
  	$('#save-design').bind('click',saveImg);
	$('#random-design').bind('click',randomDesign);
	$('#clear-design').bind('click',clearDesign);
	$('#start-design').bind('click',startDesign);
	$('#my-gallery').bind('click',openGallery);
	$('#logout').bind('click',_logout);
	$('#go-to-my-gallery').bind('click',openGallery);
  }
  
  _logout = function() {
  	$("body").append('<div class="modalOverlay"></div>');
  	$.removeCookie('source');
  	$.removeCookie('access_token');
  	$.removeCookie('user_id');
  	$.removeCookie('phone_name');
  	$.removeCookie('layout_name');
  	$.removeCookie('phone_color');
  	_fblogout(_instalogout);
  	// Reset Design panel
  	//setTimeout("location.reload()", 3000);
  }
  
  /*
   * 			Instagram code
   */
  
  var instaRes; // For total returning photos
  
  /*
   * Instagram: User login
   */
  _instalogin = function(event) {
  	var url = 'https://instagram.com/oauth/authorize/?'+
  							'client_id=48fb462fd1254631a2c63416a01eb3f0'+
  							'&amp;redirect_uri='+HOST_URL+'instaredirect.html'+
  							'&amp;response_type=token';
  	if (event.data.isPopup == true) {
  		window.open(url,'hotprintCloud', 
  						'height=400,width=600,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=yes');
  		return false;
  	}
  	else
  		window.location = url;
  };
  
  _instalogout = function(callback) {
  	$.ajax({
	    url: 'https://instagram.com/accounts/logout/',
	    dataType: 'jsonp',
	    error: function(xhr) {
	      	location.reload();
	    },
	    success: function(response) {
		  	location.reload();
	    }
  });
  }
  
  /*
   * Instagram: login interface
   */
  _instaCrossLogin = function(token) {
  	
      access_token = token;
      source_type = "instagram";
      if ($.cookie('source') == null)
      	$.cookie('source', source_type);
      $('body').addClass('logged-in');
	  _getUserData();
	  bindFunc();
  };
  
  /*
   * Instagram: Get token
   */
  
  _getUserData = function(){
    
    var request = $.ajax({
      dataType: "jsonp",
      url: "https://api.instagram.com/v1/users/self",
      data: {
        access_token: access_token
      }
    });
    request.success(_displayUserData);
    
  };
  
  /*
   * Instagram: Get user id
   */
  _displayUserData = function(json) {
    
	user_id = json.data.id;
	if ($.cookie('source') == 'instagram') {
		$.cookie('user_id', user_id);
		$.cookie('user_type', 'instagram');
		$(".open").html("")
                .fadeIn(300)
                .append(json.data.username);
	}
	instaRes = '';
	_getUserRecent();
  };
  
  /*
   * Instagram: Call photos API & disable facebook albums if any.
   */
  _getUserRecent = function(next_url) {
  	
  	if ($('#fbalbums').length > 0)
  		$('#fbalbums').attr('disabled', 'disabled');
  		
  	var url;
  	if(next_url != null) 
  		url = next_url;
  	else
  		url = "https://api.instagram.com/v1/users/"+user_id+"/media/recent";
  		
	var request = $.ajax({
      dataType: "jsonp",
      url: url,
      data: {
        access_token: access_token,
		count: 100
      }
    });
    request.success(_displayUserRecent);
	
  };
     
	/*
	 * Instagram: Get photos
	 */
  _displayUserRecent = function(json){
	
	for(var i=0; i<json.data.length; i++) {
		instaRes += "<li><a><img src=\""+json.data[i].images.standard_resolution.url+"\" id='recent_instaimg"+i+"' class='draggable draggable-h draggable-w gallery-pool' /></a></li>";
	}
	if (typeof json.pagination.next_url != 'undefined')
		_getUserRecent(json.pagination.next_url);
	else
		gallery_bar_setting(instaRes);
  };
    
  /*
   * 			facebook code
   */
  
  var fbRes; // For total returning photos
    
  /*
   * facebook: Login process
   */
  _fblogin = function(event) {
  	
  	var url = 'http://www.facebook.com/dialog/oauth/?'+
	    'client_id=396030097155221'+
	    '&redirect_uri='+HOST_URL+'fbredirect.html'+
	    '&response_type=token'+
	    '&scope=user_photos';
	if (event.data.isPopup == true) {
		window.open(url,'hotprintCloud', 
					'height=600,width=800,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=yes');
		return false;
	}
	else
  		window.location = url;
  }
  
  /*
   * Instagram: login interface
   */
  _fbCrossLogin = function(token){
  		//clear photo of source 
  		$('#facebook-source').html('');
  		access_token = token;
  		source_type = "facebook";
  		if ($.cookie('source') == null)
      		$.cookie('source', source_type);
    	$('body').addClass('logged-in');
	  	bindFunc();
	  	
	  	// get album list
		FB.api('/me?access_token='+access_token+'&fields=albums,id,name', function(response) {
			user_id = response.id;
			if ($.cookie('source') == 'facebook') {
				$.cookie('user_id', user_id);
				$.cookie('user_type', 'facebook');
				// show user name
				$(".open").html("").fadeIn(300).append(response.name);
			}
			
			// create albumn selection drop box		                
		  	$select = $('<select></select>');
		  	$select.attr('id','fbalbums');
		  	$.each(response.albums.data, function(key, value) {   
			     $select
			         .append($("<option></option>")
			         .attr("value",value.id)
			         .text(value.name)); 
			});
			$('#facebook-source').append($select);
			  	
		  	$select.change(function(){
		  		// Clear gallery pool at first
		  		$('.recent').find('.draggable').each(function(index) {
					$(this).remove();
				  	$(this)[0] = null;
				});		
				fbRes = '';
		  		_facebookPhotoAlbum();
		  	});
			
			// setup photos after getting albums 
			fbRes = '';
			_facebookPhotoAlbum();
		});

  }
  
  _fblogout = function(callback) {
  	FB.getLoginStatus(function(response) {
  		if (response.status === 'connected') {
  			FB.logout(function(response) {
		  		console.log('FB logout');
				if (typeof callback != 'undefined')
		    		callback();
			});
  		}
  		else {
  			if (typeof callback != 'undefined')
		    	callback();
  		}
  	});
  	
  }
  
  /*
   * facebook: Get photos
   */
  _facebookPhotoAlbum = function( next_url ) {  

    var settings = $.extend( {
      'facebookAlbumId' : $('#fbalbums :selected').val(),
      'photoLimit'       : '500',
      'randomOrder'      : 'false'
    });

      var albumId = settings.facebookAlbumId;
      var photoLimit = settings.photoLimit;
      var randomOrder = settings.randomOrder;
      var url;
      if (next_url != null)
      	url = next_url+"&callback=?";
      else
      	url = "https://graph.facebook.com/"+albumId+"/photos?access_token="+access_token+"&limit=0&callback=?";

      $.getJSON(url, function success(result) {
      	
      		if ($('#fbalbums').length > 0)
      			$('#fbalbums').attr('disabled', false);

	        var limit = photoLimit;
	        if(result.data.length < limit) {
	        	limit = result.data.length;
	        }
	        
	        for(i=0; i<limit; i++)
	        {
	          var image = result.data[i];
	          if (image.width > image.height)
	          	fbRes += "<li><a><img src=\""+image.source+"\" id='recent_fbimg"+albumId+i+"' class='draggable draggable-h gallery-pool'/></a></li>";
	          else
	          	fbRes += "<li><a><img src=\""+image.source+"\" id='recent_fbimg"+albumId+i+"' class='draggable draggable-w gallery-pool'/></a></li>";
	        }
			// Check if any more photos to get
			if (typeof result.paging != 'undefined') {
				if (typeof result.paging.next != 'undefined')
					_facebookPhotoAlbum(result.paging.next);
				else
					gallery_bar_setting(fbRes);
			}
			else
	        	gallery_bar_setting(fbRes);
        
      });

  };
  
})(jQuery);

/*
 * Put photos into gallery pool & make its draggable settings
 */
function gallery_bar_setting(res) {
	$(".ad-thumb-list").html("")
                .fadeIn(300)
                .append(res);
				
	$('.ad-gallery').adGallery({thumb_opacity: 1});
	$('.ad-gallery').css('width',($(window).width()-50)+'px');
	$('.ad-gallery').css({
		"margin": '0 auto',
		"-webkit-touch-callout": "none",
		"-webkit-user-select": "none",
		"-khtml-user-select": "none",
		"-moz-user-select": "none",
		"-ms-user-select": "none",
		"user-select": "none"
	});
	
	// Selection animation ,Just support webkit based browser 
	if (!$.browser.msie) {
		$('.gallery-pool').hover(function(){
			$(this).css('opacity', 0);
			var $c = $(this).clone();
			$c.css({
				"left": $(this).position().left,
				"top": $(this).position().top,
				"width": $(this).css('width'),
				"height": $(this).css('height'),
				"position": "absolute",
				"opacity": 1,
				"box-shadow": "3px 3px 4px black",
				"pointer-events": "none"
			});		
			$(this).after($c);
			$c.animate({ top: '-=20', left: '-=5', width: '+=10', height: '+=10'}, 'fast');
		}, function(){
			$(this).css('opacity', 1);
			$(this).next().remove();
		});
	}

	$('.gallery-pool').draggable({
		scroll: false,
		cursor: 'move', 
		helper: "clone", 
		cursorAt: { left: 35, top: 35 },
		revert: "invalid",
		drag: function(event, ui) {
			ui.helper.css('z-index','1000');
			ui.helper.css('opacity','0.7');
			if ($(this).attr("class").indexOf("ui-draggable-dragging") >= 0) {
				$(".ui-draggable-dragging").css('z-index','1000');
			}
			ui.helper.height($(this).data('oh'));
			ui.helper.width($(this).data('ow'));
		},
		start: function(event, ui) {
			disable_scroll();
			$('.layout_corner').css('z-index', '998');
			$('.layout_corner').stop(true, true).animate({ opacity: 1});
			$(this).data('oh', Math.round($(this).height()*0.7));
			$(this).data('ow', Math.round($(this).width()*0.7));
		},
		stop: function(event, ui) {
			enable_scroll();
			isCornerFading = true;
			$('.layout_corner').animate({ opacity: CORNER_OPT},
				{complete:  function() { 
					$('.layout_corner > .draggable').parent().css('opacity', '0');
					isCornerFading = false;
				} 
			});
		}
	});
}

////////////////////////////

function clearCorner(pObj) {
	if (typeof pObj.attr('class') == 'undefined')
		return;
		
	if (pObj.attr('class').indexOf('layout_corner') >= 0) {
		pObj.children(".draggable").each(function(index) {
		  	$(this).remove();
		  	$(this)[0] = null;
		});
		
		pObj.css('cursor', 'default');
		if (pObj.next().attr('class') == 'canvas_appended')
			if (pObj.next()[0].tagName.toLowerCase() == 'canvas'.toLowerCase()) {
				pObj.next().remove();
				pObj.next()[0] = null;
			}
		pObj.removeClass("removed");
		pObj.css('z-index','998');
		$('.layout_corner').animate({ opacity: CORNER_OPT},
			{complete:  function() { 
				$('.layout_corner > .draggable').parent().css('opacity', '0');
			} 
		});
	}
}

// Define Drag&Drop
function setDnD(maskImg, ox, oy) {
	
	var _copyData = function(toObj, fromObj) {
		// copy zoomer value
		toObj.data('zdx', fromObj.data('zdx'));
		toObj.data('zdy', fromObj.data('zdy'));
		toObj.data('zw', fromObj.data('zw'));
		toObj.data('zh', fromObj.data('zh'));
		// copy corner object
		toObj.data('corner', fromObj.data('corner'));
		// copy img url from gallery-pool object
		if (typeof toObj.attr('src') != 'undefined' && 
			(toObj.attr('src').indexOf('http://') >= 0 ||
			toObj.attr('src').indexOf('https://') >= 0)) {
			// Fixed url to hotprintCloud server
			var str = HOST_URL + TEMP_DIR + toObj.attr('src').replace(/\//g, "+");
			toObj.data('src', str);
		}
		else {
			toObj.data('src', fromObj.data('src'));
		}
		console.log('toObj zdx:'+toObj.data('zdx'));
		console.log('toObj src:'+toObj.data('src'));
		// copy original size
		toObj.data('oh', fromObj.data('oh'));
		toObj.data('ow', fromObj.data('ow'));
	}
			
	$( ".layout_corner" ).droppable({
		accept: ".draggable",
		tolerance: "pointer",
		drop: function( event, ui ) {
			
			// if doubled copy then drop here abandoned!
			if (typeof $(ui.draggable).parent().attr('id') == 'undefined') {
				return;
			}

			// Prevent from drop into if spinning
			
			if ($(this).children(".spinner").length > 0) {
				console.log('spinning!');
				return;
			}
			
			$(this).droppable( "disable" );
			
			enable_scroll();

			if ($(this).next()[0].tagName.toLowerCase() == 'canvas'.toLowerCase()) {
				$(this).next().remove();
				$(this).next()[0] = null;
			}
			//console.log('Flight#'+$(ui.draggable).attr('id')+' from: '+$(ui.draggable).parent().attr('id')+' will drop at airport:'+$(this).attr('id'));
			// Don't copy yourself...
			if ($(ui.draggable).parent().attr('id') != $(this).attr('id')) {
				$(this).html('');
				$(this).append($(ui.draggable).clone());
				_copyData( $(this).children(".draggable"), $(ui.draggable));
				// clear source corner
				clearCorner($(ui.draggable).parent());
			}
			else {
				var $_tmpObj = $('<img>');
				_copyData($_tmpObj, $(ui.draggable));
				$(this).html('');
				$(this).append($(ui.draggable).clone());
				_copyData($(this).children(".draggable"), $_tmpObj);
			}

			$(this).children(".draggable").removeClass("gallery-pool");	
			// if it is draged from gallery list then don't animate corner
			if (isCornerFading == false) {
				$('.layout_corner').animate({ opacity: CORNER_OPT},
					{complete:  function() { 
						$('.layout_corner > .draggable').parent().css('opacity', '0');
					} 
				});
			}

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
			
			if ($(this).children(".draggable").attr("class").indexOf("cached") >= 0) {
				// get image from cached
				var _img = new Image();
				
				if (typeof divObj.children(".draggable").data('zdx') != 'undefined') { // if image has been scaled
					var $dstCanvas = $('<canvas>');
					$dstCanvas[0].width = parseInt(divObj.css('width'), 10) + parseInt(divObj.css('border-left-width'), 10);
					$dstCanvas[0].height = parseInt(divObj.css('height'), 10) + parseInt(divObj.css('border-left-width'), 10);
					autoClipper2(divObj.children(".draggable")[0], $dstCanvas, 
								divObj.children(".draggable").data('corner'), divObj);
					_img.src = $dstCanvas[0].toDataURL();
					_img.width = $dstCanvas[0].width;
					_img.height = $dstCanvas[0].height;
				}
				else {
					_img.src = imgSrc;
				}
				
				_img.onload = function() { // very important here. you need to wait for loading
					if (divObj.attr("class").indexOf("layout_circle") >= 0) {
						doClipping( 
							doMasking(_img, maskImg, divObj, ox, oy), 
							divObj, 
							cirClipper);	
					}
					else if (divObj.attr("class").indexOf("layout_square") >= 0) {
						doClipping( 
							doMasking(_img, maskImg, divObj, ox, oy), 
							divObj, 
							boxClipper);
					}
					divObj.css('opacity', '0');
					setDragObj(divObj);
					divObj.droppable( "enable" );
				}
				
			}
			else {		// get image from original URL
			
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
						if (divObj.attr("class").indexOf("layout_circle") >= 0) {
							doClipping( 
								doMasking(image, maskImg, divObj, ox, oy), 
								divObj, 
								cirClipper);	
						}
						else if (divObj.attr("class").indexOf("layout_square") >= 0) {
							doClipping( 
								doMasking(image, maskImg, divObj, ox, oy), 
								divObj, 
								boxClipper);
						}
						spinner.stop();
						divObj.css('opacity', '0');
						setDragObj(divObj);				
						divObj.droppable( "enable" );	
					},
					error: function(xhr, text_status){
						spinner.stop();
						divObj.droppable( "enable" );
						console.log("Fail to get image:"+imgSrc);
					}
				});
			}
		},
		out: function(event, ui) {
			if ($(this).children(".draggable").length > 0 ) { 
				if ($(this).children(".draggable").attr("class").indexOf("ui-draggable-dragging") >= 0)
					$(this).addClass("removed");
			}
		},
		over: function(event, ui) {
			/*
			$(this).data('zdx', $(ui.draggable).data('zdx'));
			$(this).data('zdy', $(ui.draggable).data('zdy'));
			$(this).data('zw', $(ui.draggable).data('zw'));
			$(this).data('zh', $(ui.draggable).data('zh'));
			$(this).data('src', $(ui.draggable).data('src'));
			$(this).data('corner', $(ui.draggable).data('corner'));
			$(this).data('ow', $(ui.helper)[0].width);
			$(this).data('oh', $(ui.helper)[0].height);*/
		},
		deactivate: function(event, ui) {
			/*
			$(this).removeData('zdx');
			$(this).removeData('zdy');
			$(this).removeData('zw');
			$(this).removeData('zh');
			$(this).removeData('src');
			$(this).removeData('corner');
			$(this).removeData('ow');
			$(this).removeData('oh');*/
		}
	});
}

// load phone canvas in menu
function menuLoadPhone(_phoneName) {
	var change_phone = function(_phoneName) {
		PHONE_NAME = _phoneName;
		$.cookie('phone_name', PHONE_NAME);
		$('.device').find('.hovered').toggleClass('hovered');
		$('#'+_phoneName).parent().toggleClass('hovered');
		if(_phoneName === 'iphone5') {
			$('#menu_type').html('iPhone 5').fadeIn(300);
			$('#white.color_item').parent().show();
			$('#black.color_item').parent().show();
			$('#trans.color_item').parent().show();
		}
		else if(_phoneName === 'iphone4') {
			$('#menu_type').html('iPhone 4/4S').fadeIn(300);
			PHONE_COLOR = 'white';
			$.cookie('phone_color', PHONE_COLOR);
			$('#menu_color').html('白色').fadeIn(300);
			$('#white.color_item').parent().show();
			$('#black.color_item').parent().hide();
			$('#trans.color_item').parent().hide();
		}
		else if(_phoneName === 's3') {
			$('#menu_type').html('Galaxy S3').fadeIn(300);
			if(PHONE_COLOR == 'black') {
				PHONE_COLOR = 'white';
				$.cookie('phone_color', PHONE_COLOR);
				$('#menu_color').html('白色').fadeIn(300);
			}
			$('#white.color_item').parent().show();
			$('#black.color_item').parent().hide();
			$('#trans.color_item').parent().show();	
		}
		else if(_phoneName === 'onex') {
			$('#menu_type').html('HTC One X').fadeIn(300);
			if(PHONE_COLOR == 'black') {
				PHONE_COLOR = 'white';
				$.cookie('phone_color', PHONE_COLOR);
				$('#menu_color').html('白色').fadeIn(300);
			}
			$('#white.color_item').parent().show();
			$('#black.color_item').parent().hide();
			$('#trans.color_item').parent().show();
		}
		// reset color for highlight
		$('.color').find('.hovered').toggleClass('hovered');
		$('#'+PHONE_COLOR).parent().toggleClass('hovered');
		
		setCanvas(_phoneName);
	}
	if ($('.canvas_appended').length != 0 ) {
		$("body").append('<div class="modalOverlay"></div>');
		new Messi('你確定要切換手機嗎？所有的圖片將會被清空！', 
			{title: '切換手機', 
			 buttons: [{id: 0, label: 'Yes', val: 'Y'}, 
						{id: 1, label: 'No', val: 'N'}], 
			callback: function(val) {  
				$('.modalOverlay').remove();
				$('.layout_corner').animate({ opacity: CORNER_OPT});
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
					change_phone(_phoneName);
				}
			}});
	}
	else
		change_phone(_phoneName);
}

// Change phone color in menu
function menuLoadColor(_phoneColor) {
	var change_color = function(_phoneColor) {
		PHONE_COLOR = _phoneColor;
		$.cookie('phone_color', PHONE_COLOR);
		setCanvas(PHONE_NAME);
		$('.color').find('.hovered').toggleClass('hovered');
		$('#'+_phoneColor).parent().toggleClass('hovered');
		if(_phoneColor === 'white') {
			$('#menu_color').html('白色').fadeIn(300);
		}
		else if(_phoneColor === 'black') {
			$('#menu_color').html('黑色').fadeIn(300);
		}
		else if(_phoneColor === 'trans') {
			$('#menu_color').html('透明').fadeIn(300);
		}
	}
	if ($('.canvas_appended').length != 0 ) {
		$("body").append('<div class="modalOverlay"></div>');
		new Messi('你確定要切換背蓋顏色嗎？所有的圖片將會被清空！', 
			{title: '切換背蓋顏色', 
			 buttons: [{id: 0, label: 'Yes', val: 'Y'}, 
						{id: 1, label: 'No', val: 'N'}], 
			callback: function(val) {  
				$('.modalOverlay').remove();
				$('.layout_corner').animate({ opacity: CORNER_OPT});
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
					change_color(_phoneColor);
				}
			}});
	}
	else
		change_color(_phoneColor);
}

// load layout in menu
function menuLoadLayout(_layoutName) {
	
	var change_layout = function(_layoutName) {
		LAYOUT_NAME = _layoutName;
		$.cookie('layout_name', LAYOUT_NAME)
		loadLayout(maskImg, layout_ox, layout_oy, PHONE_NAME+'_'+LAYOUT_NAME);
		// Display layout name in menu
		$('#menu_layout').html(_layoutName.replace('_', ' ')).fadeIn(300);
		$('.layout').find('.hovered').toggleClass('hovered');
		$('#'+_layoutName).toggleClass('hovered');
	}
	
	if ($('.canvas_appended').length != 0 ) {
		$("body").append('<div class="modalOverlay"></div>');
		new Messi('你確定要切換版型嗎？所有的圖片將會被清空！', 
			{title: '切換版型', 
			 buttons: [{id: 0, label: 'Yes', val: 'Y'}, 
						{id: 1, label: 'No', val: 'N'}], 
			callback: function(val) {  
				$('.modalOverlay').remove();
				$('.layout_corner').animate({ opacity: CORNER_OPT});
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
					change_layout(_layoutName);
				}
			}});
	}
	else
		change_layout(_layoutName);
}

// (ox, oy) is the position of case image
function loadLayout(_maskImg, ox , oy, _layoutName){ 

	// Cleanup
	$('.layout_corner').each(function(index) {
	  	$(this).remove();
	  	$(this)[0] = null;
	});

	$('.canvas_appended').each(function(index) {
	  	$(this).remove();
	  	$(this)[0] = null;
	});

    $("link[type='text/css']#layout_css").remove();
    //Import CSS
    var cssFile = jQuery("<link>");
    cssFile.attr({
      rel:  "stylesheet",
      type: "text/css",
      href: "css/"+_layoutName+".css?v="+(new Date()).getTime(),
      id: "layout_css"
    });   

    $("head").append(cssFile);
	// Import layout js
	styleOnload(cssFile[0],function() {
		var layoutLocation = "js/"+_layoutName+".js?v="+(new Date()).getTime();
		$.getScript(layoutLocation)
			.done(function(data, textStatus, jqxhr) {
				setDnD(maskImg, ox, oy); // Define Drag&Drop
			})
			.fail(function(data, textStatus, jqxhr) {
				console.log('load layout.js failed');
			});

	});
}

function setContainer(){  
    var winH=$(window).height();  
    var docH=$(document).height(); 
    $('#wrapper').css('height',winH-$('.recent').height()+'px');  
	
	// Fix width of mainmenu at 1224px
    if ($(document).width() <= 1224)
    	$(".mainmenu").css('width', '1224px');
    else
    	$(".mainmenu").css('width', '100%');
}  
  
function setFooterTop(){  
	$('#tip1').css('left', Math.round(parseInt($('#popbox > .open').offset().left, 10))-60);
	$('#tip3').css('left', Math.round(parseInt($('#popbox > .open').offset().left, 10))-60);
    //$('.recent').css('width',$(document).width()+'px');
	//$('.ad-gallery').css('width',($(document).width()-70)+'px');

}

function setCanvas(_phoneName) {
	
	if($('#mCanvas').length > 0) {
		$('#mCanvas').remove();
		$('#mCanvas')[0];
	}
	
    var canvas = document.createElement('Canvas');
    canvas.setAttribute('id', 'mCanvas');
    var context = canvas.getContext('2d');
    $('.mainmenu').before(canvas);

	var winH=$(window).height();
	var winW=$(window).width(); 
    //layout_oy = Math.floor(winH * 0.1);
    //layout_ox = Math.floor(winW * 0.3);//410;
    layout_oy = 66;
    layout_ox = 404;
    $("#mCanvas").css('top', layout_oy+'px');
    $("#mCanvas").css('left', layout_ox+'px'); 
    
    //Define title
	$('.mTitle').fadeIn(3000);
	
    var a = new Image();
	a.src = "images/"+_phoneName+"_"+PHONE_COLOR+".png";
	a.onload = function(){
		$("#mCanvas")[0].width = a.width;
        $("#mCanvas")[0].height = a.height;
        context.drawImage(a, 0, 0, a.width, a.height);
    };

	// Get mask image    
    $.getImageData({
        url: HOST_URL+"images/"+_phoneName+"_mask.png",
        server: HOST_URL+"proxy/getImageData.php",
        success: function(image){
        	// Load Layout
        	//layout_oy = parseInt($("#mCanvas").css('top'), 10);
        	//layout_ox = parseInt($("#mCanvas").css('left'), 10);
        	console.log("Get "+_phoneName+", "+layout_ox+', '+layout_oy);
        	maskImg = image;
        	menuLoadLayout(LAYOUT_NAME);
        	loadPriceTag(true);
        },
        error: function(xhr, text_status){
            console.log("Failed to get "+_phoneName+": "+text_status);
        }
    });
}

function setAccordionMenu() {
	// Store variables		
	var accordion_head = $('.accordion > li > a'),
		accordion_body = $('.accordion li > .sub-menu');

	// Open the first tab on load

	accordion_head.first().addClass('active').next().slideDown('normal');

	// Click function

	//accordion_head.on('click', function(event) {
	accordion_head.click(function(event) {
		// Disable header links
		
		event.preventDefault();

		// Show and hide the tabs on click

		if ($(this).attr('class') != 'active'){
			accordion_body.slideUp('normal');
			$(this).next().stop(true,true).slideToggle('normal');
			accordion_head.removeClass('active');
			$(this).addClass('active');
		}
	});
}

/*
 * Load external library
 */
/*
function loadLib(path) {
	var layoutLocation = path;
	$.getScript(layoutLocation)
		.done(function(data, textStatus, jqxhr) {
			console.log('load '+path+' OK');
		})
		.fail(function(data, textStatus, jqxhr) {
			console.log('load '+path+' failed');
		})
}
*/

/*
 * Store the image for output
 */
function saveImg() {
	
	mod_saving(function() {		
		releasePage('Design');
		newPage('Save');
	});
	/*
	mod_saving_for_host(function() {		
		releasePage('Design');
		newPage('Save');
	});
	*/
}

/*
 * Generize random design
 */
function randomDesign() {
	mod_randesign();
}

/*
 * Enter design page
 */
function startDesign() {
	releasePage(PAGE);
	newPage('Design');
}

/*
 * Enter gallery page from save page
 */
function openGallery() {
	releasePage(PAGE);
	newPage('Gallery');
}


/*
 * Create Page from given page name
 * page: "Design", "Gallery"
 */
function newPage(page) {
	PAGE = page;
	if (page == "Design") {
		$('#menubar').fadeIn(300);
		$('.recent').fadeIn(300);
		$('#random-design').fadeIn(300);
		$('#clear-design').fadeIn(300);
		$('#save-design').fadeIn(300);
		setCanvas(PHONE_NAME);
		if (source_type == 'facebook') {
			_fbCrossLogin(access_token);
		}
		else if (source_type == 'instagram') {
			_instaCrossLogin(access_token);
		}
		
		// TITLE_NAME should be cleared here!
		$('#mTitle').html(TITLE_NAME);
		// Initialize title again
		$('#mTitle').editable(function(value, settings) { 
		     TITLE_NAME = $.trim(value);
		     return(TITLE_NAME);
		  },{
		 	onblur : "submit",
		 	placeholder : "未命名",
		 	tooltip : "請輸入名稱"
		 });
	}
	else if (page == "Save") {

		$('#start-design').fadeIn(300);
		$('#my-gallery').fadeIn(300);
	}
	else if (page == "Gallery") {
		$('#start-design').fadeIn(300);
		mod_gallery();
	}
}

/*
 * release Page from given page name
 * page: "Design", "Gallery", "Save"
 */
function releasePage(page) {
	if (page == "Design") {
		$('#random-design').hide();
		$('#clear-design').hide();
		$('#save-design').hide();
		$('#menubar').hide();
		$('#mCanvas').remove();
		$('#mCanvas')[0] = null;
		$('#mTitle').html('');
		
		$('.recent').find('.draggable').each(function(index) {
			$(this).remove();
		  	$(this)[0] = null;
		});		
		$('.recent').hide();
		$('.ad-preloads').remove();
		$('.ad-preloads')[0] = null;
		
		loadPriceTag(false);

		if ( $('.layout_corner').length ) {
			
			$('.layout_corner').children('.draggable').each(function(index) {
		  		$(this).remove();
			  	$(this)[0] = null;
			});
			
			$('.layout_corner').each(function(index) {
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
	else if (page == "Save") {
		$('#start-design').hide();
		$('#my-gallery').hide();
		$('#galleryCanvas').remove();
		$('#galleryCanvas')[0] = null;
	}
	else if (page == "Gallery") {
		$('#start-design').hide();
		$('#gallery').remove();
		$('#gallery')[0] = null;
		$('.shopping_cart').remove();
		$('.shopping_cart')[0] = null;
	}
}

function loadPriceTag(isShow) {
	if (isShow == true) {
		$('#price_tag').show();
		$('#price_tag').css('left', 370+layout_ox+'px');
		$('#price_tag').css('top', 80+layout_oy+'px');
	}
	else
		$('#price_tag').hide();
}

/*
 * Initialize on DOM Ready
 */ 
$(function(){
	// For firefox, to dealing with wrong dragging position
	if (navigator.userAgent.indexOf("Firefox")!=-1) {
		$('body').css('overflow', 'auto');
	}

    // Check browser version
    $("body").iealert({
		support: "ie8",
		title: "您的瀏覽器版本太老舊了!",
		text: "為了更好、更安全的使用體驗 <br>請<font color=\"red\">立即更新</font>您的瀏覽器吧。",
		upgradeTitle: "立即更新"
	});
	
	setAccordionMenu();
	setContainer();
	setFooterTop();
	// Create phone case canvas and layout
	if ($.cookie('phone_name'))
		PHONE_NAME = $.cookie('phone_name');
	if ($.cookie('phone_color')) {
		PHONE_COLOR = $.cookie('phone_color');
		if(PHONE_COLOR === 'white') {
			$('#menu_color').html('白色').fadeIn(300);
		}
		else if(PHONE_COLOR === 'black') {
			$('#menu_color').html('黑色').fadeIn(300);
		}
		else if(PHONE_COLOR === 'trans') {
			$('#menu_color').html('透明').fadeIn(300);
		}
	}
	if($.cookie('layout_name'))
        LAYOUT_NAME = $.cookie('layout_name');
	menuLoadPhone(PHONE_NAME);
	
	// Init Shopping Cart
	simpleCart({
	    cartColumns: [
	        { view: function( item , column ){
        		return "<span>"+item.get('name')+"</span>"
  				} , attr: "name" , label: "名稱" } ,
	        { attr: "price" , label: "價格", view: 'currency' } ,
	        { view: "decrement" , label: false , text: "-" } ,
	        { view: function( item , column ){
        		return "<span class='item_qty'>"+item.quantity()+"</span>"
  				} , attr: "quantity" , label: "數量" } ,
	        { view: "increment" , label: false , text: "+" } ,
	        { view: function( item , column ){
        		return "<span>"+simpleCart.toCurrency(item.get('total'))+"</span>"
  				} ,attr: "total" , label: "小計" } ,
	        { view: "remove" , text: "全部清除" , label: false }
	    ]
  	});
  	
  	//Setup title
	$('#mTitle').editable(function(value, settings) { 
	     TITLE_NAME = $.trim(value);
	     return(TITLE_NAME);
	  },{
	 	onblur : "submit",
	 	placeholder : "未命名",
	 	tooltip : "請輸入名稱"
	 });
	
    $.instagramr();
    
    $('#start-design').hide();
    $('#my-gallery').hide();
    
    $('#popbox').popbox();

});

$(window).resize(function() { setContainer();setFooterTop()}); 
$(window).scroll(function() { setFooterTop();});

// If browser didn't support console, then set it empty !
if (!window.console) window.console = {};
if (!window.console.log) window.console.log = function () { };