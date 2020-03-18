var auth;
var user;
var cancel = [function(){}];
/*login("testuser2", "password", function(a) {
	auth = a;
	/*run(auth, "test", undefined, function(message) {
		$output.textContent = message + "\n" + $output.textContent;
	}, cancel);
})*/

function setAuth(a, u) {
	auth = a;
	user = u;
	if (a) {
		$logged_out.setAttribute("hidden","hidden");
		$logged_in.removeAttribute("hidden");
		$myself.textContent = "logged in as "+user;
	} else {
		$logged_in.setAttribute("hidden","hidden");
		$logged_out.removeAttribute("hidden");
		$myself.textContent = "not logged in";
	}
}

setAuth(null);

$logout.onclick = function() {
	logout(auth, error);
	setAuth(null);
}

$login.onclick = function() {
	login($username.value, $password.value, function(a, err){
		if(a){
			setAuth(a, $username.value);
		}else{
			error('Error logging in: '+err);
		}
	});
}

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
