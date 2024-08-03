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
			document.body.innerHTML = "Keep Working!";
			window.stop();
			i++;
			if (i > 5) {
				clearInterval(killInterval);
			}
	}, 500);
}

// checks if the current page needs to be killed because the user has already wasted enough time on this hostname
function killPageIfNeeded() {
	refreshTWW();
	setTimeout(() => {
		for (let w of timeWasteWebsites) {
			if (window.location.hostname.includes(w.name)) {
				if (w.timeCurrent >= w.timeLimit) {
					killPage(w.timeCurrent);
				} else {
					let diff = w.timeLimit - w.timeCurrent
					if (diff >= 0 && diff <= 2) {
						showNotification(`Only ${diff} minutes left on ${w.name}!`);
					}
				}
			}
		}
	}, 2000)
} 


// displays a notification for about 1 minute (or until the user click on it), to warn the user that the page will be destroyed
function showNotification(message) {
	if (document.querySelector('#keep-working-notification') === null) {
		const notification = document.createElement('div');
		notification.textContent = message;

		// Style the notification
		notification.id = 'keep-working-notification'
		notification.style.position = 'absolute';
		notification.style.top = '0px';
		notification.style.right = '0px';
		notification.style.backgroundColor = '#000';
		notification.style.color = 'lightgreen';
		notification.style.padding = '60px';
		notification.style.width = '1200px'
		notification.style.border = 'solid lightgreen 2px';
		notification.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.1)';
		notification.style.zIndex = '10000';
		notification.style.textAlign = 'center';
		notification.style.display = 'initial';
		notification.style.transition = 'all 1.5s';
		notification.style.opacity = '0.8';
		notification.style.cursor = 'pointer';

		// Append the notification to the body
		document.body.appendChild(notification);
		var notificationE = document.querySelector('#keep-working-notification'), notificationEOffsetRight = 20
		var notificationInterval = setInterval(() => {
			// slowly move the pop up towards the bottom left
			notificationE.style.right = (notificationEOffsetRight+=1)+"px" 
			notificationE.style.top = (notificationEOffsetRight+=1)+"px" 
			if (document.querySelector('#keep-working-notification') === null) {
				clearInterval(notificationInterval)
			}
		}, 300)
		setTimeout(() => {
			notificationE.style.opacity = 0
			// since I check for an existing notification, I intentionally keep it in the DOM for 1 minute to avoid triggering more than 2 notifications per minute
			setTimeout(() => {
				if (document.querySelector('#keep-working-notification')) {
					notificationE.remove();
				}
				killPageIfNeeded()
			}, 2000)
		}, 60000)

		// if user click on the notification, just hide it (cf comment above)
		notificationE.addEventListener('click', () => {
			notificationE.style.opacity = 0
			setTimeout(() => {
				notification.style.display = 'none';
			}, 2000)
		});

	}
}



// MAIN
var timeWasteWebsites = [];
setTimeout(() => killPageIfNeeded(), 5000)

// the one best way to exchange data between pop_up.js, background.js and content.js. Update the local storage and listen on local storage change events
browser.storage.onChanged.addListener((changes, area) => {
	const changedItems = Object.keys(changes);
	if (area == "local" && changedItems.filter(i => i == "keep_working").length > 0) {
		killPageIfNeeded();
  	}
});