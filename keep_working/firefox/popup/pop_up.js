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
		}
	}
	if (id) {
		newElement.id = id;
	}
	return parent.appendChild(newElement);
}

// timeWasteWebsites functions, to avoid editing it directly
function setTWW(v, updateLocalStorage=false) {
	timeWasteWebsites = v;
	console.log(v, updateLocalStorage)
	if (updateLocalStorage) {
		browser.storage.local.set({["keep_working"]: JSON.stringify(v)});
	}
}
function getTWW() {
	return timeWasteWebsites;
}
function pushTWW(websiteObject) {
	timeWasteWebsites.push(websiteObject);
	setTWW(timeWasteWebsites, true);
}

// add new website time limit
function addLimit() {
	let websiteName = qS("#add-website-name-input").value;
	let websiteTimeLimit = qS("#add-website-time-limit-input").value;
	pushTWW({name: websiteName, timeLimit: websiteTimeLimit, timeCurrent: 0});
	refreshTimeWasteWebsites();
}

function removeLimit(websiteNameToRemove) {
	setTWW(getTWW().filter( w => {
		return w.name != websiteNameToRemove;
	}), true);
}

function filterTimeLimitInput() {
	let timeLimitInputE = qS("#add-website-time-limit-input");
	if (timeLimitInputE.value) {
		// replace non digit characters
		timeLimitInputE.value = timeLimitInputE.value.replace(/\D/g,'');
	}

}

// recreate the pop ui list, to get updated time from background.js, add a new limit etc.
function refreshPopUpUI() {
		let websiteListE = qS(".website-list");
		websiteListE.innerHTML = "";
		for (let w of getTWW()) {
			let websiteRowE = cE(websiteListE, "div", null, "website-row");
			// delete limit on "minus button" click
			cE(websiteRowE, "div", "-", "remove-website-button").addEventListener('click', (e) => {
				removeLimit(qS(".website-row-name", e.target.parentElement).textContent)
			});

			cE(websiteRowE, "div", w.name, ["website-row-text", "website-row-name"]);
			cE(websiteRowE, "div", w.timeCurrent+"/"+w.timeLimit, ["website-row-text", "website-row-time"]);
		}
}

// refresh the limits list (the TWW var), then update the PopUp UI to match the list
function refreshTimeWasteWebsites() {
	browser.storage.local.get({["keep_working"]: 1}).then((r) => {
		// https://stackoverflow.com/questions/3357553/how-do-i-store-an-array-in-localstorage
		if (r.keep_working !== 1) {
			setTWW(JSON.parse(r.keep_working));
		}
		refreshPopUpUI();
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

// the one best way to exchange data between pop_up.js, background.js and content.js. Update the local storage and listen on local storage change events
// TODO add small delay between refresh here, to avoid possible double reload
browser.storage.onChanged.addListener((changes, area) => {
	const changedItems = Object.keys(changes);
	if (area == "local" && changedItems.filter(i => i == "keep_working").length > 0) {
		console.log("refresh from pop up")
		refreshTimeWasteWebsites();
  	}
});