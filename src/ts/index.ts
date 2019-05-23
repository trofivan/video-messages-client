import { VideoPlayer } from './videoPlayer';

const videoPlayer = new VideoPlayer(document.querySelector('canvas.player'));

const button = document.querySelector('#send-message');
button.addEventListener('click', () => {
  videoPlayer.pauseStreaming();
  setTimeout(() => videoPlayer.startStreaming(), 1000);
});
