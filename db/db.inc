<?
    
  error_reporting(0);
  
include "mime_mail.inc";
include "smtp_mail.inc";

  class DB {

        var $sip;					// ��Ʈw��m
        var $db_name;					// ��Ʈw�W��
        var $link;					// ��Ʈw�s�����

        // �����Ʈw�s��
        function link_sip($sip, $d_name, $u, $p) {
                $this->db_name = $d_name;

                $this->link = mysql_connect($sip, $u, $p);
                if ($this->link) return 1;
                else return 0;
        }
	
	// ����s��
        function release_db() {
                mysql_close($this->link);
        }


	// �e�Xsql��O�æ^�ǰ��浲�G
        function sql($str) {
                 $result = mysql_db_query($this->db_name, $str, $this->link);
		 // ���p�o�ӫ�O���ݦ^�ǰ��浲�G�h�������� 
                 if ($result == false) return false;

		 // �N���G�s���}�C�æ^��
               	 for($i=0;  $row = mysql_fetch_array($result); $i++) {
                       	 $ret[$i] = $row;
                 }
                 return $ret;
        }


        // �^�Ǹ���`��
       function rows($t_name, $condition)
       {
			$str = "SELECT * FROM $t_name $condition";
			$result = mysql_db_query($this->db_name, $str, $this->link);
			if (!$result) return 0;
			return mysql_num_rows($result);
       }

  }
  
/*
	��o�î榡�Ƥ����T
	
  	$mode 0: 12 digit
  	$mode 1: 8  digit
  */
  function getdateinfo($mode) {
	

	$now_date=date("YmdHis");
	$now_date_y=substr("$now_date",0,4);
	$now_date_m=substr("$now_date",4,2);
	$now_date_d=substr("$now_date",6,2);
	$now_date_h=substr("$now_date",8,2);
	$now_date_i=substr("$now_date",10,2);	
	$now_date_s=substr("$now_date",12,2);	

	
	switch($mode) {
	case '0':          // �~���ɤ�                        
		$now = "$now_date_y"."$now_date_m"."$now_date_d"."$now_date_h"."$now_date_i";
	break;
	case '1':	         // �~���
		$now = "$now_date_y"."$now_date_m"."$now_date_d";
	break;
	case '2':          // �~���ɤ���              
		$now = "$now_date_y"."$now_date_m"."$now_date_d"."$now_date_h"."$now_date_i"."$now_date_s";
	break;
	case '3':          // �~����                        
		$now = "$now_date_y"."$now_date_m"."$now_date_d"."$now_date_h";
	break;
	case '4':          // �~��                        
		$now = "$now_date_y"."$now_date_m";
	break;
	case '5':          // �~                        
		$now = "$now_date_y";
	break;
	case '6':          // �~-��-�� ��:��                        
		$now = "$now_date_y"."-"."$now_date_m"."-"."$now_date_d"." "."$now_date_h".":"."$now_date_i";
	break;
	case '7':	         // �~-��-��
		$now = "$now_date_y"."-"."$now_date_m"."-"."$now_date_d";
	break;
	case '8':          // �~-��-�� ��:��:��              
		$now = "$now_date_y"."-"."$now_date_m"."-"."$now_date_d"." "."$now_date_h".":"."$now_date_i".":"."$now_date_s";
	break;
	case '9':          // �~-��-�� ��                        
		$now = "$now_date_y"."-"."$now_date_m"."-"."$now_date_d"." "."$now_date_h";
	break;
	case '10':          // �~-��                        
		$now = "$now_date_y"."-"."$now_date_m";
	break;
	case '11':          // �~                        
		$now = "$now_date_y";
	break;
	}
	
	return $now;
}
 
function send_message_to_admin($message) {
						
	$today = getdateinfo(2);
						
	$smtp_server="msa.hinet.net"; // hinet
										
	$from="CamangiTalk@camangi.com";
	$to="richar@camangi.com";
	$subject = "$message - $today";
	$body = "$message - $today";
	$mail=new mime_mail;
	$mail->from=$from;
	$mail->to=$to;
	$mail->subject=$subject;
	$mail->body=$body;
	$data=$mail->get_mail();
	$smtp=new smtp_mail;
	$smtp->send_email($smtp_server, $from, $to, $data);
}

