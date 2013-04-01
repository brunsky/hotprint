<?php

include "db.inc";
include "setup.inc";

$userid = '13133377';
$code 	= '0SgN9GEw6vfMPZHt';
	
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
			
			// Check if due
			if (strtotime($time) > strtotime($result[0]['due'])) {
				echo json_encode(array("result"=>"fail","value"=>"due"));
			}
			else
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