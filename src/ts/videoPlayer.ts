import { MESSAGE_TIMEOUT } from './constants';

export class VideoPlayer {
  private readonly canvasContainer: HTMLCanvasElement;
  private readonly videoContainer: HTMLVideoElement;
  private canvasContext: CanvasRenderingContext2D;
  private animationFrameId: number | undefined;

  constructor(canvasSelector: HTMLCanvasElement) {
    this.canvasContainer = canvasSelector;
    this.canvasContext = this.canvasContainer.getContext('2d');
    this.resizeCanvasElement();
    window.addEventListener('resize', this.resizeCanvasElement, false);

    this.videoContainer = document.createElement('video');
    navigator.mediaDevices
      .getUserMedia({video: true})
      .then(this.initStreaming);
  }

  public startStreaming() {
    this.animationFrameId = requestAnimationFrame(this.renderCanvasFrame);
  }

  public pauseStreaming() {
    cancelAnimationFrame(this.animationFrameId);
  }

  private getCanvasImagePosition() {
    const { width: canvasWidth, height: canvasHeight } = this.canvasContainer;
    const { videoWidth, videoHeight } = this.videoContainer;

    const deltaWidth = Math.abs(canvasWidth - videoWidth);
    const deltaHeight = Math.abs(canvasHeight - videoHeight);

    const isLandscapeOrientation = deltaWidth > deltaHeight;

    const width = isLandscapeOrientation ? canvasWidth : videoWidth * canvasHeight / videoHeight;
    const height = isLandscapeOrientation ? videoHeight * canvasWidth / videoWidth : canvasHeight;

    const offsetX = (width - canvasWidth) / 2;
    const offsetY = (height - canvasHeight) / 2;

    return [-offsetX, -offsetY, width, height];
  }

  private renderCanvasFrame = () => {
    this.getCanvasImagePosition();
    this.renderImage();
    this.renderMessage();
  }

  private renderImage = () => {
    this.canvasContext.drawImage(this.videoContainer, ...this.getCanvasImagePosition());
    this.animationFrameId = requestAnimationFrame(this.renderCanvasFrame);
  }

  private renderMessage = () => {
    this.renderMessageBackground();
  }

  private renderMessageBackground = () => {
    const radius = 20;

    const width = this.canvasContainer.width - this.canvasContainer.width * 0.1;
    const height = 100;

    const x = this.canvasContainer.width * 0.05;
    const y = this.canvasContainer.height - height - this.canvasContainer.height * 0.05;

    const alpha = 0.7;

    this.canvasContext.beginPath();
    this.canvasContext.moveTo(x + radius, y);
    this.canvasContext.lineTo(x + width - radius, y);
    this.canvasContext.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.canvasContext.lineTo(x + width, y + height - radius);
    this.canvasContext.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.canvasContext.lineTo(x + radius, y + height);
    this.canvasContext.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.canvasContext.lineTo(x, y + radius);
    this.canvasContext.quadraticCurveTo(x, y, x + radius, y);
    this.canvasContext.closePath();

    this.canvasContext.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    this.canvasContext.fill();
  }

  private resizeCanvasElement = () => {
    this.canvasContainer.width = window.innerWidth;
    this.canvasContainer.height = window.innerHeight;
  }

  private initStreaming = (stream: MediaStream) => {
    this.videoContainer.srcObject = stream;
    this.videoContainer.play();
    this.startStreaming();
  }
}
