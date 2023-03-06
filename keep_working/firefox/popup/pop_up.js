// TODO add more precise filter on hostname, otherwise params with &param="linkedin.com" will trigger the extention



function createElement(parent, tag, text=null, cclass=null, id=null) {
	let newElement = document.createElement(tag);
	if (text) {
		newElement.appendChild(document.createTextNode(text));
	}
	if (cclass) {
		newElement.classList.add(cclass);
	}
	if (id) {
		newElement.id = id;
	}
	return parent.appendChild(newElement);
}

timeWasteWebsites = [ { name: "linkedin.com", timeLimit: 15 }, { name: "youtube.com", timeLimit: 30 } ];

let websiteListE = document.querySelector(".website-list");
for (let w of timeWasteWebsites) {
	let websiteRowE = createElement(websiteListE, "div", null, "website-row");
	createElement(websiteRowE, "div", "-", "website-row-remove-button");
	createElement(websiteRowE, "div", w.name, "website-row-text");
	createElement(websiteRowE, "div", w.timeLimit, "website-row-text");

}




/*
// get the toggle button
let toggleExtensionCheckbox = document.querySelector("input[name=video-color-inverter-toggle]");

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
*/