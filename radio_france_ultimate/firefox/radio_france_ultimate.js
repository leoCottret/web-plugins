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
		minus10Element = player.querySelector('.backward');
		plus10Element = player.querySelector('.forward');
		audio = document.querySelector('audio');
		// sometimes the audio is used, sometimes the video (eg on direct page)
		video = document.querySelector('video');

		// add key events
		window.addEventListener('keydown', (event) => {
			// we only interact with the player if we're not in an input text
			// and we don't want to stop the defaut behavior of non player keys
			if (document.activeElement.nodeName != 'INPUT' && event.code in supportedKeys) {
				// prevent the page going down or the other buttons being pressed with space bar
				event.preventDefault(); // disables the browser's default behavior
			  	event.stopPropagation(); // disables the bubbling phase listeners
				
				if (event.key == supportedKeys.ArrowLeft) {
					minus10Element.click();
				// space bar
				} else if (event.key == supportedKeys.Space) {
					playElement = player.querySelector('.playing');
					pauseElement = player.querySelector('.paused') || player.querySelector('.stopped');

					(playElement) ? playElement.click() : pauseElement.click();
				} else if (event.key == supportedKeys.ArrowRight) {
					plus10Element.click();
				} else if (event.key == supportedKeys.ArrowUp) {
					(audio.volume + 0.1 > 1) ? audio.volume = 1 : audio.volume += 0.1;
					(video.volume + 0.1 > 1) ? video.volume = 1 : video.volume += 0.1;
				} else if (event.key == supportedKeys.ArrowDown) {
					(audio.volume - 0.1 < 0) ? audio.volume = 0 : audio.volume -= 0.1;
					(video.volume - 0.1 < 0) ? video.volume = 0 : video.volume -= 0.1;
				}
			}
		}, true);

		clearInterval(addButtonsInterval)
	}
}, 500);