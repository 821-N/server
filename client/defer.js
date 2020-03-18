var auth;
var cancel = [function(){}];
/*login("testuser2", "password", function(a) {
	auth = a;
	/*run(auth, "test", undefined, function(message) {
		$output.textContent = message + "\n" + $output.textContent;
	}, cancel);
})*/

$send.onclick = function() {
	sendMessage(auth, $room.value, $input.value, function(err){
		if (err) {
			error("Error sending message: "+err);
		} else {
			$input.value ="";
		}
	});
}

$input.onkeypress = function(e) {
	if (!e.shiftKey && e.keyCode == 13) {
		e.preventDefault();
		$send.onclick();
		return;
	}
}

$changeroom.onclick = function() {
	cancel[0]();
	$output.textContent = "";
	run(auth, $room.value, undefined, function(message) {
		$output.textContent = message + "\n" + $output.textContent;
	}, cancel);
}
