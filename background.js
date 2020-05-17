
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
  },
  () => {
    console.log("failed to copy message ID");
  });
}

function copyMessageID() {
  browser.mailTabs.getSelectedMessages().then(messages => {
    if (!messages || messages.messages.length == 0) {
      console.log("No message selected");
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
            console.error("No Message-ID found in raw email text");
            return;
          }
          // Remove whitespace from the end of the string.
          message_id = message_id.trimEnd();
          doCopy(message_id, options);
        })
        .catch(console.error);
      } else {
        browser.messages.getFull(message.id)
        .then(parts => {
          doCopy(parts.headers["message-id"][0], options);
        })
        .catch(console.error);
      }
    })
    .catch(console.error);
  })
  .catch(console.error);
}

browser.messageDisplayAction.onClicked.addListener(copyMessageID);
