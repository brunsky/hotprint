<?

$redirect_url = "Location: http://sandbox.hotprintcloud.com/index.html";
$USD2TWD = 30;

$order_detail = addslashes(json_encode($_POST));

/*
 foreach ( $_POST as $key => $value ) { 
	echo $key.":".$value."<br>";
} 
*/

$user_id = mysql_real_escape_string($_POST['userid']);
$card_no = mysql_real_escape_string($_POST['card_no']); // 順子卡號
$cvv2 = mysql_real_escape_string($_POST['cvc_no']); // 卡背3碼
$expiry_date = mysql_real_escape_string($_POST['expiry_date']); //yymm
$price = mysql_real_escape_string($_POST['total']);
$pay_user_email = mysql_real_escape_string($_POST['shipping_email']);
$token = $_POST['token'];
$type = $_POST['type'];
$c_time_local = $_POST['c_time'];
$coupon_no = mysql_real_escape_string($_POST['coupon_no']);
$lang = $_POST['lang'];
$currency = $_POST['currency'];

if (!$user_id || !$card_no || !$cvv2 || !$expiry_date) {
  header( $redirect_url.'#token='.$token.'&source='.$type.'&b=cancel' ) ;
  exit();
}


// 固定資料
$act = 'auth';
$client = '610405'; // 商家代號

include "setup.inc";
include "db.inc";

