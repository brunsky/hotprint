<?php

include "db.inc";
include "setup.inc";

$part_name = mysql_real_escape_string($_POST["part_name"]);
$lang = mysql_real_escape_string($_POST["lang"]);
	
$db = new DB;
$connkey = $db->link_sip( "localhost", $DB_NAME, "root", "tomorrow");
if ($connkey) {

	$sql = sprintf(
        "SELECT * from bom WHERE part_name='%s'", 
        	mysql_real_escape_string($_POST["part_name"])
		);
	
	$result = $db->sql($sql);	
	if($result != false) {
		if ($lang == "en")
			echo json_encode(array("result"=>"ok","value"=>$result[0]['price']));
		else if ($lang == "tw")
			echo json_encode(array("result"=>"ok","value"=>$result[0]['price_TW']));
		else
			echo json_encode(array("result"=>"ok","value"=>$result[0]['price']));
	}
	else
		echo json_encode(array("result"=>"fail","value"=>""));
}
else {
	echo json_encode(array("result"=>"fail","value"=>"")); 
}
?>