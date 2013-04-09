<?
include "setup.inc";
include "db.inc";

// DB摰��,�典��閮剖�
$db = new DB; // ��� ecar DB
$connkey_billing = $db->link_sip( "localhost", $DB_NAME, "root", "tomorrow");
if ($connkey_billing) {
	
	header("Content-type:application/vnd.ms-excel");  
	header("Content-Disposition:filename=test.csv");
	
	echo "code,";
	echo "value,";
	echo "currency,";
	echo "due date\t\n";
	
	for($i=0; $i<20; $i++) {
		$c = substr(md5(uniqid()),1,12);
		$v = '900';
		$curr = 'NTD';
		$due = '2013-04-30 23:00:00:00';
		$sql = sprintf("INSERT INTO coupon (code, value, currency, due) VALUES ('%s', '%s', '%s', '%s')",
				$c, $v, $curr, $due);
		$db->sql($sql);
		echo $c.",";
		echo $v.",";
		echo $curr.",";
		echo $due."\t\n";
	}
	
	 
}
?>