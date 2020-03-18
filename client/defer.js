var auth;
var user;
var cancel = [function(){}];

function setAuth(a, u) {
	auth = a;
	user = u;
	if (a) {
		$logged_out.setAttribute("hidden","hidden");
		$logged_in.removeAttribute("hidden");
		$logged_in_2.removeAttribute("hidden");
		$myself.textContent = "logged in as "+user;
		localStorage.auth = a;
		localStorage.user = u;
	} else {
		$logged_in.setAttribute("hidden","hidden");
		$logged_in_2.setAttribute("hidden","hidden");		
		$logged_out.removeAttribute("hidden");
		$myself.textContent = "not logged in";
		delete localStorage.auth;
		delete localStorage.user;
	}
}

if (localStorage.auth) {
	setAuth(localStorage.auth, localStorage.user);
} else {
	setAuth(null);
}
changeRoom(null);

$logout.onclick = function() {
	if (auth) {
		logout(auth, error);
		setAuth(null);
	}
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

$register.onclick = function() {
	register($username.value, $password.value, function(err){
		if (err)
			error('Error registering: '+err);
		else {
			error('Registered');
			$login.click()
		}
	});
}

$send.onclick = function() {
	if ($input.value) {
		sendMessage(auth, $room.value, $input.value, function(err){
			if (err) {
				error("Error sending message: "+err);
			} else {
				$input.value ="";
			}
		});
	}
}

$input.onkeypress = function(e) {
	if (!e.shiftKey && e.keyCode == 13) {
		e.preventDefault();
		$send.onclick();
		return;
	}
}

function changeRoom(name) {
	cancel[0]();
	$output.textContent = "";
	if (name) {
		$currentroom.textContent = "In room: "+name;
		run(auth, name, undefined, function(message) {
			$output.textContent = message + "\n" + $output.textContent;
		}, cancel);
		$send.disabled = false;
	} else {
		$currentroom.textContent = "Not in a room";
		$send.disabled = true;
	}
}

$changeroom.onclick = function() {
	changeRoom($room.value);
}
