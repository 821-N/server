var auth;
var cancel = [function(){}];
login("testuser2", "password", function(a) {
	auth = a;
	/*run(auth, "test", undefined, function(message) {
		$output.textContent = message + "\n" + $output.textContent;
	}, cancel);*/
})

$send.onclick = function() {
	sendMessage(auth, $room.value, $input.value);
}

$changeroom.onclick = function() {
	cancel[0]();
	$output.textContent = "";
	run(auth, $room.value, undefined, function(message) {
		$output.textContent = message + "\n" + $output.textContent;
	}, cancel);
}
