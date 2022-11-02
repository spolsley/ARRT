function handleASWCode() {
	document.getElementById("result").innerHTML = "";
	document.getElementById("info").innerHTML = "";

	var name = document.getElementById('name').value;
	var copies = document.getElementById('copies').value;

	var product = document.getElementById('product').value;
	var isEarly = v1early.includes(product);
	var isLate = v1late.includes(product);

	var decade = "0";

	if (document.getElementById('debug').checked) { // apply debug settings if active
		product = document.getElementById('productname').value;
		decade = document.getElementById('decadeoffset').value;
		var algo = readAlgo();
		if (algo == "v1earlyalg") {
			isEarly = true;
			isLate = false;
		} else if (algo == "v1latealg") {
			isLate = true;
			isEarly = false;
		} else {
			isEarly = false;
			isLate = false;
		}
	}

	if (isEarly || isLate) {
		var newcode = handleV1(name, copies, product, isLate);
	} else {
		var code = document.getElementById('code').value;
		var newcode = handleV2(name, copies, product, code, decade);
	}

	document.getElementById("result").innerHTML = "New Code:<br><b>" + newcode + "</b>";
}

function handleV1(name, copies, product, extra_hash) {
	var code = "0".repeat(32);
	name = name.toUpperCase();

	code = v1hash(name,copies,code,extra_hash);
	code = v1hash(product,copies,code,extra_hash);

	var registration = "";
	for (var i = 0; i < 8; i++) {
		code = rotate(code,-4);
		registration += String.fromCharCode(parseInt(code.substring(28),2)+65);
	}
	return registration.split("").reverse().join("");
}

function v1hash(string,copies,code,extra_hash) {
	for (var i = 0; i < string.length; i++) {

		var addee = code.substring(24);
		var adder = dec2bin(string.charCodeAt(i));
		code = code.substring(0,24) + add(addee,adder,8);

		if (extra_hash) {
			code = rotate(code,-6);
		} else {
			code = rotate(code,-5);
		}

		addee = code.substring(16);
		adder = dec2bin(copies);
		code = code.substring(0,16) + add(addee,adder,16);

		if (extra_hash) {
			code = xor(code,hex2bin("DEADBEEF"));
			code = rotate(code,1);
		}
	}
	return code;
}

function handleV2(name, copies, product, code, decade) {
	var bincode = textcode_to_bincode(code);
	if (bincode.includes("Error")) return bincode;

	var hash1 = v2get_hash1(name,copies,product);
	var hash2 = xor(hash1,bincode); // only supporting renew, so must have code
	
	var oldtime = get_hash2_time(hash2);
	var olddate = timestamp_to_datetime(oldtime,parseInt(decade,10));

	document.getElementById("info").innerHTML = "Info:<br>" +
		"The supplied code was dated around " + olddate.toDateString() +
		" (decade offset = " + decade + ").<br>" + 
		"The new code is dated " + new Date().toDateString() + "."

	if (product == "Garendall") {
		var possiblehash2 = set_hash2_time(hash2,"11111111");
		possiblehash2 = update_hash2_checksum(possiblehash2);
		document.getElementById("info").innerHTML += "<br>" +
			"Pillars of Garendall v1.0 had a bug preventing new dates past the original decade.  Try this code if the one above fails: " +
			bincode_to_textcode(xor(possiblehash2,hash1));
	} else if (product == "Snapz Pro X") {
		document.getElementById("info").innerHTML += "<br>" +
			"Snapz Pro X v2 had slightly different codes than v1.  Both versions are renewed with the same 'Snapz Pro X' option above."
	}

	var newhash2 = set_hash2_time(hash2,get_current_timestamp());
	newhash2 = update_hash2_checksum(newhash2);
	return bincode_to_textcode(xor(newhash2,hash1));
}


function textcode_to_bincode(textcode) {
	textcode = textcode.toUpperCase()
	textcode = textcode.replaceAll('-','').replaceAll(' ','');
	if (textcode.length != 12) {
		return "Error: Unexpected code length";
	}

	var key = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
	var r30 = "0".repeat(32);
	var r29 = "0".repeat(32);

	for (var i = 0; i < textcode.length; i++) {
		var r5 = dec2bin(key.indexOf(textcode[i])).padStart(32,'0');
		var r3 = shift(r30,-5);
		var r4 = shift(r29,-5);
		r3 = replaceRange(r3,27,32,xor(r3.substring(27,32),r29.substring(0,5)));
		var r0 = shift(r5,31);
		r29 = or(r4,r5);
		r30 = or(r3,r0);
	}

	return r30 + r29;
}

function bincode_to_textcode(bincode) {
	var key = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
	var textcode = "";

	for (var i  = 4; i < 64; i += 5) {
		textcode += key[parseInt(bincode.substring(i,i+5),2)];
		if (i == 19 || i == 39) {
			textcode += '-';
		}
	}

	return textcode;
}

function v2get_hash1(name,number,game) {
	var key_lower = "0".repeat(32);
	var key_upper = "0".repeat(32);

	name = name.toUpperCase().replace(/\W/g, ''); // remove non-alphanumeric

	var values = get_hash1_game(game,number,key_lower,key_upper);
	key_lower = values[0];
	key_upper = values[1];
	values = get_hash1_name(name,number,key_lower,key_upper);
	key_lower = values[0];
	key_upper = values[1];

	key_upper = replaceRange(key_upper,0,4,"0".repeat(4)); // zero out top nibble

	return key_upper + key_lower;
}

