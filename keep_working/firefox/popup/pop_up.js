// UTILITY FUNCTIONS
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

// GET/SET
// timeWasteWebsites functions, to avoid editing it directly
function setTWW(v, updateLocalStorage=false) {
	timeWasteWebsites = v;
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


function getCron() {
	return cron;
}

function setCron(v, updateLocalStorage=false) {
	cron = v
	let [hours, minutes] = v.split(':'), nextDate = new Date()
	nextDate.setHours(hours)
	nextDate.setMinutes(minutes)
	nextDate.setSeconds(0)
	nextDate.setMilliseconds(0)
	if (updateLocalStorage) {
		browser.storage.local.set({["keep_working_options"]: JSON.stringify({nextDailyUpdate: nextDate.getTime()})});
	}
}


// OTHER
// add new website time limit
function addLimit() {
	let websiteName = qS("#add-website-name-input").value;
	let websiteTimeLimit = qS("#add-website-time-limit-input").value;
	pushTWW({name: websiteName, timeLimit: websiteTimeLimit, timeCurrent: 0});
	refreshTimeWasteWebsites();
}

// remove website time limit
function removeLimit(websiteNameToRemove) {
	setTWW(getTWW().filter( w => {
		return w.name != websiteNameToRemove;
	}), true);
}

// set a new cron time
function changeCronTime() {
	let changeCronInputE = qS("#change-cron-input");
	setCron(changeCronInputE.value, true)
}

// remove non digit values
function filterTimeLimitInput() {
	let timeLimitInputE = qS("#add-website-time-limit-input");
	if (timeLimitInputE.value) {
		// replace non digit characters
		timeLimitInputE.value = timeLimitInputE.value.replace(/\D/g,'');
	}

}

// recreate the pop up ui list, to get updated time from background.js, add a new limit etc.
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

function refreshCronUI() {
	// display current cron in pop up
	let changeCronE = qS("#change-cron-input");
	let [hours, minutes] = getCron().split(':').map(Number)
	formattedTime = String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
	changeCronE.value = formattedTime
}

function refreshCron() {
	browser.storage.local.get({["keep_working_options"]: 1}).then((r) => {
		if (r.keep_working_options !== 1) {
			let nextDailyUpdate = new Date(JSON.parse(r.keep_working_options).nextDailyUpdate)
			let [hours, minutes] = [nextDailyUpdate.getHours(), nextDailyUpdate.getMinutes()]
			setCron(String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0'))
		}
		refreshCronUI();
	})

}

// rewards are rarely changed, so their content can be generated and displayed only once when the pop up is openned
function refreshRewards() {
	browser.storage.local.get({["keep_working_rewards"]: 1}).then((r) => {
		rewards = JSON.parse(r.keep_working_rewards);
		qS("#points").textContent = "Points: " + rewards.points;
	})
}




// MAIN

var timeWasteWebsites = [];
var cron = '06:00';
refreshCron();
refreshTimeWasteWebsites();
refreshRewards();

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
    // add listener to change the time at wich the website counters reset
    qS("#change-cron-button").addEventListener('click', () => {
        changeCronTime();
    }); 


});

// the one best way to exchange data between pop_up.js, background.js and content.js. Update the local storage and listen on local storage change events
// TODO add small delay between refresh here, to avoid possible double reload
browser.storage.onChanged.addListener((changes, area) => {
	const changedItems = Object.keys(changes);
	if (area == "local" && changedItems.filter(i => i == "keep_working").length > 0) {
		refreshTimeWasteWebsites();
  	} else if (changedItems.filter(i => i == "keep_working_rewards").length > 0) {
		refreshRewards();
	} else if (changedItems.filter(i => i == "keep_working_options").length > 0) {
		refreshCron();
	}
});

