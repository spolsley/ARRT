// string-based handling for limited binary operations

function dec2bin(dec) {
  return (dec >>> 0).toString(2);
}

function hex2bin(hex){
    return (parseInt(hex, 16).toString(2)).padStart(8, '0');
}

function bin2hex(b) {
    return b.match(/.{4}/g).reduce(function(acc, i) {
        return acc + parseInt(i, 2).toString(16);
    }, '')
}

function replaceRange(s, start, end, substitute) {
    return s.substring(0, start) + substitute + s.substring(end);
}

// Function that rotates s towards left by d
function leftrotate(s,d) {
    var ans = s.substring(d, s.length) +
              s.substring(0, d);
    return ans;
};

// Function that rotates s towards right by d
function rightrotate(s,d) {
    return leftrotate(s,s.length - d);
};

function rotate(str,num) {
    if (num >= 0) {
        return rightrotate(str,num);
    } else {
        return leftrotate(str,Math.abs(num));
    }
};

// Function that shifts s towards left by d
function leftshift(s,d) {
    var ans = s.substring(d, s.length) +
              "0".repeat(d);
    return ans;
};

// Function that shift s towards right by d
function rightshift(s,d) {
    var ans = s.substring(0, s.length - d).padStart(s.length,'0');
    return ans;
};

function shift(str,num) {
    if (num >= 0) {
        return rightshift(str,num);
    } else {
        return leftshift(str,Math.abs(num));
    }
};

function xor(a,b) {
    var ans = "";
    var n = b.length;
    if (a.length < b.length) {
        a = a.padStart(b.length,'0');
    } else if (b.length < a.length) {
        b = b.padStart(a.length,'0');
        n = a.length;
    }
    for (var i = 0; i < n; i++)
    {
        if (a[i] == b[i])
            ans += "0";
        else
            ans += "1";
    }
    return ans;
}

function or(a,b) {
    var ans = "";
    var n = b.length;
    if (a.length < b.length) {
        a = a.padStart(b.length,'0');
    } else if (b.length < a.length) {
        b = b.padStart(a.length,'0');
        n = a.length;
    }
    for (var i = 0; i < n; i++)
    {
        if (a[i] == "1" || b[i] == "1")
            ans += "1";
        else
            ans += "0";
    }
    return ans;
}

function add(a,b,n) {
    var result = "",
      carry = 0;

    while(a || b || carry){
    let sum = +a.slice(-1) + +b.slice(-1) + carry // get last digit from each number and sum 

    if( sum > 1 ){  
      result = sum%2 + result
      carry = 1
    }
    else{
      result = sum + result
      carry = 0
    }

    // trim last digit (110 -> 11)
    a = a.slice(0, -1)
    b = b.slice(0, -1)
    }

    if (result > n) {
        result = result.substring(result.length-n);
    } else {
        result = result.padStart(n,'0');
    }

    return result
};

