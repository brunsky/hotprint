<?php

include "db.inc";

	// Get the data
	//$imageData=$GLOBALS['HTTP_RAW_POST_DATA'];
	
$db = new DB;
$connkey = $db->link_sip( "localhost", "hotprint", "root", "tomorrow");
if ($connkey) {
	$time = getdateinfo(2);
	$sql = sprintf(
        "INSERT INTO gallery (userid, saveimag, time) VALUES ('%s', '%s', '%s')",
        mysql_real_escape_string($_POST["userid"]),
        mysql_real_escape_string($_POST["saveimag"]),
		$time
		);
	$result = $db->sql($sql);	

}


?>