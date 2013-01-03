/*
 * Get instagram user ID
 */
 
 // Global settings
 var PHONE_NAME 	= 'iphone5';
 var LAYOUT_NAME 	= 'layout_3';
 var layout_x 		= 410;
 var layout_y 		= Math.floor($(window).height() * 0.1);
 var CORNER_OPT 	= 0.1;
 var isCornerFading = false;

  
  var _init
  ,   _getUserData
  ,   _displayUserData
  ,   _instaCrossLogin
  ,	  _instalogin
  ,	  _instalogout
  ,   _getUserRecent
  ,	  _facebookPhotoAlbum
  ,	  _fblogin
  ,	  _fblogout
  ,	  _logout
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
  
  _init = function(){
    
    // Remove no-js class
    $('html').removeClass('no-js');
    $('body').addClass('not-logged-in');
    $('#login').click(_instalogin);
    $('#login2').click(_fblogin);
    $('#facebook-source-login').click(_fblogin);
    $('#instagram-source-login').click(_instalogin);
  };
  
  function bindFunc() {
  	$('#save-design').unbind('click');
	$('#random-design').unbind('click');
	$('#clear-design').unbind('click');
	$('#start-design').unbind('click');
	$('#logout').unbind('click');
	
  	$('#save-design').bind('click',saveImg);
	$('#random-design').bind('click',randomDesign);
	$('#clear-design').bind('click',clearDesign);
	$('#start-design').bind('click',startDesign);
	$('#logout').bind('click',_logout);
  }
  
  _logout = function() {
  	$("body").append('<div class="modalOverlay"></div>');
  	_fblogout(_instalogout);
  	// Reset Design panel
  	setTimeout("location.reload()", 3000);
  }
  
  /*
   * 			Instagram code
   */
  
  var instaRes; // For total returning photos
  
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
   * Instagram: User login
   */
  _instalogin = function() {
  	window.open('https://instagram.com/oauth/authorize/?client_id=1e05a75f3b1548bbbdab2072bb0ed6e7&amp;redirect_uri=http://insta.camangiwebstation.com/instaredirect.html&amp;response_type=token', 'hotprintCloud', 'height=400,width=600,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=yes');
  	return false;
  };
  
  _instalogout = function(callback) {
	
  	$('.modalOverlay').html('<iframe src="https://instagram.com/accounts/logout/" width="0" height="0" onLoad="_fblogout">');

  }
  
  /*
   * Instagram: login interface
   */
  _instaCrossLogin = function(token){
    access_token = token;
    if (access_token === undefined) {
      $('body').addClass('not-logged-in');
    } else {
      $('body').addClass('logged-in');
	  _getUserData();
	  bindFunc();
	  source_type = "Instagram";
    }
  };
  
  /*
   * Instagram: Get user id
   */
  _displayUserData = function(json){
    $(".open").html("")
                .fadeIn(300)
                .append(json.data.username);
	user_id = json.data.id;
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
		instaRes += "<li><a href='"+json.data[i].images.standard_resolution.url+"'><img src=\""+json.data[i].images.standard_resolution.url+"\" id='recent_instaimg"+i+"' class='draggable draggable-h draggable-w gallery-pool' /></a></li>";
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
  _fblogin = function() {
	//clear photo of source 
	$('#facebook-source').html('');
  	FB.login(function(response) {
	  if (response.authResponse) {
	    source_type = "facebook";
	    access_token = response.authResponse.accessToken;
	    // login success
	    $('body').addClass('logged-in');
	    bindFunc();
		// get album list
		FB.api('/me?fields=albums,name', function(response) {
			// show user name
			$(".open").html("").fadeIn(300).append(response.name);
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
	  else
	  		$('body').addClass('not-logged-in');
	}, {scope: 'user_photos'});
  }
  
  _fblogout = function(callback) {
  	FB.logout(function(response) {
  		console.log('FB logout')
		if (typeof callback != 'undefined')
    		callback();
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
	          	fbRes += "<li><a href='"+image.link+"'><img src=\""+image.source+"\" id='recent_fbimg"+albumId+i+"' class='draggable draggable-h gallery-pool'/></a></li>";
	          else
	          	fbRes += "<li><a href='"+image.link+"'><img src=\""+image.source+"\" id='recent_fbimg"+albumId+i+"' class='draggable draggable-w gallery-pool'/></a></li>";
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
	
	/*選取動畫待研究*/
	/*
	$('.draggable').mouseenter(function(){
		$(this).animate({ top: $('#recent').css('top') }, 'fast');
	}).mouseleave(function(){
	});*/
	
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
	$( ".layout_corner" ).droppable({
		accept: ".draggable",
		tolerance: "pointer",
		drop: function( event, ui ) {
			// Prevent from drop into if spinning
			if ($(this).children(".spinner").length > 0) {
				return;
			}
			
			$('.layout_corner').droppable( "disable" );

			if ($(this).next()[0].tagName.toLowerCase() == 'canvas'.toLowerCase()) {
				$(this).next().remove();
				$(this).next()[0] = null;
			}

			// Don't copy yourself...
			if ($(ui.draggable).parent().attr('id') != $(this).attr('id')) {
				$(this).html('');
				$(this).append($(ui.draggable).clone());
				// clear source corner
				clearCorner($(ui.draggable).parent());
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
			
			// copy zoomer value
			$(this).children(".draggable").data('zdx', $(this).data('zdx'));
			$(this).children(".draggable").data('zdy', $(this).data('zdy'));
			$(this).children(".draggable").data('zw', $(this).data('zw'));
			$(this).children(".draggable").data('zh', $(this).data('zh'));
			// copy corner object
			$(this).children(".draggable").data('corner', $(this).data('corner'));
			// copy img url from gallery-pool object
			if ($(this).children(".draggable").attr('src').indexOf('http://') >= 0) {
				$(this).children(".draggable").data('src', $(this).children(".draggable").attr('src'));
			}
			// copy original size
			$(this).children(".draggable").data('oh', $(this).data('oh'));
			$(this).children(".draggable").data('ow', $(this).data('ow'));

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
					$('.layout_corner').droppable( "enable" );
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
					server: "http://insta.camangiwebstation.com/proxy/getImageData.php",
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
						$('.layout_corner').droppable( "enable" );	
					},
					error: function(xhr, text_status){
						spinner.stop();
						$('.layout_corner').droppable( "enable" );
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
			$(this).data('zdx', $(ui.draggable).data('zdx'));
			$(this).data('zdy', $(ui.draggable).data('zdy'));
			$(this).data('zw', $(ui.draggable).data('zw'));
			$(this).data('zh', $(ui.draggable).data('zh'));
			$(this).data('corner', $(ui.draggable).data('corner'));
			$(this).data('ow', $(ui.helper)[0].width);
			$(this).data('oh', $(ui.helper)[0].height);
		},
		deactivate: function(event, ui) {
			$(this).removeData('zdx');
			$(this).removeData('zdy');
			$(this).removeData('zw');
			$(this).removeData('zh');
			$(this).removeData('corner');
			$(this).removeData('ow');
			$(this).removeData('oh');
		}
	});
}

// load phone canvas in menu
function menuLoadPhone(_phoneName) {
	PHONE_NAME = _phoneName;
	setCanvas(_phoneName);
	
	if(_phoneName === 'iphone5') {
		$('#menu_type').html('iPhone 5').fadeIn(300);
	}
	else if(_phoneName === 'iphone4') {
		$('#menu_type').html('iPhone 4/4S').fadeIn(300);
	}
	else if(_phoneName === 's3') {
		$('#menu_type').html('S3').fadeIn(300);
	}
	else if(_phoneName === 'onex') {
		$('#menu_type').html('HTC One X').fadeIn(300);
	}
}

// load layout in menu
function menuLoadLayout(_layoutName) {
	LAYOUT_NAME = _layoutName;
	loadLayout(maskImg, layout_ox, layout_oy, PHONE_NAME+'_'+LAYOUT_NAME);
	
	if(_layoutName === 'layout_1') {
		$('#menu_layout').html('layout 1').fadeIn(300);
	}
	else if(_layoutName === 'layout_2') {
		$('#menu_layout').html('layout 2').fadeIn(300);
	}
	else if(_layoutName === 'layout_3') {
		$('#menu_layout').html('layout 3').fadeIn(300);
	}
	else if(_layoutName === 'layout_4') {
		$('#menu_layout').html('layout 4').fadeIn(300);
	}
	else if(_layoutName === 'layout_5') {
		$('#menu_layout').html('layout 5').fadeIn(300);
	}
	else if(_layoutName === 'layout_6') {
		$('#menu_layout').html('layout 6').fadeIn(300);
	}
	else if(_layoutName === 'layout_7') {
		$('#menu_layout').html('layout 7').fadeIn(300);
	}
	else if(_layoutName === 'layout_8') {
		$('#menu_layout').html('layout 8').fadeIn(300);
	}
	else if(_layoutName === 'layout_9') {
		$('#menu_layout').html('layout 9').fadeIn(300);
	}
	else if(_layoutName === 'layout_10') {
		$('#menu_layout').html('layout 10').fadeIn(300);
	}
	else if(_layoutName === 'layout_11') {
		$('#menu_layout').html('layout 11').fadeIn(300);
	}
	else if(_layoutName === 'layout_12') {
		$('#menu_layout').html('layout 12').fadeIn(300);
	}
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
    //$('#wrapper').css('width',$(window).width()+'px');  
}  
  
function setFooterTop(){  
    var winH=$(window).height();   
    $('.recent').css('top',winH-$('.recent').height()+$(document).scrollTop()+'px');  
    $('.recent').css('width',$(window).width()+'px');  
	$('.ad-gallery').css('width',($(window).width()-50)+'px');
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
    layout_oy = Math.floor(winH * 0.1);
    layout_ox = 410;
    $("#mCanvas").css('top', layout_oy+'px');
    $("#mCanvas").css('left', layout_ox+'px'); 

    var a = new Image();
	a.src = "images/"+_phoneName+".png";
	a.onload = function(){
		$("#mCanvas")[0].width = a.width;
        $("#mCanvas")[0].height = a.height;
        context.drawImage(a, 0, 0, a.width, a.height);
    };

	// Get mask image    
    $.getImageData({
        url: "http://insta.camangiwebstation.com/images/"+_phoneName+"_mask.png",
        server: "http://insta.camangiwebstation.com/proxy/getImageData.php",
        success: function(image){
        	// Load Layout
        	//layout_oy = parseInt($("#mCanvas").css('top'), 10);
        	//layout_ox = parseInt($("#mCanvas").css('left'), 10);
        	console.log("Get "+_phoneName+", "+layout_ox+', '+layout_oy);
        	maskImg = image;
        	menuLoadLayout(LAYOUT_NAME);
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
		newPage('Gallery');
	});
	/*
	mod_saving_for_host(function() {		
		releasePage('Design');
		newPage('Gallery');
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
	releasePage('Gallery');
	newPage('Design');
}


/*
 * Create Page from given page name
 * page: "Design", "Gallery"
 */
function newPage(page) {
	if (page == "Design") {
		$('#menubar').fadeIn(300);
		$('.recent').fadeIn(300);
		setCanvas(PHONE_NAME);
		if (source_type == 'facebook') {
			_fblogin();
		}
		else if (source_type == 'Instagram') {
			_instalogin();
		}
	}
	else if (page == "Gallery") {
		$('.buybutton').fadeIn(300);
		$('#cart').fadeIn(300);
	}
}

/*
 * release Page from given page name
 * page: "Design", "Gallery"
 */
function releasePage(page) {
	if (page == "Design") {
		$('#random-design').hide();
		$('#clear-design').hide();
		$('#start-design').fadeIn(300);
		$('#save-design').hide();
		$('#menubar').hide();
		$('#mCanvas').remove();
		$('#mCanvas')[0] = null;
		
		$('.recent').find('.draggable').each(function(index) {
			$(this).remove();
		  	$(this)[0] = null;
		});		
		$('.recent').hide();
		$('.ad-preloads').remove();
		$('.ad-preloads')[0] = null;

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
	else if (page == "Gallery") {
		$('#random-design').fadeIn(300);
		$('#clear-design').fadeIn(300);
		$('#save-design').fadeIn(300);
		$('#start-design').hide();
	
		$('#galleryCanvas').remove();
		$('#galleryCanvas')[0] = null;
		$('.buybutton').hide()
		$('#cart').hide();
	}
}

/*
 * Initialize on DOM Ready
 */ 
$(function(){
	// For direfox, to dealing with wrong dragging position
	if (navigator.userAgent.indexOf("Firefox")!=-1) {
		$('body').css('overflow', 'auto');
	}

	setAccordionMenu();
	setContainer();
	setFooterTop();
	// Create phone case canvas and layout
	menuLoadPhone(PHONE_NAME);
	
	var cart = $('#cart').DCAJAXPaypalCart({  
            width:600,  
            height:400,  
            autoOpenWhenAdd:true,
            openNewCheckOutWindow:true,
            header:'Shopping Cart',
            footer:'We accpet paypal, visa and master card.',
            paypalOptions:{  
                business:'will@camangi.com',
                page_style:'digicrafts'
            }  
        }); 
    cart.addBuyButton("#buy_onex_case",{
            name:'One X',                  // Item name appear on the cart
            thumbnail:'css/images/move.png',
            price:'34.99',                // Cost of the item
            shipping: '0'                 // Shipping cost for the item (Optional)
        });
		
    $.instagramr();
    
    $('#start-design').hide();
    
     $('#popbox').popbox();
});

$(window).resize(function() { setContainer();setFooterTop()}); 
$(window).scroll(function() { setFooterTop(); console.log($(document).height())});

// If browser didn't support console, then set it empty !
if (!window.console) window.console = {};
if (!window.console.log) window.console.log = function () { };