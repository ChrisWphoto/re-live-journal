var listoner = new journalListener('journal-text');
listoner.startListening;

var welcomeWiter, writer;

element: document.getElementById('trip-relive'),
welcomeWiter = new Writer('header-journal-text', welcomeMessages.welcome2, .5);
welcomeWiter.write();
writerStarted = true;

function toggleWriteText(htmlId, btnId) {
  if (writer) writer.cleanup();
  writer = new Writer(htmlId, listoner.getLog(), 1);
  writer.write();
}

function reset() {
  listoner.reset();
  if (writer) writer.cleanup();
  document.getElementById('journal-text').value = '';
  document.getElementById('display-text').innerHTML = '';
}

/*
  writer Function
  @param [String] htmlid
  @param [array]  log
  print out characters at index in array param
*/
function Writer(htmlid, log, rateMultiplier) {

  var target = document.getElementById(htmlid);

  var strArray = [];
  var index = 0;
  var strArrayIdx = 0;
  var strArrayIdxEnd = 0;
  var currentKeycode = 0;
  var intervalId;

  this.rateMultiplier = rateMultiplier || 1;

  this.log = log;

  this.rate = rate = 100;

  //put next char on strArray
  function addNextChar() {

    currentKeycode = log[index][0]; //integer keycode
    strArrayIdx = log[index][1]; //idx of next insertion
    strArrayIdxEnd = log[index][2]; //ending idx of selection
    var strArrayChar = keyCodeMap[log[index][0]] //value of next insertion

    if (!strArrayChar) {
      console.log('undefined keycode ' + log[index][0]);
      index++;
      return;
    }

    //delete/backspace detected
    if (currentKeycode == 8) {

      // delete character at end of line
      if (strArray.length == strArrayIdx) {

        //backspace detected at position 0. No character to delete
        if (strArrayIdx == 0) {
          index++;
          console.log('backspace at 0');
          return;
        }
        console.log("pop: " + strArray.pop());
      }

      //case where multi-char selection was made
      else if (strArrayIdx != strArrayIdxEnd) {
        var numCharsToSlice = strArrayIdxEnd - strArrayIdx;
        console.log(strArray.splice(strArrayIdx, numCharsToSlice));
      }

      //Delete character in middle of strArray
      else if (strArray.length > 0 && strArrayIdx > 0) {
        strArray.splice(strArrayIdx - 1, 1);
      }

    }

    // Insert character into strArray
    else {

      //case where multi-char selection was made
      if (strArrayIdx != strArrayIdxEnd) {

        var numCharsToSlice = strArrayIdxEnd - strArrayIdx;
        console.log(strArray.splice(strArrayIdx, numCharsToSlice));
      }

      //Inserting into middle of string, making room
      if (strArrayIdx < strArray.length) {
        shiftArray(strArrayIdx, strArray);
      }

      //insert character into proper index and wrap in html
      strArray[strArrayIdx] =
        '<span class="' + strArrayIdx + '"><span class="' + strArrayIdx +
        '"><span class="' + strArrayIdx + '" >' +
        strArrayChar + '</span></span></span>';
    }

    index++;
  }

  this.write = function write() {

    //check array indices before starting
    if (log.length > 0 && index < log.length) {

      intervalId = setInterval(function() {

        if (index >= log.length) {

          clearInterval(intervalId);

        } else {

          addNextChar();
          target.innerHTML = strArray.join('');
          addClassNames(strArrayIdx);

          //Clear interval before resetting rate
          clearInterval(intervalId);

          //compute time delta and set rate
          if (index > 0 && index < log.length) {

            rate = log[index][3] - log[index - 1][3];
            rate = Math.floor(rate * rateMultiplier);
            console.log(rate);

          } else {
            rate = 100;
          }

          if (index < log.length) {
            write();
          }

        }
      }, rate);
    }
  }

  function addClassNames(id) {
    console.log(target);

    if (strArrayIdx < strArray.length && currentKeycode != 8) {

      target.getElementsByClassName(id.toString())[0].className = "cursor";
      target.getElementsByClassName(id.toString())[0].className = "shake";
      target.getElementsByClassName(id.toString())[0].className = "highlight";

    }
  }

  function shiftArray(idx, array) {
    var endIdx = array.length;
    while (endIdx > idx) {
      array[endIdx] = array[endIdx - 1];
      endIdx--;
    }
  }

  this.cleanup = function() {
    clearInterval(intervalId);
    target.innerHTML = '';
  }


}

/*
  Listener Function
  @param: [String] div id
  returns array of keycodes:
  keycode
  index where keystroke was recorded,
  timestamp
*/
function journalListener(htmlId) {

  var target = document.getElementById(htmlId);

  var lastKeycodeWasShift = false;

  var charLog = new Array();

  this.getLog = function() {
    return charLog;
  }

  this.startListening = target.addEventListener('keydown', function(e) {
    var keycode = e.keyCode ? e.keyCode : e.which;

    //Capture indices of user slection
    var startPos = target.selectionStart;
    var endPos = target.selectionEnd;

    if (keycode == 16 && startPos == endPos) {
      lastKeycodeWasShift = true;
      return;
    }

    textArea = document.getElementById('journal-text');
    var startPos = textArea.selectionStart;
    var endPos = textArea.selectionEnd;

    if (validKey(keycode)) {

      if (lastKeycodeWasShift) { //convert lowercase touppercase

        charLog.push([uppercaseKeyCodeMap[keycode], startPos, endPos, Date.now()]);
        lastKeycodeWasShift = false;

      } else {

        charLog.push([keycode, startPos, endPos, Date.now()]);

      }
    }
    console.log("code: " + keycode + " Value: " + String.fromCharCode(keycode) + " Start/End: " + startPos + ", " + endPos);
    //console.log(charLog);
  }, false);

  this.reset = function() {
    charLog = new Array();
    lastKeycodeWasShift = false;
    console.log(charLog);

  }

  //returns true if valid letter/symbol
  function validKey(keycode) {
    return (keycode > 47 && keycode < 58 || // number keys
      keycode == 32 || // spacebar
      keycode == 8 || // backspace/delete
      keycode > 64 && keycode < 91 || // letter keys
      keycode > 95 && keycode < 112 || // numpad keys
      keycode > 185 && keycode < 193 || // ;=,-./` (in order)
      keycode > 218 && keycode < 223);
  }
}
