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


// EG 1 https://old.reddit.com > reddit.com
// EG 2 http://google.com > google.com
function getRootDomain(url) {
	// trim everything after extension (eg .com)
	let rootUrl = url.replace(/^(.*\/\/[^\/?#]*).*$/,"$1")
	// remove the protocol
	let n = rootUrl.lastIndexOf('/');
	rootUrl = rootUrl.substring(n === -1 ? 0 : n + 1)
	// count the number of parts in the url left
	let parts = rootUrl.split('.'), partsCount = parts.length  

	if (partsCount > 2) {
		// If more than two parts, it's likely a subdomain
		// e.g., "old.reddit.com" -> "reddit.com"
		return `${parts[partsCount - 2]}.${parts[partsCount - 1]}`;
	} else if (partsCount === 2) {
		// If exactly two parts, it's already a root domain
		// e.g., "google.com"
		return rootUrl;
	} else {
		// If less than two parts, returns the full url
		// eg: about:config
		if (debug) {
			console.info('getRootDomain() raw url, rootUrl - url without dot?')
			console.info(url)
			console.info(rootUrl)
		}
	  return url;
  }


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
		if (r.keep_working_options !== 1) {
			options = JSON.parse(r.keep_working_options);
		}
	})
}
function refreshRewards(updateLocalStorage=false) {
	browser.storage.local.get({["keep_working_rewards"]: 1}).then((r) => {
		if (r.keep_working_rewards !== 1) {
			rewards = JSON.parse(r.keep_working_rewards);
		}
	})
}

// check if url in active tab has a limit, and if the limit on its hostname isn't already exceeded
// if that's the case, send a message to kill the pages with same hostname (to content.js scripts)
// if changeTime is true, increment currentTime for this hostname by 1
function manageTabs(incrementTime=false) {
	browser.tabs.query({currentWindow: true, active: true}).then((r) => {
		refreshTWW();
		const rootDomain = getRootDomain(r[0].url)
		if (debug) {
			console.info('manageTabs() current root domain')
			console.info(rootDomain)
		}
		for (let w of getTWW()) {
			if (rootDomain == w.name) {
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

// reset every current time passed on websites to 0, set next daily update date to current time + 24 hours
function updateNextDailyUpdateDate() {
	let tempTWW = timeWasteWebsites.map(l => {l.timeCurrent = 0; return l});
	setTWW(tempTWW, true);
	// remove seconds/milliseconds, to avoid shifting the precise set cron (hours+minutes) little by little
	let lastDailyUpdate = new Date(options.nextDailyUpdate)
	lastDailyUpdate.setSeconds(0)
	lastDailyUpdate.setMilliseconds(0)
	options.nextDailyUpdate = new Date().setTime(lastDailyUpdate.getTime() + LIMIT_RESET_TIME_CYCLE);
	browser.storage.local.set({["keep_working_options"]: JSON.stringify(options)});
}

// update rewards, for now will only add 1 point
function updateRewards(newPoints) {
	rewards.points += newPoints;
	browser.storage.local.set({["keep_working_rewards"]: JSON.stringify(rewards)});
}

// set default options and save them to storage, executed once on addon installation
function initStorage() {
	let currentDate = new Date()
	currentDate.setHours(8)
	currentDate.setMinutes(0)
	currentDate.setSeconds(0)
	currentDate.setMilliseconds(0)
	options = {nextDailyUpdate: currentDate.getTime() + LIMIT_RESET_TIME_CYCLE};
	browser.storage.local.set({["keep_working_options"]: JSON.stringify(options)})
	rewards = {points: 0};
	browser.storage.local.set({["keep_working_rewards"]: JSON.stringify(rewards)})
}

// reset the time passed on all hostnames with a limit, happens once a day
function manageDailyUpdate() {
	// if current date is higher than scheduled daily update
	if (new Date() >= new Date(options.nextDailyUpdate)) {
		// add points for every days, even if user didn't use its web browser for a few days (that's still a win right?)
		const newPoints = Math.ceil((new Date().getTime()-new Date(options.nextDailyUpdate).getTime())/LIMIT_RESET_TIME_CYCLE)
		updateNextDailyUpdateDate();
		updateRewards(newPoints);
	}
	// just some handy debug printing
	if (debug) {
		setTimeout(() => {
			console.info('manageDailyUpdate() timeWasteWebsites, options, nextDailyUpdate (human readable), rewards');
			console.info(timeWasteWebsites);
			console.info(options);
			console.info(new Date(options.nextDailyUpdate));
			console.info(rewards);
		},1000);
	}

}



// MAIN
// how much time between each time limit reset, in ms -> default 1 day, changed for debug
const LIMIT_RESET_TIME_CYCLE = 1000 * 60 * 60 * 24;
// the main interval speed -> default 1 min, also changed for debug 
const INTERVAL_CYCLE = 60 * 1000;
var timeWasteWebsites = [];
var options = {};
var rewards = {};
var debug = 0


// best way to be sure the local storage is correctly initated -> verify it is, browser.runtime.onInstalled is not the tool for this
browser.storage.local.get({["keep_working_options"]: 0}).then((r) => {
	// if storage isn't set
	if (r.keep_working_options == 0) {
		initStorage();
	}
	// important here, needed to populate the TWW variable
	refreshTWW(true);
	refreshOptions();
	refreshRewards();
	// delay the first daily update enough to be executed after every functions above
	setTimeout(() => { manageDailyUpdate()}, 1);

	setInterval(() => {
		manageTabs(true);
		manageDailyUpdate();
		// the timer here will define the time unit of the whole extension, so it needs to be set to 60 sec in the final version
	}, INTERVAL_CYCLE);

	// the one best way to exchange data between pop_up.js, background.js and content.js. Update the local storage and listen on local storage change events
	browser.storage.onChanged.addListener((changes, area) => {
		const changedItems = Object.keys(changes);
		if (area == "local") {
			if (changedItems.filter(i => i == "keep_working").length > 0) {
				manageTabs();
			} else if (changedItems.filter(i => i == "keep_working_options").length > 0) {
				refreshOptions();
			} else if (changedItems.filter(i => i == "keep_working_rewards").length > 0) {
				refreshRewards();
			}
		}
	});
});



