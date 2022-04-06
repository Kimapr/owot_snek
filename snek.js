//var fuckingsnek = function (){ var URL = ""; var script = document.createElement("script"); script.src = URL; document.head.appendChild(script); }();
alert("TEST")
var snekchar="▓"
clearInterval(char_input_check)
var snek_len = 10;
var food_accumulated=0;
var snek_dir="right"
var snek_segments=new Array();
var snek_pos=cursorCoords.slice(0);

snek_die=function(){
	snek_segments.forEach(function(value,index,array){
		writeCharTo("X",null,value[0],value[1],value[2],value[3]);
	});
	clearInterval(snek_interval);
}

var snek_interval = setInterval(function() {
	cursorCoords=snek_pos.slice(0);
	moveCursor(snek_dir);
	var oldchar=getChar(cursorCoords[0],cursorCoords[1],cursorCoords[2],cursorCoords[3]);
	if ((cursorCoords==null) || (oldchar==snekchar)) {
		return snek_die();
	}
	if (oldchar!=" ") {
		food_accumulated=food_accumulated+0.1;
		if (food_accumulated>=1) {
			food_accumulated=food_accumulated-1;
			snek_len=snek_len+1;
		}
	}
	snek_pos=cursorCoords.slice(0);
	snek_segments.push(cursorCoords.slice(0));
	if (snek_segments.length>snek_len) {
		var pos=snek_segments.shift();
		writeCharTo(" ",null,pos[0],pos[1],pos[2],pos[3]);
	}
	writeChar(snekchar,true)
},50)
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
		var old_snek_dir=snek_dir;
		if (value=="w") {
			snek_dir="up"
		} else if (value=="s") {
			snek_dir="down"
		} else if (value=="a") {
			snek_dir="left"
		} else if (value=="d") {
			snek_dir="right"
		}
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
