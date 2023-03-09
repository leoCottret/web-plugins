// TWW functions
function setTWW(v, updateLocalStorage=false) {
	timeWasteWebsites = v;
	if (updateLocalStorage) {
		browser.storage.local.set({["keep_working"]: JSON.stringify(v)});
	}
}

function getTWW() {
	return timeWasteWebsites;
}



Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

//var date = new Date();

//console.log(date.addDays(5));


// eg https://youtube.com
function getRootUrl(url) {
  return url.replace(/^(.*\/\/[^\/?#]*).*$/,"$1");
}



function refreshTWW(updateLocalStorage=false) {
	browser.storage.local.get({["keep_working"]: 1}).then((r) => {
		// https://stackoverflow.com/questions/3357553/how-do-i-store-an-array-in-localstorage
		if (r.keep_working !== 1) {
			setTWW(JSON.parse(r.keep_working), updateLocalStorage);
		}
	})
}

function refreshOptions(updateLocalStorage=false) {
	browser.storage.local.get({["keep_working_options"]: 1}).then((r) => {
		// https://stackoverflow.com/questions/3357553/how-do-i-store-an-array-in-localstorage
		if (r.keep_working_options !== 1) {
			options = JSON.parse(r.keep_working_options);
		}
	})
}

// check if url in active tab has a limit, and if the limit on its hostname isn't already exceeded
// if that's the case, send a message to kill the pages with same hostname (to content.js scripts)
// if changeTime is true, increment currentTime for this hostname by 1
function manageTabs(incrementTime=false) {
	browser.tabs.query({currentWindow: true, active: true}).then((r) => {
		refreshTWW();
		for (let w of getTWW()) {
			// if current page share the same hostname as a hostname with limit
			if (getRootUrl(r[0].url).includes(w.name)) {
				let foundIndex = getTWW().findIndex(i => i.name == w.name);
				let tempTWW = getTWW();
				if (incrementTime) {
					tempTWW[foundIndex].timeCurrent += 1;
					setTWW(tempTWW, true);
				}
			}
		}	
	})
}

// update the date at which the time passed on all hostnames with a limit are set to 0
function updateNextDailyUpdateDate() {
	let tempTWW = timeWasteWebsites.map(l => {l.timeCurrent = 0; return l});
	setTWW(tempTWW, true);
	options.nextDailyUpdate = new Date().addDays(1);
	browser.storage.local.set({["keep_working_options"]: JSON.stringify(options)});
}

// set default options and save them to storage, executed once on addon installation
function initOptions() {
	let options = {nextDailyUpdate: new Date().addDays(1)};
	browser.storage.local.set({["keep_working_options"]: JSON.stringify(options)});
}

// reset the time passed on all hostnames with a limit, happens once a day
function manageDailyUpdate() {
	if (new Date() > new Date(options.nextDailyUpdate)) {
		updateNextDailyUpdateDate();
	}
}



// MAIN

// TODO Move this to be executed only on extension install
browser.runtime.onInstalled.addListener(initOptions);

var timeWasteWebsites = [];
var options = [];
// important here, needed to populate the TWW variable
refreshTWW(true);
refreshOptions();

setInterval(() => {
	manageTabs(true);
	manageDailyUpdate();
	// the timer here will define the time unit of the whole extension, so it needs to be set to 60 sec in the final version
}, 5000);


// the one best way to exchange data between pop_up.js, background.js and content.js. Update the local storage and listen on local storage change events
browser.storage.onChanged.addListener((changes, area) => {
	const changedItems = Object.keys(changes);
	if (area == "local") {
		if (changedItems.filter(i => i == "keep_working").length > 0) {
			manageTabs();
	  	} else if (changedItems.filter(i => i == "keep_working_options").length > 0) {
	  		refreshOptions();
	  	}
	}
});