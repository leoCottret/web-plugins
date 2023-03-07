// just a shorter query selector
function qS(selector, parent=null) {
	let element = null;
	if (parent) {
		element = parent.querySelector(selector);
	} else {
		element = document.querySelector(selector);
	}
	if (!element) {
		console.error("element with selector " + selector + " doesn't exist under parent -> ", parent);
	}
	return element;
}

// add an html element to the dom
function cE(parent, tag, text=null, cclass=null, id=null) {
	let newElement = document.createElement(tag);
	if (text) {
		newElement.appendChild(document.createTextNode(text));
	}
	if (cclass) {
		if (typeof cclass === 'string') {
			newElement.classList.add(cclass);
		// assuming array, otherwise error will be thrown
		} else if (cclass.constructor === Array) {
			for (let c of cclass) {
				newElement.classList.add(c);
			}
		} else {
			console.error("cclass should be of type string or array!")
			console.log(text)
		}
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
	timeWasteWebsites.push({name: websiteName, timeLimit: websiteTimeLimit, timeCurrent: 0});
	browser.storage.local.set({["keep_working"]: JSON.stringify(timeWasteWebsites)})
	refreshTimeWasteWebsites();
}

function removeLimit(websiteNameToRemove) {
	timeWasteWebsites = timeWasteWebsites.filter( w => {
		return w.name != websiteNameToRemove;
	})
	browser.storage.local.set({["keep_working"]: JSON.stringify(timeWasteWebsites)})
	refreshTimeWasteWebsites();
}

function filterTimeLimitInput() {
	let timeLimitInputE = qS("#add-website-time-limit-input");
	if (timeLimitInputE.value) {
		// replace non digit characters
		timeLimitInputE.value = timeLimitInputE.value.replace(/\D/g,'');
	}

}

function refreshTimeWasteWebsites() {
	browser.storage.local.get({["keep_working"]: 1}).then((r) => {
		// https://stackoverflow.com/questions/3357553/how-do-i-store-an-array-in-localstorage
		if (r.keep_working !== 1) {
			timeWasteWebsites = JSON.parse(r.keep_working);
		}

		let websiteListE = qS(".website-list");
		websiteListE.innerHTML = "";
		for (let w of timeWasteWebsites) {
			let websiteRowE = cE(websiteListE, "div", null, "website-row");
			// delete limit on "minus button" click
			cE(websiteRowE, "div", "-", "remove-website-button").addEventListener('click', (e) => {
				removeLimit(qS(".website-row-name", e.target.parentElement).textContent)
			});

			cE(websiteRowE, "div", w.name, ["website-row-text", "website-row-name"]);
			cE(websiteRowE, "div", w.timeCurrent+"/"+w.timeLimit, ["website-row-text", "website-row-time"]);
		}
	})
}


var timeWasteWebsites = [];
refreshTimeWasteWebsites();

// to avoid script-src csp error
document.addEventListener('DOMContentLoaded', () => {
	// click + button event, to add a new website time limit
    // onClick's logic below:
    qS("#add-website-button").addEventListener('click', () => {
        addLimit();
    }); 
	// change value of the time limit input field, to remove non digit values
    qS("#add-website-time-limit-input").addEventListener("change", () => {
        filterTimeLimitInput();
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