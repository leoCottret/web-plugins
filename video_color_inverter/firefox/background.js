function toggleExtensionOnOff() {
	browser.storage.local.get({["video_color_inverter_toggle"]: 0}).then((r) => {
		// if the extension was off, change icon to on and toggle video color inversion
		if (r.video_color_inverter_toggle == 0) {
			browser.storage.local.set({["video_color_inverter_toggle"]: 1})
			browser.browserAction.setIcon({ path: "hurted-eye-icon.png" })
		// otherwise do the opposit
		} else {
			browser.storage.local.set({["video_color_inverter_toggle"]: 0})
			browser.browserAction.setIcon({ path: "hurted-eye-icon-off.png" })
		}
	})
}

// set video color inversion on, and marked first launch as done
function setUpFirstLaunch() {
	browser.storage.local.set({["video_color_inverter_toggle"]: 1})
}

browser.runtime.onInstalled.addListener(() => {
  	setUpFirstLaunch()
});


browser.browserAction.onClicked.addListener(() => {
	toggleExtensionOnOff()
});


browser.runtime.onMessage.addListener((m) => {
	if (m.message && m.message == "Toggle VCI!") {
		toggleExtensionOnOff()
	}
})