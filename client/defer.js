var auth;
var user;
var cancel = [function(){}];

function setAuth(a, u) {
	auth = a;
	user = u;
	if (a) {
		$logged_out.setAttribute("hidden","hidden");
		$logged_in.removeAttribute("hidden");
		$myself.textContent = "Logged in as "+user;
		localStorage.auth = a;
		localStorage.user = u;
	} else {
		$logged_in.setAttribute("hidden","hidden");
		$logged_out.removeAttribute("hidden");		
		$myself.textContent = "Not logged in";
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
		changeRoom(null);
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

function shouldScroll(element) {
	return (element.scrollHeight - element.scrollTop - element.clientHeight <= element.clientHeight*.25);
}

function autoScroll(element, force) {
	element.scrollTop = element.scrollHeight - element.clientHeight;
}

function displayMessage(message, first) {
	console.log("displaying:",message);
	var elem = document.createElement("div");
	var user = message.user;
	var text = message.message;
	if (user) {
		var s = document.createElement("span");
		s.className = "sender";
		s.textContent = user;
		elem.appendChild(s);
		s = document.createTextNode(text);
		elem.appendChild(s);
		elem.className = "message";
	} else {
		elem.className = "systemMessage";
		elem.textContent = text;
	}
	var s = shouldScroll($output.parentElement);
	$output.appendChild(elem);
	if (s || first)
		autoScroll($output.parentElement);
}

function changeRoom(name) {
	cancel[0]();
	$output.textContent = "";
	if (name) {
		$currentroom.textContent = "Current room: "+name;
		run(auth, name, undefined, displayMessage, cancel, true);
		$send.disabled = false;
	} else {
		$currentroom.textContent = "Not connected";
		$send.disabled = true;
	}
}

$changeroom.onclick = function() {
	changeRoom($room.value);
}

function error(message) {
	displayMessage({message:message});
}
