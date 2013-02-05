<?php

include "db.inc";
include "setup.inc";
	
$db = new DB;
$connkey = $db->link_sip( "localhost", $DB_NAME, "root", "tomorrow");
if ($connkey) {

	$sql = sprintf(
        "SELECT * from coupon WHERE code='%s'", 
        	mysql_real_escape_string($_POST["code"])
		);
	
	$result = $db->sql($sql);	
	if($result != false)
		echo json_encode(array("result"=>"ok","value"=>$result[0]['value']));
	else
		echo json_encode(array("result"=>"fail","value"=>""));
}
else {
	echo json_encode(array("result"=>"fail","value"=>"")); 
}
?>