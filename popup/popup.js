
copyMessageID()

function doCopy(message_id, options) {
  console.log(message_id);
  // Remove the brackets from the message-id to maintain backwards compatability.
  if (!options.copyBrackets &&
      message_id[0] == '<' &&
      message_id[message_id.length - 1] == '>') {
    message_id = message_id.slice(1,-1);
  }
  if (options.urlEncode) {
    message_id = encodeURIComponent(message_id);
  }
  console.log("prefix: " + options.prefix + " Suffix: " + options.suffix);
  var s = options.prefix + message_id + options.suffix;
  navigator.clipboard.writeText(s).then(() => {
    console.log("successfully copied message ID");
    reportSuccess(s);
  }).catch(reportError);
}

function copyMessageID() {
  browser.mailTabs.getSelectedMessages().then(messages => {
    if (!messages || messages.messages.length == 0) {
      reportError("No message selected");
      return;
    }

    var options = {
      prefix: "",
      suffix: "",
      copyBrackets: false,
      urlEncode: false,
      raw: false
    };
    browser.storage.local.get("copyID", data => {
      if (data.copyID) {
        options = data.copyID;
      }

      // Select the first message if multiple are selected
      var message = messages.messages[0];
      if (options.raw) {
        browser.messages.getRaw(message.id).then(raw => {
          // Split into header and body by splitting on double newline.
          var parts = raw.split(/\n\n|\r\n\r\n|\r\r/);
          // Split into each line and maintain whitepsace
          var lines = parts[0].match(/^.*((\n|\r\n|\r)|$)/gm);
          var message_id = "";
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            // Match the Message-ID tag, case insensitive.
            if (line.match(/^message-id:/im)) {
              message_id = line;
            } else if (message_id != "") {
              // Subsequent lines of a message ID spread across multiple lines
              // must start with whitespace
              if (!/^\s/.test(line)) {
                break;
              }
              message_id += line;
            }
          }
          if (message_id == "") {
            reportError("No Message-ID found in raw email text");
            return;
          }
          // Remove whitespace from the end of the string.
          message_id = message_id.trimEnd();
          doCopy(message_id, options);
        })
        .catch(reportError);
      } else {
        browser.messages.getFull(message.id)
        .then(parts => {
          message_id = parts.headers["message-id"][0]
          doCopy(message_id, options);
        })
        .catch(reportError);
      }
    });
    // Ignore error because Thunderbird always complains about browser.storage.local.get(...)
    // being undefined for some reason.
  })
  .catch(reportError);
}

function reportSuccess(message_id) {
  var time = 1500;
  document.querySelector("#message-id").append(message_id);
  var timeout = setTimeout(() => {  window.close(); }, time);
  // Stop the window close timeout if the user is interacting with it.
  document.onmouseover = function() {
    clearTimeout(timeout);
  }
  document.onmouseout = function() {
    timeout = setTimeout(() => {  window.close(); }, time);
  }
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportError(error) {
  document.body.style.background = "#C80000";
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-string").append(error);
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to copy message ID: ${error.message}`);
}
