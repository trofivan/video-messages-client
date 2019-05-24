import { VideoPlayer } from './videoPlayer';

const videoPlayer = new VideoPlayer(document.querySelector('canvas'));

const button = document.querySelector('#send-message');
// @ts-ignore
button.addEventListener('click', () => {
  videoPlayer.sendMessage(
    'Structure and Interpretation of Computer Programs',
    'Structure and Interpretation of Computer Programs is a computer science textbook by ' +
    'Massachusetts Institute of Technology.',
  );
});
