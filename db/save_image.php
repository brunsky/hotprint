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

$db = new DB;
$connkey = $db->link_sip( "localhost", $DB_NAME, "root", "tomorrow");
if ($connkey) {
	
	// Retrive price from db
	$sql = sprintf("SELECT * FROM bom WHERE part_name='%s'", mysql_real_escape_string($phone_type));
	$res = $db->sql($sql);
	$price = $res[0]['price'];
	
	$time = getdateinfo(2);
	$filename = dirname(__FILE__) . "/user/" . $userid ."_".$time.".png";
	$sql = sprintf(
        "INSERT INTO gallery (userid, user_type, title_name, saveimag, phone_type, layout_no, phone_color, orig_img, price, s_save) VALUES ('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s')",
        mysql_real_escape_string($userid ),
        mysql_real_escape_string($user_type),
        mysql_real_escape_string($title_name),
        mysql_real_escape_string($saveimag),
        mysql_real_escape_string($phone_type),
        mysql_real_escape_string($layout_no),
        mysql_real_escape_string($phone_color),
        $filename,
        $price,
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