// DB宣告,全域參數設定
$db = new DB; // 連結 ecar DB
$connkey_billing = $db->link_sip( "localhost", $DB_NAME, "root", "tomorrow");
if ($connkey_billing) {

  if (strlen($card_no) > 16) {
    header( $redirect_url.'#token='.$token.'&source='.$type.'&b=cancel' ) ;
    exit();
  }

  if (strlen($expiry_date) != 4) {
    header( $redirect_url.'#token='.$token.'&source='.$type.'&b=cancel' ) ;
    exit();
  }

  if (strlen($cvv2) != 3) {
    header( $redirect_url.'#token='.$token.'&source='.$type.'&b=cancel' ) ;
    exit();
  }
  

  // 卡號16位數, 右邊補大寫 X
  $card_no = str_pad($card_no, 16, "X", STR_PAD_RIGHT); // EX: "431195221111XXXX"
  //echo '<br>'.$card_no;

  // 刷卡金額7位數, 左邊補0
  //$TWD_amount = (int)($apk_price*33);
  // 只要不是整數, 無條件進1
  if ($currency == "NTD")
  	$TWD_amount = $price;
  else
  	$TWD_amount = $price * $USD2TWD;
  $temp_TWD_amount = (int)($TWD_amount);
  if ($TWD_amount > $temp_TWD_amount) {
    $TWD_amount = (int)($TWD_amount+1);
  }
  else {
    $TWD_amount = (int)($TWD_amount);
  }

  $TWD_amount = str_pad($TWD_amount, 7, "0", STR_PAD_LEFT); // EX: "0000030"
  //echo '<br>'.$TWD_amount;

	// 取得來源IP
 	$ip = $_SERVER[REMOTE_ADDR];
  
 	// 隨機配出額外的訂單編號
 	$nkey_array = array("A","m","3","B","n","6","C","o","x","1","D","p","5","E","q","y","0","F","r","8","G","s","z","7","H","t","4","I","u","9","J","v","2","K","l","w");
 	srand();
 	for ($k=1;$k<=7;$k++) $random = $random.$nkey_array[rand(0,34)];

 	// 製成訂單號碼 = 年月日時分秒 + 7碼亂碼
 	$od_sob = getdateinfo(2).$random;
  
  // 取得刷卡前時間
	$ctime = getdateinfo(2);

  // 新增暫存訂單
  $str = sprintf(
  "INSERT INTO order_list (order_no, userid, detail, c_time,c_time_local, ip) VALUES ('%s', '%s', '%s', '%s', '%s', '%s')",
   $od_sob,$user_id,$order_detail,$ctime,$c_time_local,$ip);
  $db->sql($str);

  /*
  簡易發動格式範例
  https://ecpay.com.tw/g_ssl.php?[商店代號][卡號][卡片到期日][背3碼][金額][分期期數][國旅0/1][國旅城市代碼][起程日期][迄程日期][訂單號碼]
  例: https://ecpay.com.tw/g_ssl.php?1111114561231231231231071233300002000300120124200701252007200701240001 
  --------------------------------------------------------------------------------
  欄位 碼數 格式 說明 
  [商店代號] 6 數字 每個商店自己的商店代號,不足靠右左補0, 以3為例:000003 
  [卡號] 16 數字 信用卡卡號, 不足16位者以 X 補在後面(大寫X) 
  [卡號到期日] 4 數字 例: 200712 ==> 0712 
  [背3碼] 3 數字 卡片的背面末3碼 
  [金額] 7 數字 不足靠右左補0, 以200為例:0000200 
  [分期期數] 2 數字 非分期送00,不足靠右左補0, 以3期為例:03 
  [國旅] 1 數字 是國旅卡交易 1 , 非國旅交易 0 
  [國旅城市代碼] 3 數字 請依國旅城市代碼表為準 , 沒有的送:000 
  [國旅起程日期] 8 數字 mmddyyyy , 沒有的送:00000000 
  [國旅迄程日期] 8 數字 mmddyyyy , 沒有的送:00000000 
  [訂單號碼] 1 - 40 英數 您的訂單號碼,最大位數40(非固定) 
  */

  // 使用 CURL 呼叫刷卡機制
  // 1. 設定 URL
  $hosturl = 'https://ecpay.com.tw/g_ssl.php?'.$client.$card_no.$expiry_date.$cvv2.$TWD_amount.'00'.'0'.'000'.'00000000'.'00000000'.$od_sob;
  //https://ecpay.com.tw/g_ssl.php?000003 4311952222222222 1308 893 0000054 00 0 000 00000000 00000000 20100629025925r9HpsoH
  //echo $hosturl.'<br>';

  // 2. 設定 欲傳遞的參數及內容
  $postdata = "";      


  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $hosturl);
  curl_setopt($ch, CURLOPT_VERBOSE, 1);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
  curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
  curl_setopt($ch, CURLOPT_POST,1);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $postdata);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
      
  // 取得 URL API 處理結果
  $result = curl_exec ($ch);
  //echo $result.'<br>';

  // 結束 CURL FUNCTION
  curl_close($ch);

  /*
  結果*授權單號*金額*訂單號碼*授權時間*授權碼 結果: 0 失敗 / 1 成交 (以 * 分格每個值)
  例:1*15689*300*52889656*20070410104530*777777 
  error_Stage 錯誤:分期交易的商家,沒送分期期數 
  error_StopCard 錯誤:黑名單中的拒絕交交易卡號 
  error_NoTaiwanCard 錯誤:非台灣地區信用卡 
  error_Client 錯誤:商店不存在 
  error_NotDOit 錯誤:商店無法使用幕後授權 
  error_amount 錯誤:金額參數錯誤 
  error_AmountOver 錯誤:商店交易上限額度超過 
  error_STOP 錯誤:商店狀態系統停用 
  error_3D_STOP 錯誤:商店因為3D限制無法幕後授權
  */

  // 付費, 導回資料完成時間
  $succ_ctime = getdateinfo(8);
  $ctime2 = getdateinfo(2);

  // 試做結果
  //$result = '0*15689*300*52889656*20070410104530*777777';
  //$result = '1*15689*'.$TWD_amount.'*'.$od_sob.'*'.$ctime2.'*777777';
  //$result = 'error_3D_STOP';
  //echo $result.'<br>';
  
  // 特殊零元刷卡 (ex. VIP coupon)
  if ($result == 'error_amount' && $price == 0) {
  	$result = '1*77777*0*'.$od_sob.'*'.$ctime2.'*777777';
  }

  if (substr($result,0,5)=='error') {
    header( $redirect_url.'#token='.$token.'&source='.$type.'&b=cancel' ) ; // 回傳給 client 刷卡失敗錯誤訊息
    //echo "連線 失敗:".$result;
    exit();
  }
  else {

    $result_data = explode('*',$result);
    
    $succ = $result_data[0];
    $gwsr = $result_data[1];        
    $succ_price = $result_data[2];        
    $od_sob = $result_data[3];        
    $auth_code = $result_data[5];        

	if ($succ == '1') {

				//if ($response_code=="000" || $response_code=="001" || $response_code=="002" || $response_code=="003" || $response_code=="004" || $response_code=="005" || $response_code=="006" || $response_code=="007") {
					$response_msg = "已授權";
				//}

        // 完成付費, 取得相關資料, 記錄至 Leo 的收入表 payment_list
        // 收錢的 developer 會員資料
        /*
        $str = "select name,email,three_char_code from market_member where m_cindex = '$pay_apk_developer' limit 1";
        $market_member_income_user_data = $db->sql($str);
        $pay_apk_email = $market_member_income_user_data[0]['email'];
        $three_char_code = $market_member_income_user_data[0]['three_char_code'];
		*/
        // 付費, 導回資料完成時間
        $pay_date = getdateinfo(8);

        // 完成付費, 記錄至 Leo 的收入表 payment_list
        $sql = sprintf(
        		"UPDATE order_list SET s_time='%s', payment='%s' WHERE order_no='%s'", 
        		$pay_date,
				$TWD_amount,
				$od_sob
			);
		$result = $db->sql($sql);
		
		$sql = sprintf(
        		"UPDATE coupon SET userid='%s', date='%s' WHERE code='%s'", 
        		$user_id,
				$pay_date,
				$coupon_no
			);
		$result = $db->sql($sql);
        /*
        $str = "INSERT INTO payment_list (pay_type, pay_date, pay_user, pay_user_email, pay_apk_id, pay_apk_name, pay_apk_developer, pay_apk_email, pay_gross, pay_fee, pay_net_amount, pay_unit) ".
        "VALUES ('SELL', '$pay_date', '$pay_user', '$pay_user_email', '$pay_apk_id', '$pay_apk_name', '$pay_apk_developer', '$pay_apk_email', '$pay_gross', '$pay_fee', '$pay_net_amount', '$pay_unit')";
        //echo $str;
        $db->sql($str);
    	*/
        
        // 寄出購買通知信給 user
        
        $mail_title = $MAIL_OK_TITLE_TW;
		$mail_content = $MAIL_OK_CONTENT_TW;
		if ($lang == "en") {
			$mail_title = $MAIL_OK_TITLE_EN;
			$mail_content = $MAIL_OK_CONTENT_EN;
		}
                    
        if(!sendMail($pay_user_email, $mail_title, $mail_content)) { // 寄信失敗記錄
          $msg = '購買API完成後寄信失敗';
          //$str = "INSERT INTO `error_email_send` (ip, email, error_type, ctime) VALUES ('$ip', '$pay_apk_email', 'payment_api.php -> developer', '$ctime2')";
          //$db->sql($str);
          //echo $msg;
        } 
		header( $redirect_url.'#token='.$token.'&source='.$type.'&b=succeed' ) ;

	}
    else {
    	// 回傳給 client 付費失敗訊息
      	header( $redirect_url.'#token='.$token.'&source='.$type.'&b=cancel' ) ;
			
      //echo "解析回傳結果，失敗:".$result;
    }

  	// 記錄payment表
  	//$str = "UPDATE payment_data SET succ_ctime = '$pay_date', succ = '$succ', gwsr  = '$gwsr', response_code = '$response_code', response_msg = '$response_msg', auth_code = '$auth_code', od_hoho = '$od_hoho', eci = '$eci' WHERE od_sob = '$od_sob' limit 1";
  	/*
  	$str = "UPDATE payment_data SET succ_ctime = '$ctime2', succ = '$succ', gwsr  = '$gwsr', response_msg = '$response_msg', auth_code = '$auth_code' WHERE od_sob = '$od_sob' limit 1";
  	$db->sql($str);
  	*/
  }

}
else {
	//echo "資料庫失敗";
  header( $redirect_url.'#token='.$token.'&source='.$type.'&b=cancel' ) ;
}

function sendMail($_email, $_title, $_msg ) {
		
	include("phpMailer/class.phpmailer.php");  
		
	$from="service@hotprintcloud.com";
	$to=$_email; //user email

	$mail= new PHPMailer();       
	$mail->IsSMTP();        
	$mail->SMTPAuth = true; 
	$mail->SMTPSecure = "ssl"; 
	$mail->Host = "smtp.gmail.com";       
	$mail->Port = 465;
	$mail->CharSet = "utf-8";         

	//$mail->Username = "market@camangiwebstation.com";       
	//$mail->Password = "ws171ws171"; 
	$mail->Username = "service@hotprintcloud.com";       
	$mail->Password = "13133377";

	$mail->From = $from;       
	$mail->FromName = "hotprintCloud";            

	$mail->IsHTML(true);      
	$mail->AddAddress($to); 

	//$mail->Subject = "=?UTF-8?B?".base64_encode($subject)."?=";     
	$mail->Subject = $_title;
	$mail->Body = $_msg;				

	if(!$mail->Send()) {
		echo "Mailer Error: " . $mail->ErrorInfo."<br>";               
		return false;       
	}
	else {	         
		return true;
	}
}

?>