function get_hash1_game(string,number,code,overflow) {
	var r5 = number;
	var r0 = code;
	var r9 = overflow;
	for (var i = 0; i < string.length; i++) {

		var r8 = dec2bin(string.charCodeAt(i)).padStart(32,"0");

		var r6 = i + 7;
		var r7 = shift(r0,-4);
		var r10 = r7;
		r10 = replaceRange(r10,28,32,xor(r10.substring(28,32),r9.substring(0,4)));
		r9 = shift(r9,-4);
		r9 = replaceRange(r9,28,32,xor(r9.substring(28,32),r0.substring(0,4)));
		r7 = dec2bin(r5 * r6).padStart(32,"0");
		r0 = shift(r8,31);
		r10 = xor(r10,r8);
		r6 = xor(r9,r0);
		r0 = shift(r10,-1);
		r8 = shift(r6,-1);
		r0 = replaceRange(r0,31,32,xor(r0.substring(31,32),r6.substring(0,1)));
		r8 = replaceRange(r8,31,32,xor(r8.substring(31,32),r10.substring(0,1)));
		r0 = xor(r0,r7);
		r9 = r8;
	}

	code = r0;
	overflow = r9;
	return [code,overflow];
}

function get_hash1_name(string,number,code,overflow) {
	var r5 = number;
	var r0 = code;
	var r9 = overflow;
	for (var i = 0; i < string.length; i++) {

		var r6 = dec2bin(string.charCodeAt(i)).padStart(32,"0");

		var r3 = i + 13;
		r3 *= r5;
		var r10 = shift(r0,-3);
		var r7 = shift(r9,-3);
		r10 = replaceRange(r10,29,32,xor(r10.substring(29,32),r9.substring(0,3)));
		r7 = replaceRange(r7,29,32,xor(r7.substring(29,32),r0.substring(0,3)));
		r0 = shift(r6,31);
		r10 = xor(r10,r6);
		var r8 = xor(r7,r0);
		r6 = dec2bin(r3 * 3).padStart(32,"0");
		r0 = shift(r10,-1);
		r7 = shift(r8,-1);
		r0 = replaceRange(r0,31,32,xor(r0.substring(31,32),r8.substring(0,1)));
		r7 = replaceRange(r7,31,32,xor(r7.substring(31,32),r10.substring(0,1)));
		r0 = xor(r0,r6);
		r9 = r7;

	}
	
	code = r0;
	overflow = r9;
	return [code,overflow];
}

function update_hash2_checksum(hash2) {
	var region = "0" + hash2.substring(5,61); // pad front with 0 for divisible by 3

	var total = 0
	for (var i = 0; i < 19; i++) {
		total += parseInt(region.substring(i*3,i*3+3),2);
	}

	var expected = dec2bin(total).padStart(32,"0");
	hash2 = replaceRange(hash2,61,hash2.length,expected.substring(29,expected.length));

	return hash2;
}


function get_hash2_time(hash2) {
	var timestamp = "";
	timestamp += hash2[56];
	timestamp += hash2[51];
	timestamp += hash2[42];
	timestamp += hash2[37];
	timestamp += hash2[28];
	timestamp += hash2[23];
	timestamp += hash2[14];
	timestamp += hash2[9];
	return timestamp;
}

function set_hash2_time(hash2,timestamp) {
	var newhash = hash2.substring(0,9);
	newhash += timestamp[7]; // h[9] = t[7]
	newhash += hash2.substring(10,14);
	newhash += timestamp[6]; // h[14] = t[6]
	newhash += hash2.substring(15,23);
	newhash += timestamp[5]; // h[23] = t[5]
	newhash += hash2.substring(24,28);
	newhash += timestamp[4]; // h[28] = t[4]
	newhash += hash2.substring(29,37);
	newhash += timestamp[3]; // h[37] = t[3]
	newhash += hash2.substring(38,42);
	newhash += timestamp[2]; // h[42] = t[2]
	newhash += hash2.substring(43,51);
	newhash += timestamp[1]; // h[51] = t[1]
	newhash += hash2.substring(52,56);
	newhash += timestamp[0]; // h[56] = t[0]
	newhash += hash2.substring(57,hash2.length);
	return newhash;
}

function get_current_timestamp() {
	return datetime_to_timestamp(Date.now());
}

function datetime_to_timestamp(date) {
	// need number of fortnights passed since 2000/12/25 (Eastern Time)
	const basedate = new Date(2000, 11, 25, 4, 0, 0); // UTC time is 4 hrs ahead Eastern (11 is Dec)

	const milliseconds_per_week = 1000 * 60 * 60 * 24 * 7;
	var weeks = (date - basedate.getTime()) / (milliseconds_per_week);
	var fortnights = weeks / 2;

	return dec2bin(fortnights % 256).padStart(8,"0");
}

function timestamp_to_datetime(stamp,decade=0) {
	// timestamps hold 256 fortnights, about 512 weeks or 10 years
	// by default, assume first decade but can advance if needed
	const basedate = new Date(2000, 11, 25, 4, 0, 0); // Christmas Day 2000 in New York, UTC time

	var fortnights = parseInt(stamp,2) + (256 * decade);
	var weeks = fortnights * 2;
	const milliseconds_per_week = 1000 * 60 * 60 * 24 * 7;
	var date = new Date(basedate.getTime() + (weeks * milliseconds_per_week));

	return date;
}
