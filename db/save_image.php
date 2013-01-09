<?php

include "db.inc";

	// Get the data
	//$imageData=$GLOBALS['HTTP_RAW_POST_DATA'];
	
$db = new DB;
$connkey = $db->link_sip( "localhost", "hotprint", "root", "tomorrow");
if ($connkey) {
	$time = getdateinfo(2);
	$sql = sprintf(
        "INSERT INTO gallery (userid, user_type, saveimag, phone_type, layout_no, phone_color, s_save) VALUES ('%s', '%s', '%s', '%s', '%s', '%s', '%s')",
        mysql_real_escape_string($_POST["userid"]),
        mysql_real_escape_string($_POST["user_type"]),
        mysql_real_escape_string($_POST["saveimag"]),
        mysql_real_escape_string($_POST["phone_type"]),
        mysql_real_escape_string($_POST["layout_no"]),
        mysql_real_escape_string($_POST["phone_color"]),
		$time
		);
	$result = $db->sql($sql);	

}


?>