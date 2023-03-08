
// get the toggle button
let toggleExtensionCheckbox = document.querySelector("input[name=video-color-inverter-toggle]")

// if the user clicked on the toggle button, modify the storage value accordingly, so video_color_inverter enable/disable the video color inversion
toggleExtensionCheckbox.addEventListener('change', function() {
	if (this.checked) {
		browser.storage.local.set({["video_color_converter_toggle"]: 1})
	} else {
		browser.storage.local.set({["video_color_converter_toggle"]: 0})
	}
});

// will toggle on the button if it has been toggled on by the user before, or it's the first time the extension is enabled
browser.storage.local.get({["video_color_converter_toggle"]: 0}).then((r) => {
	toggleExtensionCheckbox.checked = r.video_color_converter_toggle
})
