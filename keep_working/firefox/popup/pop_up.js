// just a shorter query selector
function qS(selector) {
	return document.querySelector(selector);
}

// add an html element to the dom
function cE(parent, tag, text=null, cclass=null, id=null) {
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

// add new website time limit
function addLimit() {
	let websiteName = qS("#add-website-name-input").value;
	let websiteTimeLimit = qS("#add-website-time-limit-input").value;
	timeWasteWebsites.push({name: websiteName, timeLimit: websiteTimeLimit});
	browser.storage.local.set({["keep_working"]: JSON.stringify(timeWasteWebsites)})
	refreshTimeWasteWebsites();
}

function refreshTimeWasteWebsites() {
	browser.storage.local.get({["keep_working"]: 1}).then((r) => {
		// https://stackoverflow.com/questions/3357553/how-do-i-store-an-array-in-localstorage
		timeWasteWebsites = JSON.parse(r.keep_working);

		let websiteListE = qS(".website-list");
		websiteListE.innerHTML = "";
		for (let w of timeWasteWebsites) {
			let websiteRowE = cE(websiteListE, "div", null, "website-row");
			cE(websiteRowE, "div", "-", "website-row-remove-button");
			cE(websiteRowE, "div", w.name, "website-row-text");
			cE(websiteRowE, "div", w.timeLimit, "website-row-text");
		}
	})
}


var timeWasteWebsites = null;
refreshTimeWasteWebsites();

// to avoid script-src csp error
document.addEventListener('DOMContentLoaded', () => {
    let addWebsiteE = qS("#add-website-button");
    // onClick's logic below:
    addWebsiteE.addEventListener('click', () => {
        addLimit();
    });
});






/*
// get the toggle button
let toggleExtensionCheckbox = qS("input[name=video-color-inverter-toggle]");

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