<?php
include "db.inc";
include "setup.inc";
	// Get the data
	//$imageData=$GLOBALS['HTTP_RAW_POST_DATA'];
	
$db = new DB;
$connkey = $db->link_sip( "localhost", $DB_NAME, "root", "tomorrow");
if ($connkey) {

	$sql = sprintf(
        "SELECT phone_type, phone_color, layout_no, orig_img, s_save, saveimag from gallery WHERE userid='%s' AND s_save='%s'", 
        	mysql_real_escape_string($_POST["userid"]), $_POST["s_save"]
		);
	
	$result = $db->sql($sql);	
	$data = array();
	for ($i=0; $i<count($result); $i++) {
		$pieces = explode(dirname(__FILE__), $result[$i]['orig_img']);
		$a = array('phone_type'=> $result[$i]['phone_type'],
					'phone_color'=>$result[$i]['phone_color'],
					'layout_no'=>$result[$i]['layout_no'],
					'orig_img'=>"/db".$pieces[1],
					's_save'=>$result[$i]['s_save'],
					'saveimag'=>$result[$i]['saveimag']);
		array_push($data, $a);
	}
	echo json_encode($data);
}
?>