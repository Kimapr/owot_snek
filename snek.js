//var fuckingsnek = function (){ var URL = ""; var script = document.createElement("script"); script.src = URL; document.head.appendChild(script); }();
alert("TEST")
clearInterval(char_input_check)
var char_input_check = setInterval(function() {
	if(w._state.uiModal) return;
	if(write_busy) return;
	var value = elm.textInput.value;
	var hasErased = getDate() - previousErase < 1000;
	if(!value) {
		if(hasErased) {
			elm.textInput.value = "\x7F";
		}
		return;
	}
	if(value == "\x7F") {
		if(!hasErased) {
			elm.textInput.value = "";
		}
		return;
	}
	stabilizeTextInput();
	value = w.split(value.replace(/\r\n/g, "\n").replace(/\x7F/g, ""));
	if(value.length == 1) {
		tileX=tileX+1;
		writeChar("█")
		elm.textInput.value = "";
		return;
	}
	clearInterval(pasteInterval);
	var pastePerm = Permissions.can_paste(state.userModel, state.worldModel);
	var requestNextItem = true;
	if(!cursorCoords) {
		elm.textInput.value = "";
		return;
	}
	var parser = textcode_parser(value, {
		tileX: cursorCoords[0],
		tileY: cursorCoords[1],
		charX: cursorCoords[2],
		charY: cursorCoords[3]
	}, YourWorld.Color);
	var item;
	var charCount = 0;
	var pasteFunc = function() {
		if(requestNextItem) {
			item = parser.nextItem();
		} else {
			requestNextItem = true;
		}
		if(item == -1)  {
			return -1;
		}
		return true;
	};
	if(!pastePerm) {
		while(true) {
			var res = pasteFunc();
			if(!res || res == -1 || charCount >= 4) break;
		}
		elm.textInput.value = "";
		return;
	}
	write_busy = true;
	pasteInterval = setInterval(function() {
		var res = pasteFunc();
		if(res == -1) {
			clearInterval(pasteInterval);
			write_busy = false;
			elm.textInput.value = "";
		}
	}, Math.floor(1000 / 230));
}, 10);
