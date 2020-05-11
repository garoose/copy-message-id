function copyMessageID() {
  browser.mailTabs.getSelectedMessages().then(messages => {
    if (!messages || messages.messages.length == 0) {
      console.log("No message selected");
      return;
    }
    // Select the first message if multiple are selected
    var message = messages.messages[0];
    browser.messages.getFull(message.id).then((parts) => {
      var message_id = parts.headers["message-id"][0];
      console.log(message_id);
      var prefix = "";
      var suffix = "";
      var brackets = false;
      var encode = false;
      browser.storage.local.get(data => {
        if (data.copyID) {
          prefix = data.copyID.prefix;
          suffix = data.copyID.suffix;
          brackets = data.copyID.copyBrackets;
          encode = data.copyID.urlEncode;
        }
        // Remove the brackets from the message-id to maintain backwards compatability.
        if (!brackets && message_id[0] == '<' && message_id[message_id.length - 1] == '>') {
          message_id = message_id.slice(1,-1);
        }
        if (encode) {
          message_id = encodeURIComponent(message_id);
        }
        console.log("prefix: " + prefix + " Suffix: " + suffix);
        var s = prefix + message_id + suffix
        navigator.clipboard.writeText(s).then(() => {
          console.log("successfully copied message ID")
        },
        () => {
          console.log("failed to copy message ID")
        });
      });
    });
  });
}

browser.messageDisplayAction.onClicked.addListener(copyMessageID);
