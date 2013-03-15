<?php
include "db.inc";
include "setup.inc";

$db = new DB;
$connkey = $db->link_sip( "localhost", $DB_NAME, "root", "tomorrow");
if ($connkey) {

	$sql = sprintf(
        "SELECT * from order_list WHERE userid='%s' AND payment IS NOT NULL", 
        	mysql_real_escape_string($_POST["userid"])
		);
	
	$result = $db->sql($sql);	
	$data = array();
	for ($i=0; $i<count($result); $i++) {
		$a = array( 'order_no'=> $result[$i]['order_no'],
					'c_time_local'=> $result[$i]['c_time_local'],
					'payment'=> $result[$i]['payment'],
					'detail'=> $result[$i]['detail']);
		array_push($data, $a);
	}
	echo json_encode($data);
}
?>