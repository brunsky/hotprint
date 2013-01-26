<?php

include "db.inc";
include "setup.inc";

	// Get the data
	//$imageData=$GLOBALS['HTTP_RAW_POST_DATA'];
	
$db = new DB;
$connkey = $db->link_sip( "localhost", $DB_NAME, "root", "tomorrow");
if ($connkey) {
	$time = getdateinfo(2);
	$filename = dirname(__FILE__) . "/user/" . $_POST["userid"]."_".$time.".png";
	$sql = sprintf(
        "INSERT INTO gallery (userid, user_type, title_name, saveimag, phone_type, layout_no, phone_color, orig_img, s_save) VALUES ('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s')",
        mysql_real_escape_string($_POST["userid"]),
        mysql_real_escape_string($_POST["user_type"]),
        mysql_real_escape_string($_POST["title_name"]),
        mysql_real_escape_string($_POST["saveimag"]),
        mysql_real_escape_string($_POST["phone_type"]),
        mysql_real_escape_string($_POST["layout_no"]),
        mysql_real_escape_string($_POST["phone_color"]),
        $filename,
		$time
		);
	$result = $db->sql($sql);	

	$data = $_POST['orig_img'];
	//removing the "data:image/png;base64," part
	$uri =  substr($data,strpos($data,",")+1);
	// put the data to a file
	file_put_contents($filename, base64_decode($uri));
}


?>