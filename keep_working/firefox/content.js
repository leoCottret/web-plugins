// refresh TWW data
function refreshTWW() {
	browser.storage.local.get({["keep_working"]: 1}).then((r) => {
		if (r.keep_working !== 1) {
			timeWasteWebsites = JSON.parse(r.keep_working);
		}
	})
}

// kill a page (TODO improve it with a clean html page, and maybe a less brutal way to kill the page)
function killPage() {
	let i = 0;
	let killInterval = setInterval(() => {
			document.body.innerHTML = "Keep working!";
			window.stop();
			i++;
			if (i > 5) {
				clearinterval(killInterval);
			}
	}, 500);
}

// checks if the current page needs to be killed because the user has already wasted enough time on this hostname
function killPageIfNeeded() {
	refreshTWW();
	for (let w of timeWasteWebsites) {
		if (window.location.hostname.includes(w.name) && w.timeCurrent >= w.timeLimit) {
			killPage();
		}
	}
} 



// MAIN
var timeWasteWebsites = [];
killPageIfNeeded();

// the one best way to exchange data between pop_up.js, background.js and content.js. Update the local storage and listen on local storage change events
browser.storage.onChanged.addListener((changes, area) => {
	const changedItems = Object.keys(changes);
	if (area == "local" && changedItems.filter(i => i == "keep_working").length > 0) {
		killPageIfNeeded();
  	}
});