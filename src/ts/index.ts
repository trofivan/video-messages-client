import { VideoPlayer } from './videoPlayer';

// @ts-ignore
const videoPlayer = new VideoPlayer(document.querySelector('canvas'));

const socket = new WebSocket('ws://127.0.0.1:8080');
socket.addEventListener('open', () => {
  console.log('Connection opened');

  socket.addEventListener('message', ({ data }) => {
    const {title, text} = JSON.parse(data);
    videoPlayer.sendMessage(title, text);
  });
});
// const button = document.querySelector('#send-message');
// // @ts-ignore
// button.addEventListener('click', () => {
//   videoPlayer.sendMessage(
//     'Structure and Interpretation of Computer Programs',
//     'Structure and Interpretation of Computer Programs is a computer science textbook by ' +
//     'Massachusetts Institute of Technology.',
//   );
// });
//
