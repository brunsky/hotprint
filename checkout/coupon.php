<?php

include "db.inc";
include "setup.inc";

$userid = mysql_real_escape_string($_POST["userid"]);
$code 	= mysql_real_escape_string($_POST["code"]);
	
$db = new DB;
$connkey = $db->link_sip( "localhost", $DB_NAME, "root", "tomorrow");
if ($connkey) {
	
	$time = getdateinfo(2);

	$sql = sprintf(
        "SELECT * from coupon WHERE code='%s'", 
        	$code
		);
	
	$result = $db->sql($sql);	
	if($result != false) {
		if ($result[0]['userid'] == '') {// not yet been used
			/*
			$sql = sprintf(
        		"UPDATE coupon SET userid='%s', date='%s' WHERE code='%s'", 
        		mysql_real_escape_string($userid),
				$time,
				mysql_real_escape_string($code)
			);
			$result = $db->sql($sql);
			 
			 */
			echo json_encode(array("result"=>"ok","value"=>$result[0]['value']));
		}
		else
			echo json_encode(array("result"=>"fail","value"=>"used"));
	}
	else
		echo json_encode(array("result"=>"fail","value"=>"invalid"));
}
else {
	echo json_encode(array("result"=>"fail","value"=>"error")); 
}
?>