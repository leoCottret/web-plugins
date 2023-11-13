addButtonsInterval = setInterval(() => {
	if (document.querySelector('#player')) {
		supportedKeys = {
			// code: key
			ArrowLeft: 'ArrowLeft',
			Space: ' ',
			ArrowRight: 'ArrowRight',
			ArrowUp: 'ArrowUp',
			ArrowDown: 'ArrowDown'
		};

		// get static buttons
		player = document.querySelector('#player');
		minus15Element = player.querySelector('.minus > button');
		plus30Element = player.querySelector('.plus > button');
		playElement = player.querySelector('[data-testid="mainButton"]');
		volumeElement = player.querySelector(".VolumeSetting-control > input")
		currentVolume = Number(volumeElement.getAttribute('aria-valuenow')) // fix first volume value that is randomly set to 100
		volumeElement.value = currentVolume

		// add key events
		window.addEventListener('keydown', (event) => {
			// we only interact with the player if we're not in an input text
			// and we don't want to stop the defaut behavior of non player keys
			if (document.activeElement.nodeName != 'INPUT' && event.code in supportedKeys) {
				// prevent the page going down or the other buttons being pressed with space bar
				event.preventDefault(); // disables the browser's default behavior
			  	event.stopPropagation(); // disables the bubbling phase listeners
				
				if (event.key == supportedKeys.ArrowLeft) {
					minus15Element.click();
				// space bar
				} else if (event.key == supportedKeys.Space) {
					playElement.click();
				} else if (event.key == supportedKeys.ArrowRight) {
					plus30Element.click();
				} else if (event.key == supportedKeys.ArrowUp || event.key == supportedKeys.ArrowDown) {
					if (event.key == supportedKeys.ArrowUp) {
						(currentVolume + 10 > 100) ? currentVolume = 100 : currentVolume += 10;
					} else {
						(currentVolume - 10 < 0) ? currentVolume = 0 : currentVolume -= 10;
					}
					volumeElement.value = currentVolume
					volumeElement.dispatchEvent(new Event('change'))
					volumeElement.dispatchEvent(new Event('change'))
				}
			}
		}, true);

		clearInterval(addButtonsInterval)
	}
}, 500);