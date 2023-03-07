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


// eg https://youtube.com
function getRootUrl(url) {
  return url.replace(/^(.*\/\/[^\/?#]*).*$/,"$1");
}



function refreshTimeWasteWebsites(updateLocalStorage=false) {
	browser.storage.local.get({["keep_working"]: 1}).then((r) => {
		// https://stackoverflow.com/questions/3357553/how-do-i-store-an-array-in-localstorage
		if (r.keep_working !== 1) {
			setTWW(JSON.parse(r.keep_working), updateLocalStorage);
		}
	})
}

// check if url in active tab has a limit, and if the limit on its hostname isn't already exceeded
// if that's the case, send a message to kill the pages with same hostname (to content.js scripts)
// if changeTime is true, increment currentTime for this hostname by 1
function manageTabs(incrementTime=false) {
	browser.tabs.query({currentWindow: true, active: true}).then((r) => {
		browser.storage.local.get({["keep_working"]: 1}).then((r) => {
			setTWW(JSON.parse(r.keep_working));
		});
		for (let w of getTWW()) {
			// if current page share the same hostname as a hostname with limit
			if (getRootUrl(r[0].url).includes(w.name)) {
				let foundIndex = getTWW().findIndex(i => i.name == w.name);
				let tempTTW = getTWW();
				if (incrementTime) {
					tempTTW[foundIndex].timeCurrent += 1;
					setTWW(tempTTW, true);
				}
			}
		}	
	})
}





// MAIN

var timeWasteWebsites = [];
// important here, needed to populate the TWW variable
refreshTimeWasteWebsites(true);
setInterval(() => {
	manageTabs(true);
	// the timer here will define the time unit of the whole extension, so it needs to be set to 60 sec in the final version
}, 5000)


// the one best way to exchange data between pop_up.js, background.js and content.js. Update the local storage and listen on local storage change events
browser.storage.onChanged.addListener((changes, area) => {
	const changedItems = Object.keys(changes);
	if (area == "local" && changedItems.filter(i => i == "keep_working").length > 0) {
		console.log("refresh from  bg")
		manageTabs();
  	}
});