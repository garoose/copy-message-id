const prefixInput = document.querySelector("#prefix");
const suffixInput = document.querySelector("#suffix");

/*
Store the currently selected settings using browser.storage.local.
*/
function storeSettings() {
  browser.storage.local.set({
    copyID: {
      prefix: prefixInput.value,
      suffix: suffixInput.value
    }
  });
}

/*
Update the options UI with the settings values retrieved from storage,
or the default settings if the stored settings are empty.
*/
function updateUI(storedSettings) {
  if (storedSettings.copyID) {
    prefixInput.value = storedSettings.copyID.prefix;
    suffixInput.value = storedSettings.copyID.suffix;
  }
}

function onError(e) {
  console.error(e);
}

/*
On opening the options page, fetch stored settings and update the UI with them.
*/
const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then(updateUI, onError);

/*
On blur, save the currently selected settings.
*/
prefixInput.addEventListener("blur", storeSettings);
suffixInput.addEventListener("blur", storeSettings);
