// invert the videos color
function invertVideosColor(toggle) {
	// if the extension is enabled from the icon menu
	if (toggle) {
		// and the videos color are not inverted yet
		if (!document.querySelector(".video-color-inverter-magic")) {
			// invert the videos color
			videoColorInverterStyleRule = document.createElement("style");
			videoColorInverterStyleRule.classList.add("video-color-inverter-magic");
			document.head.appendChild(videoColorInverterStyleRule);
			videoColorInverterStyleRule.sheet.insertRule("video { -webkit-filter: invert(100%); filter: invert(100%);}", 0);
		} else {
			videoColorInverterStyleRule.disabled = false;
		}
	// if the extention isn't enabled from the icon menu
	} else {
		// and the videos color are inverted
		if (document.querySelector(".video-color-inverter-magic")) {
			// remove the inversion
			videoColorInverterStyleRule.disabled = true;

		}
	}
}

// store the style rule that reverts the video color
var videoColorInverterStyleRule = null
// store the last toggle state in a variable, to avoid executing the invertVideosColor at every interval (will keep the script lightweight)
let lastToggleState = null;


setInterval(() => {
	browser.storage.local.get({["video_color_inverter_toggle"]: 0}).then((r) => {
		// r.video_color_inverter_toggle is never null, = 0 or 1
		if (lastToggleState != r.video_color_inverter_toggle || lastToggleState == null) {
			invertVideosColor(r.video_color_inverter_toggle);
			lastToggleState = r.video_color_inverter_toggle;
		}
	});
}, 1000)



document.addEventListener("keydown", function(e) {
	// CTRL + ALT + X -> toggle extension on/off
	// on Mac, if CTRL + ALT + X are pressed, e.key==="="(?), so check .code==="KeyX" instead
    if (e.ctrlKey  &&  e.altKey  && e.code === "KeyX") {
        browser.runtime.sendMessage({
	    	message: "Toggle VCI!"
	  });
    }
});