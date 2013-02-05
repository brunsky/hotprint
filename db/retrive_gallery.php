<?php
include "db.inc";
include "setup.inc";

$db = new DB;
$connkey = $db->link_sip( "localhost", $DB_NAME, "root", "tomorrow");
if ($connkey) {

	$sql = sprintf(
        "SELECT title_name, phone_type, phone_color, orig_img, s_save, saveimag, price from gallery WHERE userid='%s'", 
        	mysql_real_escape_string($_POST["userid"])
		);
	
	$result = $db->sql($sql);	
	$data = array();
	for ($i=0; $i<count($result); $i++) {
		$pieces = explode(dirname(__FILE__), $result[$i]['orig_img']);
		$a = array( 'title_name'=> $result[$i]['title_name'],
					'phone_type'=> $result[$i]['phone_type'],
					'phone_color'=>$result[$i]['phone_color'],
					'orig_img'=>"/db".$pieces[1],
					's_save'=>$result[$i]['s_save'],
					'saveimag'=>$result[$i]['saveimag'],
					'price'=>$result[$i]['price']);
		array_push($data, $a);
	}
	echo json_encode($data);
}
?>