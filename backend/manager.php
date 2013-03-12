<?php
	session_start();
	if ($_SESSION['login'] == '') {
		if ($_POST['account'] == 'mark' && $_POST['password'] == '13133377') {
			$_SESSION['login'] = 'yes';
		}
	}
?>
<!DOCTYPE html>
<head>
  <meta charset="utf-8" />
  <meta name="description" content="">
  <link rel="shortcut icon" href="../images/favicon.ico">
  <link rel="stylesheet" href="../css/screen.css" type="text/css" id="main_css" media="screen" charset="utf-8">
  <link rel="stylesheet" type="text/css" href="../lib/jquery.ad-gallery.css">
  <link rel="stylesheet" href="../lib/messi.min.css" />
  <link rel='stylesheet' href='../lib/popbox.css' type='text/css' />
  <link rel="stylesheet" type="text/css" href="../lib/iealert/style.css" />
  <script src="http://www.google.com/jsapi?key="></script>
  <script>
    google.load("jquery", "1.5");
  </script>
  <script src="../lib/LAB.min.js"></script>
  <script>
  	$LAB
  	.script("http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.23/jquery-ui.min.js").wait()
  	.script("../lib/iealert.min.js")
  	.script("../js/jquery.ui.touch-punch.min.js")
  	.script("../js/jquery.corner.js")
  	.script("../js/canvasMask.min.js")
  	.script("../js/jquery.getimagedata.js")
  	.script("../js/jquery.jsonp.min.js")
  	.script("../js/jcarousellite_1.0.1.min.js")
  	.script("../lib/jquery.ad-gallery.js")
  	.script("../js/spin.min.js")
  	.script("../lib/messi.js")
  	.script("../lib/popbox.js")
  	.script("../lib/jquery.cookie.js")
  	.script("../lib/simpleCart.js")
  	.script("../lib/jquery.jeditable.js")
  	.script("../lib/jquery.creditCardValidator.js")
  	.script("../js/mapping.min.js?v="+(new Date()).getTime())
  	.script("../js/clipping.min.js?v="+(new Date()).getTime())
  	.script("../js/extention.min.js?v="+(new Date()).getTime());
  	
  	// Preparing UI
  	function init(obj) {
  		var detail = $.parseJSON(obj);
  		console.log(detail);
  	}
  	
  </script>
  <title>後台管理介面</title>
</head>
<html>
<body>
	
<?php
	if ($_SESSION['login'] == 'yes') {
		include "db.inc";
		include "setup.inc";
		
		$db = new DB;
		$connkey = $db->link_sip( "localhost", $DB_NAME, "root", "tomorrow");
		if ($connkey) {
			
			if ($_POST['order_no'] != '') {
				$sql = "SELECT * from order_list where order_no='".$_POST['order_no']."'";
				$result = $db->sql($sql);	
				
				$obj = json_decode($result[0]['detail']);
				$total = (int)$obj->{'itemCount'};
				
				echo '
						<table border="1">
						<tr>
						<td width="5%" class="title"> </td>
		    			<td width="15%" class="title">設計編號</td>
						<td width="5%" class="title">數量</td>
						<td width="15%" class="title">小計</td>
						<td width="30%" class="title">寄送資訊</td>
						<td width="10%" class="title">登入型態</td>
						<td width="10%" class="title">帳號名稱</td>
						<td width="10%" class="title">帳號 id</td>
						</tr>
				
				';
				
				for ($i=0; $i<$total; $i++) {
					$item_name = $obj->{'item_name_'.(string)($i+1)};
					$item_quantity = $obj->{'item_quantity_'.(string)($i+1)};
					$item_price = $obj->{'item_price_'.(string)($i+1)};
					$shipping = $obj->{'shipping_addr'}.','.$obj->{'shipping_city'}.','.$obj->{'shipping_country'}
								.','.$obj->{'shipping_name'}.','.$obj->{'shipping_email'};
					$login_from = $obj->{'type'};
					$name = $obj->{'storename'};
					$account_id = $obj->{'userid'};
					$total_price = $obj->{'total'};
					
					echo '<tr><td><input type="radio" name="s_name" value="'.$item_name.'"><br></td>'
						 .'<td>'.$item_name .'</td>'
						 .'<td>'.$item_quantity .'</td>'
						 .'<td>'.$item_price.'</td>'
						 .'<td>'.$shipping.'</td>'
						 .'<td>'.$login_from .'</td>'
						 .'<td>'.$name.'</td>'
						 .'<td>'.$account_id.'</td></tr>';
				}
				echo '</table>總計：'.$total_price.'<br>'; 
				echo '<input type="submit" value="產生原圖" onClick=\'init('.json_encode($result[0]['detail']).')\'>';
				echo '<form action="manager.php"><input type="submit" value="回到列表"></form>';
				
				
			}
			else {
				echo '<form action="manager.php" method="post">
						<table border="1">
						<tr>
						<td width="5%" class="title"> </td>
		    			<td width="15%" class="title">訂單編號</td>
						<td width="10%" class="title">使用者id</td>
						<td width="15%" class="title">建立時間(server)</td>
						<td width="15%" class="title">建立時間(使用者端)</td>
						<td width="10%" class="title">是否已付費</td>
						<td width="15%" class="title">付費時間</td>
						<td width="15%" class="title">來源IP</td>
						</tr>
				
				';
			
				$sql = "SELECT * from order_list";
				$result = $db->sql($sql);	
				for ($i=0; $i<count($result); $i++) {
					echo '<tr><td><input type="radio" name="order_no" value="'.$result[$i]['order_no'].'"><br></td>'
						 .'<td>'.$result[$i]['order_no'].'</td>'
						 .'<td>'.$result[$i]['userid'].'</td>'
						 .'<td>'.$result[$i]['c_time'].'</td>'
						 .'<td>'.$result[$i]['c_time_local'].'</td>'
						 .'<td>'.$result[$i]['payment'].'</td>'
						 .'<td>'.$result[$i]['s_time'].'</td>'
						 .'<td>'.$result[$i]['ip'].'</td></tr>';
				}
				
				echo '</table><input type="submit" value="取得詳細資訊"/></form>';
				
			}
			
		}
	}
	else {
		echo '			
			<form action="manager.php" method="post">
			帳號: <input type="text" name="account"><br>
			密碼: <input type="text" name="password"><br>
			  <input type="submit" value="Submit">
			</form>';
	}

?>

</body>
</html>
