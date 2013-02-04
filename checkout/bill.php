<?
header( 'Location: http://sandbox.hotprintcloud.com/#token='.$_POST['token'].'&source='.$_POST['type'].'&b=succeed' ) ;

 foreach ( $_POST as $key => $value ) { 
	echo $key.":".$value."<br>";
} 
?>
