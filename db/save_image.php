<?php

include "db.inc";
include "setup.inc";

$userid 		= $_POST["userid"];
$user_type 		= $_POST["user_type"];
$title_name		= $_POST["title_name"];
$saveimag		= $_POST["saveimag"];
$phone_type		= $_POST["phone_type"];
$layout_no		= $_POST["layout_no"];
$phone_color	= $_POST["phone_color"];
$orig_img		= $_POST['orig_img'];
$lang			= $_POST['lang'];

$db = new DB;
$connkey = $db->link_sip( "localhost", $DB_NAME, "root", "tomorrow");
if ($connkey) {
	$price = '';
	$currency = '';
	// Retrive price from db
	$sql = sprintf("SELECT * FROM bom WHERE part_name='%s'", mysql_real_escape_string($phone_type));
	$res = $db->sql($sql);
	if ($lang == 'en') {
		$price = $res[0]['price'];
		$currency = 'USD';
	}
	else if ($lang == 'tw') {
		$price = $res[0]['price_TW'];
		$currency = 'NTD';
	}
	else {
		$price = $res[0]['price'];
		$currency = 'USD';
	}
	
	
	$time = getdateinfo(2);
	$filename = dirname(__FILE__) . "/user/" . $userid ."_".$time.".png";
	
	// 隨機配出額外的編號
 	$nkey_array = array("A","m","3","B","n","6","C","o","x","1","D","p","5","E","q","y","0","F","r","8","G","s","z","7","H","t","4","I","u","9","J","v","2","K","l","w");
 	srand();
 	for ($k=1;$k<=7;$k++) $random = $random.$nkey_array[rand(0,34)];
 	// 製成訂單號碼 = 年月日時分秒 + 7碼亂碼
 	$s_name = $title_name."_".$time.$random;
	
	$sql = sprintf(
        "INSERT INTO gallery (userid, user_type, title_name, s_name, saveimag, phone_type, layout_no, phone_color, orig_img, price, currency, s_save) VALUES ('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s')",
        mysql_real_escape_string($userid ),
        mysql_real_escape_string($user_type),
        mysql_real_escape_string($title_name),
        mysql_real_escape_string($s_name),
        mysql_real_escape_string($saveimag),
        mysql_real_escape_string($phone_type),
        mysql_real_escape_string($layout_no),
        mysql_real_escape_string($phone_color),
        $filename,
        $price,
        $currency,
		$time
		);

	$result = $db->sql($sql);	

	$data = $orig_img;
	//removing the "data:image/png;base64," part
	$uri =  substr($data,strpos($data,",")+1);
	// put the data to a file
	file_put_contents($filename, base64_decode($uri));
}


?>