function send_message_to_any($from,$to,$subject,$body) {
						
	$smtp_server="msa.hinet.net"; // hinet
										
	$mail=new mime_mail;
	$mail->from=$from;
	$mail->to=$to;
	$mail->subject=$subject;
	$mail->body=$body;
	$data=$mail->get_mail();
	$smtp=new smtp_mail;
	$smtp->send_email($smtp_server, $from, $to, $data);
}

    function PMA_formatByteDown($value, $limes = 6, $comma = 0)
    {
        $dh           = pow(10, $comma);
        $li           = pow(10, $limes);
        $return_value = $value;
        $unit         = "Bytes";

        if ($value >= $li*1000000) {
            $value = round($value/(1073741824/$dh))/$dh;
            $unit  = "GB";
        }
        else if ($value >= $li*1000) {
            $value = round($value/(1048576/$dh))/$dh;
            $unit  = "MB";
        }
        else if ($value >= $li) {
            $value = round($value/(1024/$dh))/$dh;
            $unit  = "KB";
        }
        if ($unit != $GLOBALS['byteUnits'][0]) {
            $return_value = number_format($value, $comma, $GLOBALS['number_decimal_separator'], $GLOBALS['number_thousands_separator']);
        } else {
            $return_value = number_format($value, 0, $GLOBALS['number_decimal_separator'], $GLOBALS['number_thousands_separator']);
        }

        return array($return_value, $unit);
    } // end of the 'PMA_formatByteDown' function


function date_sec($start) {
  $start_date_y=substr($start,0,4);
  $start_date_m=substr($start,5,2);
  $start_date_d=substr($start,8,2);
  $start_date_h=substr($start,11,2);
  $start_date_i=substr($start,14,2);
  $start_date_s=substr($start,17,2);
  $result = gmmktime($start_date_h,$start_date_i,$start_date_s,$start_date_m,$start_date_d,$start_date_y);
  return $result;  
}
function date_date($start,$end) {
  $end_date_y=substr($end,0,4);
  $end_date_m=substr($end,5,2);
  $end_date_d=substr($end,8,2);
  $end_date_h=substr($end,11,2);
  $end_date_i=substr($end,14,2);
  $end_date_s=substr($end,17,2);
  $end_sec = gmmktime($end_date_h,$end_date_i,$end_date_s,$end_date_m,$end_date_d,$end_date_y);
  $start_date_y=substr($start,0,4);
  $start_date_m=substr($start,5,2);
  $start_date_d=substr($start,8,2);
  $start_date_h=substr($start,11,2);
  $start_date_i=substr($start,14,2);
  $start_date_s=substr($start,17,2);
  $start_sec = gmmktime($start_date_h,$start_date_i,$start_date_s,$start_date_m,$start_date_d,$start_date_y);
  $result = $end_sec - $start_sec;
  return $result;
}

function date_addsec($start,$addsec,$mode) {
  $start_date_y=substr($start,0,4);
  $start_date_m=substr($start,5,2);
  $start_date_d=substr($start,8,2);
  $start_date_h=substr($start,11,2);
  $start_date_i=substr($start,14,2);
  $start_date_s=substr($start,17,2);
  $start_sec = gmmktime($start_date_h,$start_date_i,$start_date_s,$start_date_m,$start_date_d,$start_date_y);
  $date_sec = $start_sec + $addsec;  
  
	switch($mode) {
	case '0':          // �~-��-�� ��:��:��                        
		$result = gmstrftime("%Y-%m-%d %H:%M:%S", $date_sec);
    break;
	case '1':	         // �~���ɤ��� 
		$result = gmstrftime("%Y%m%d%H%M%S", $date_sec);
	  break;
	}
  return $result;
  
}

function date_delsec($start,$delsec,$mode) {
  $start_date_y=substr($start,0,4);
  $start_date_m=substr($start,5,2);
  $start_date_d=substr($start,8,2);
  $start_date_h=substr($start,11,2);
  $start_date_i=substr($start,14,2);
  $start_date_s=substr($start,17,2);
  $start_sec = gmmktime($start_date_h,$start_date_i,$start_date_s,$start_date_m,$start_date_d,$start_date_y);
  $date_sec = $start_sec - $delsec;
  
	switch($mode) {
	case '0':          // �~-��-�� ��:��:��                        
		$result = gmstrftime("%Y-%m-%d %H:%M:%S", $date_sec);
    break;
	case '1':	         // �~���ɤ��� 
		$result = gmstrftime("%Y%m%d%H%M%S", $date_sec);
	  break;
	}  
  return $result;
}

function month2number($month_str) {
  $month_number['Jan'] = '1';
  $month_number['Feb'] = '2';
  $month_number['Mar'] = '3';
  $month_number['Apr'] = '4';
  $month_number['May'] = '5';
  $month_number['Jun'] = '6';
  $month_number['Jul'] = '7';
  $month_number['Aug'] = '8';
  $month_number['Sep'] = '9';
  $month_number['Oct'] = '10';
  $month_number['Nov'] = '11';
  $month_number['Dec'] = '12';

  return $month_number[$month_str];
}

function pwd_hidden($str) {

	$len = strlen($str);
	for($i=0;$i<$len-4;$i++) {
		$str = substr_replace($str,'*',$i,1);
	}
	return $str;
}
?>
