//var fuckingsnek = function (){ var URL = ""; var script = document.createElement("script"); script.src = URL; document.head.appendChild(script); }();
alert("TEST")
var snekchar="▓"
clearInterval(char_input_check)
var snek_len = 10;
var food_accumulated=0;
var shit_accumulated=0;
var snek_dir="right"
var snek_segments=new Array();
var snek_pos=cursorCoords.slice(0);
var death_accumulated=0;
var snek_thick=4; // MEGA THICK SNEK

var snek_interval;
var check_input_check;

var snek_fillpos;
var snek_fillposrun;

snek_die=function(){
	var snekdieint;
	snekdieint=setInterval(function(){
		if (snek_segments.length==0) {
			clearInterval(snekdieint);
			return;
		}
		var value=snek_segments.shift();
		cursorCoords=value.slice(0);
		renderCursor(cursorCoords);
		snek_fillpos(value,"X");
	},10);
	clearInterval(snek_interval);
	clearInterval(char_input_check);
}

snek_fillposrun=function(pos,func){
	var vpos=pos.slice(0);
	for (x = 0; x < snek_thick; x++) {
		vpos[3]--;
		if(vpos[3] < 0) {
			vpos[3] = tileR - 1;
			vpos[1]--
		}
		vpos[2]--;
		if(vpos[2] < 0) {
			vpos[2] = tileC - 1;
			vpos[0]--;
		}
	}
	for (x=0;x<(snek_thick*2+1);x++) {
		var vvpos=vpos.slice(0);
		for (y=0;y<(snek_thick*2+1);y++) {
			func(vvpos);
			vvpos[2]++;
			if(vvpos[2] > tileC - 1) {
				vvpos[2] = 0;
				vvpos[0]++;
			}
		}
		vpos[3]++;
		if(vpos[3] > tileR - 1) {
			vpos[3] = 0;
			vpos[1]++
		}
	}
}

snek_fillpos=function(pos,ch) {
	snek_fillposrun(pos,function(vvpos){writeCharTo(ch,YourWorld.Color,vvpos[0],vvpos[1],vvpos[2],vvpos[3]);})
}

snek_interval = setInterval(function() {
	cursorCoords=snek_pos.slice(0);
	for (x=0;x<(snek_thick*2+1);x++) {
		moveCursor(snek_dir);
	}
	var badchars=0;
	var foods=0;
	var cellvol=(1+snek_thick*2)*(1+snek_thick*2);
	if (!(cursorCoords==null)) {
		snek_fillposrun(cursorCoords,function(cursorCoords){
			var newTileX = cursorCoords[0];
			var newTileY = cursorCoords[1];
			var tile = Tile.get(newTileX, newTileY);
			if (!tile) {
				badchars=badchars+1
			} else {
				var oldchar=getChar(cursorCoords[0],cursorCoords[1],cursorCoords[2],cursorCoords[3]);
				var writability = tile.properties.writability;
				var thisTile = {
					writability: writability,
					char: tile.properties.char
				}
				if ((oldchar==snekchar) || (!Permissions.can_edit_tile(state.userModel, state.worldModel, thisTile, cursorCoords[2], cursorCoords[3]))) {
					badchars=badchars+1;
				} else if (oldchar!=" ") {
					foods=foods+1;
				}
			}
		});
	}
	if ((cursorCoords==null) || (badchars/cellvol>0.75)) {
		death_accumulated=death_accumulated+0.1;
		if (death_accumulated>=1) {
			return snek_die();
		}
		return;
	} else {
		death_accumulated=0;
	}
	food_accumulated=food_accumulated+0.75*(foods/cellvol);
	if (food_accumulated>=1) {
		food_accumulated=food_accumulated-1;
		snek_len=snek_len+1;
	}
	snek_pos=cursorCoords.slice(0);
	snek_segments.push(cursorCoords.slice(0));
	if (snek_segments.length>snek_len) {
		var pos=snek_segments.shift();
		var vpos=pos.slice(0);
		snek_fillpos(pos," ")
		if (snek_len>10) {
			shit_accumulated=shit_accumulated+0.1*(snek_len-10)
		}
	}
	if (shit_accumulated>=1) {
		shit_accumulated=shit_accumulated-1;
		snek_len=snek_len-1;
		var pos=snek_segments.shift();
		snek_fillpos(pos,"💩")
	}
	snek_fillpos(cursorCoords,snekchar)
},75+(snek_thick*50))
char_input_check = setInterval(function() {
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
