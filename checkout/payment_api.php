<?php

// 測試資料
$account = 'brunsky';
$package_name = 'com.imec.ebook.D201203200005.activity';
$mac_address = 'test201009011340';
$card_no = '4938259007626105'; // 順子卡號
$cvv2 = '140'; // 卡背3碼
$expiry_date = '1311'; //yymm
$apk_price = '0.99';
$language = 'tw';

//ex:
//$hosturl = 'https://ecpay.com.tw/g_ssl.php?'.$client.$card_no.$expiry_date.$cvv2.$TWD_amount.'00'.'0'.'000'.'00000000'.'00000000'.$od_sob;

if (!$account || !$package_name || !$mac_address || !$card_no || !$cvv2 || !$expiry_date || !$apk_price) {
  echo '[DATA_ERROR]'; // 必傳值
  exit();
}

// 固定資料
$act = 'auth';
$client = '610405'; // 商家代號

include "billing_setup.inc";
include "db.inc";

// DB宣告,全域參數設定
$db = new DB; // 連結 ecar DB
$connkey_billing = $db->link_sip( $localhost_ip, $localhost_dbname, $localhost_USER, $localhost_PASSWD);
if ($connkey_billing) {

  // 判別帳號是否存在
  $str = "select m_cindex,name,email from market_member where account = '$account' limit 1";
	$market_member_data = $db->sql($str);
  $pay_user = $market_member_data[0]['m_cindex'];
  $pay_user_email = $market_member_data[0]['email'];
  if (!$pay_user) {
    echo '[ACCOUNT_ERROR]';
    exit(); // 一定要有值
  }

  // 查詢user是否已對此apk付過費
  //$str = "SELECT market_account FROM payment_data WHERE market_account = '$account' AND package_name = '$package_name' AND succ = '1' limit 1";
	//$payment_data = $db->sql($str);
  //if ($payment_data[0]) {
  //  echo "<center>您已付過費用。</center>";
  //  exit();
  //}

  // 取得收錢的會員id,apk id,apk name,apk 價格, apk 檔名
  $str = "select apk_sindex,apk_name,m_cindex,apk_price,apk_file from market_apk where api_apkname = '$package_name' limit 1";
  $market_apk_data = $db->sql($str);
  $pay_apk_id = $market_apk_data[0]['apk_sindex'];
  $pay_apk_name = $market_apk_data[0]['apk_name'];
  $pay_apk_developer = $market_apk_data[0]['m_cindex'];
  //$pay_gross = $market_apk_data[0]['apk_price'];
  $pay_gross = $apk_price;
  $pay_net_amount = number_format(($pay_gross * 0.7),3);
  $pay_fee = '-'.($pay_gross - $pay_net_amount);
  $apk_file = $market_apk_data[0]['apk_file'];

  if (!$market_apk_data[0]) {
    echo '[PACKAGENAME_ERROR]';
    exit(); // apk一定要對的
  }

  //$apk_name = $market_apk_data[0]['apk_name'];
  //$amount = $market_apk_data[0]['apk_price'];
  //if ($amount == 'Free') {
  //  echo '<center>此軟體不需付費，請直接下載。</center>';
  //  exit();
  //}

  if (strlen($card_no) > 16) {
    echo "[PAYMENT_FAIL]";
    exit();
  }

  if (strlen($expiry_date) != 4) {
    echo "[PAYMENT_FAIL]";
    exit();
  }

  if (strlen($cvv2) != 3) {
    echo "[PAYMENT_FAIL]";
    exit();
  }

  // 卡號16位數, 右邊補大寫 X
  $card_no = str_pad($card_no, 16, "X", STR_PAD_RIGHT); // EX: "431195221111XXXX"
  //echo '<br>'.$card_no;

  // 刷卡金額7位數, 左邊補0
  //$TWD_amount = (int)($apk_price*33);
  // 只要不是整數, 無條件進1
  $TWD_amount = $apk_price*33;
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
  $str = "INSERT INTO payment_data (od_sob, market_account, package_name, amount, TWD_amount, ip, ctime) VALUES ('$od_sob', '$account', '$package_name', '$apk_price', '$TWD_amount', '$ip', '$ctime')";
  //echo $str;
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
  echo $hosturl.'<br>';

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
  echo $result.'<br>';

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

  if (substr($result,0,5)=='error') {
    echo '[PAYMENT_FAIL]'; // 回傳給 client 刷卡失敗錯誤訊息
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
        $str = "select name,email,three_char_code from market_member where m_cindex = '$pay_apk_developer' limit 1";
        $market_member_income_user_data = $db->sql($str);
        $pay_apk_email = $market_member_income_user_data[0]['email'];
        $three_char_code = $market_member_income_user_data[0]['three_char_code'];

        // 付費, 導回資料完成時間
        $pay_date = getdateinfo(8);

        // 完成付費, 記錄至 Leo 的收入表 payment_list
        $str = "INSERT INTO payment_list (pay_type, pay_date, pay_user, pay_user_email, pay_apk_id, pay_apk_name, pay_apk_developer, pay_apk_email, pay_gross, pay_fee, pay_net_amount, pay_unit) ".
        "VALUES ('SELL', '$pay_date', '$pay_user', '$pay_user_email', '$pay_apk_id', '$pay_apk_name', '$pay_apk_developer', '$pay_apk_email', '$pay_gross', '$pay_fee', '$pay_net_amount', '$pay_unit')";
        //echo $str;
        $db->sql($str);
    
        // 產出新載點供client下載
        $nkey_array = array("A","m","3","B","n","6","C","o","x","1","D","p","5","E","q","y","0","F","r","8","G","s","z","7","H","t","4","I","u","9","J","v","2","K","l","w");
        srand();
        for ($k=1;$k<=20;$k++) $random = $random.$nkey_array[rand(0,34)];
        
        $random = $random.'.apk';
  
        // apk檔案路徑
        $old_url = "/var/www/market/$apk_file";
        //echo $old_url;
        $new_url = "/var/www/market/payment_download/$random";
        //echo $new_url;
    
        `cp $old_url $new_url`;
    
        // 取出上一個暫存檔未刪檔資料
        $str = "SELECT temp_file,ctime from payment_download_data WHERE package_name = '$package_name' AND mac_address = '$mac_address' AND rm_temp_file = '0' ORDER BY ctime DESC limit 1";
        //echo $str;
        $payment_download_near_data = $db->sql($str);
    
        // 若存在, 則進行刪除作業
        if ($payment_download_near_data[0]) {
          $old_temp_file = $payment_download_near_data[0]['temp_file'];
          $old_ctime = $payment_download_near_data[0]['ctime'];
      
          // 刪除前一個暫存檔
          `rm $old_temp_file`;
          $str = "UPDATE payment_download_data SET rm_temp_file = '1' WHERE package_name = '$package_name' AND mac_address = '$mac_address' AND ctime = '$old_ctime' limit 1";
          //echo $str;
          $db->sql($str);
        }

        // 記錄新暫存下載檔資料, 供管控用
        $str = "INSERT INTO payment_download_data (market_account, package_name, apk_file, temp_file, mac_address, ctime) VALUES ('$account', '$package_name', '$old_url', '$new_url', '$mac_address', '$ctime2')";
        //echo $str;
        $db->sql($str);
    
        // 記錄需付費apk被點擊, 跑完金流, 做為評估及統計用
        $str = "INSERT INTO payment_apk_click_data (market_account, package_name, ctime, need_payment) VALUES ('$account', '$package_name', '$ctime2', '3')";
        //echo $str;
        $db->sql($str);
  
        // 驗證檔檔名
        $auth_filename = MD5($mac_address);
  
        // 取出此 device 已下載過的暫存檔不同 apk 資料
        $str = "SELECT distinct package_name FROM payment_download_data WHERE mac_address = '$mac_address'";
        //echo $str;
        $payment_download_apk_data = $db->sql($str);
        $apk_count = count($payment_download_apk_data);

        // 驗證檔檔案路徑
        $auth_url = "/var/www/market/auth_download/$auth_filename";

        // 重新產生驗證檔, 驗證檔每筆資料結構為: package_nameWOWmacaddress
        for ($i=0; $i<$apk_count; $i++) {
        
          $temp_auth_data = $payment_download_apk_data[$i]['package_name'].'WOW'.$mac_address;  
          $md5_auth_data = MD5($temp_auth_data);  
          $new_auth_data .= "$md5_auth_data\n";
            												
        }

        $fp = fopen("$auth_url", 'w') or die();
        fputs($fp, $new_auth_data);
        fclose($fp);

        // 完整隨機載點位置
        $apk_download_url = "http://$server_ip/payment_download/$random";
  
        // 完整驗證檔載點位置
        $auth_download_url = "http://$server_ip/auth_download/$auth_filename";
  
				// 回傳給 client 完成付費訊息
        echo '[DOWNLOAD]∵'.$apk_download_url.'∵'.$auth_download_url;



        // 寄出購買通知信給 user
        require("phpMailer/class.phpmailer.php");
        $mail = new PHPMailer();
        $mail->IsSMTP(); // 設定使用SMTP方式寄信     
        $mail->Host = "camangiwebstation.com"; // SMTP主機
      	$mail->Port = 25;  // Gamil的SMTP主機的SMTP埠位為465埠。         
      	$mail->CharSet = "utf-8"; // 設定郵件編碼
        $mail->SMTPAuth = true; // 設定SMTP需要驗證     
      	$mail->Username = "market@camangiwebstation.com"; // 設定驗證帳號         
      	$mail->Password = "ws171ws171"; // 設定驗證密碼       
      	$mail->From = "service@camangiwebstation.com"; // 設定寄件者信箱         
      	$mail->FromName = "Camangi Market"; // 設定寄件者姓名              
                    
        $mail->AddAddress($pay_user_email); // 設定收件者信箱
        //$mail->AddAddress($yourmail,$s_mail[0]['First_name']); // 設定收件者信箱,及名稱
                    
        //$mail->WordWrap = 50; // set word wrap
                    
        //$mail->AddAttachment("path_to/file"); // attachment
        //$AddAttachment_filename = $ffrom_name."_".date("Ymd")."-".date("His").".wav";
        //$mail->AddAttachment($read_file, $AddAttachment_filename);
      
        $mail->IsHTML(true); // 設定郵件內容為HTML
      
        // 取得語系信件內容 for user language
        if ($language == 'tw') include "payment_api_tw.php";
        elseif ($language == 'ja') include "payment_api_ja.php";
        else include "payment_api_en.php";        

        $mail->Subject = $subject_user; // 設定郵件標題
     
        $body_user = str_replace('user_name',$market_member_data[0]['name'],$body_user); // $body 在語系inc檔內
        $body_user = str_replace('succ_ctime',$succ_ctime,$body_user);
        $body_user = str_replace('e--mail',$pay_user_email,$body_user);
        $body_user = str_replace('od_sob',$od_sob,$body_user);
        $body_user = str_replace('amount',$apk_price,$body_user);
        $body_user = str_replace('apk_name',$pay_apk_name,$body_user);
      
        $mail->Body = $body_user;
        //$mail->AltBody = "This is the text-only body";
                    
        if(!$mail->Send()) {
          //$msg = '購買API完成後寄信失敗';
          $str = "INSERT INTO `error_email_send` (ip, email, error_type, ctime) VALUES ('$ip', '$pay_user_email', 'payment_api.php -> user', '$ctime2')";
          $db->sql($str);
        }
      

        // 重取語系信件內容 for developer country
        if ($three_char_code == 'TWN') include "payment_api_tw.php";
        elseif ($three_char_code == 'JPN') include "payment_api_ja.php";
        else include "payment_api_en.php";        
      
        // 寄出購買通知信給 developer
        $mail = new PHPMailer();
        $mail->IsSMTP(); // 設定使用SMTP方式寄信     
        $mail->Host = "camangiwebstation.com"; // SMTP主機
      	$mail->Port = 25;  // Gamil的SMTP主機的SMTP埠位為465埠。         
      	$mail->CharSet = "utf-8"; // 設定郵件編碼
        $mail->SMTPAuth = true; // 設定SMTP需要驗證     
      	$mail->Username = "market@camangiwebstation.com"; // 設定驗證帳號         
      	$mail->Password = "ws171ws171"; // 設定驗證密碼       
      	$mail->From = "service@camangiwebstation.com"; // 設定寄件者信箱         
      	$mail->FromName = "Camangi Market"; // 設定寄件者姓名              

        $mail->AddAddress($pay_apk_email); // 設定收件者信箱
        //$mail->AddAddress($yourmail,$s_mail[0]['First_name']); // 設定收件者信箱,及名稱
                    
        //$mail->WordWrap = 50; // set word wrap
                    
        //$mail->AddAttachment("path_to/file"); // attachment
        //$AddAttachment_filename = $ffrom_name."_".date("Ymd")."-".date("His").".wav";
        //$mail->AddAttachment($read_file, $AddAttachment_filename);
      
        $mail->IsHTML(true); // 設定郵件內容為HTML
        						
        $mail->Subject = $subject_developer; // 設定郵件標題
      
        $body_developer = str_replace('user_name',$market_member_income_user_data[0]['name'],$body_developer); // $body 在語系inc檔內
        $body_developer = str_replace('od_sob',$od_sob,$body_developer);
        $body_developer = str_replace('amount',$apk_price,$body_developer);
        $body_developer = str_replace('apk_name',$pay_apk_name,$body_developer);
      
        $mail->Body = $body_developer;
        //$mail->AltBody = "This is the text-only body";
                    
        if(!$mail->Send()) {
          //$msg = '購買API完成後寄信失敗';
          $str = "INSERT INTO `error_email_send` (ip, email, error_type, ctime) VALUES ('$ip', '$pay_apk_email', 'payment_api.php -> developer', '$ctime2')";
          $db->sql($str);
        }

		}
    else {
			// 回傳給 client 付費失敗訊息
      echo '[PAYMENT_FAIL]';
    }

  	// 記錄payment表
  	//$str = "UPDATE payment_data SET succ_ctime = '$pay_date', succ = '$succ', gwsr  = '$gwsr', response_code = '$response_code', response_msg = '$response_msg', auth_code = '$auth_code', od_hoho = '$od_hoho', eci = '$eci' WHERE od_sob = '$od_sob' limit 1";
  	$str = "UPDATE payment_data SET succ_ctime = '$ctime2', succ = '$succ', gwsr  = '$gwsr', response_msg = '$response_msg', auth_code = '$auth_code' WHERE od_sob = '$od_sob' limit 1";
  	$db->sql($str);
  
  }

}
else {
  echo '[DB_ERROR]';
}

?>