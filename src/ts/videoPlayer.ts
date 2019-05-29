import { MESSAGE } from './constants';

const { MINIMAL_TIMEOUT } = MESSAGE;

interface IMessage {
  title: string;
  text: string;
  timestamp: number;
}

interface IHashMap {
  [key: number]: string;
}

interface IVideoPlayer {
  canvasContainer: HTMLCanvasElement;
  videoContainerrs: HTMLVideoElement;
}

export class VideoPlayer implements IVideoPlayer {
  private readonly canvasContainer: HTMLCanvasElement;
  private readonly videoContainer: HTMLVideoElement;
  private canvasContext: CanvasRenderingContext2D;
  private animationFrameId: number | undefined;
  private message: IMessage;

  constructor(canvasSelector: HTMLCanvasElement) {
    this.canvasContainer = canvasSelector;
    // @ts-ignore
    this.canvasContext = this.canvasContainer.getContext('2d');

    this.resizeCanvasElement();
    window.addEventListener('resize', this.resizeCanvasElement, false);

    this.videoContainer = document.createElement('video');
    navigator.mediaDevices
      .getUserMedia({video: true})
      .then(this.initStreaming);

    this.message = {
      title: 'Canvas video',
      text: 'Streaming is started',
      timestamp: performance.now() + MINIMAL_TIMEOUT,
    };
  }

  public startStreaming = (): void => {
    this.animationFrameId = requestAnimationFrame(this.renderCanvasFrame);
  }

  public pauseStreaming = (): void => {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  public sendMessage = (title: string, text: string): void => {
    this.message = {
      title,
      text,
      timestamp: performance.now() + this.calculateMessageTimeout(title, text),
    };
  }

  private calculateMessageTimeout = (title: string, text: string): number => {
    const time = [...title.split(' '), ...text.split(' ')].length * 1000 / 2;
    return time > MINIMAL_TIMEOUT ? time : MINIMAL_TIMEOUT;
  }

  private getCanvasImagePosition(): [number, number, number, number] {
    const {width: canvasWidth, height: canvasHeight} = this.canvasContainer;
    const {videoWidth, videoHeight} = this.videoContainer;

    const deltaWidth = Math.abs(canvasWidth - videoWidth);
    const deltaHeight = Math.abs(canvasHeight - videoHeight);

    const isLandscapeOrientation = deltaWidth > deltaHeight;

    const width = isLandscapeOrientation ? canvasWidth : videoWidth * canvasHeight / videoHeight;
    const height = isLandscapeOrientation ? videoHeight * canvasWidth / videoWidth : canvasHeight;

    const offsetX = (width - canvasWidth) / 2;
    const offsetY = (height - canvasHeight) / 2;

    return [-offsetX, -offsetY, width, height];
  }

  private clearCanvas = (): void =>
    this.canvasContext.clearRect(0, 0, this.canvasContainer.width, this.canvasContainer.height)

  private renderCanvasFrame = (): void => {
    this.clearCanvas();
    this.canvasContext.drawImage(this.videoContainer, ...this.getCanvasImagePosition());
    this.renderMessage();

    this.animationFrameId = requestAnimationFrame(this.renderCanvasFrame);
  }

  private renderMessage = (): void => {
    if (this.message && performance.now() < this.message.timestamp) {
      this.renderMessageBox();
      this.renderMessageContent();
    }
  }

  private textToLinesHashMap = (text: string, textLinesCount: number): IHashMap => {
    const textWordsArray = text.split(' ');
    const textLineWordsCount = Math.floor(textWordsArray.length / textLinesCount);

    return text.split(' ').reduce((acc: IHashMap, word: string, index: number): IHashMap => {
      const lineNumber = Math.floor(index / textLineWordsCount);

      return {
        ...acc,
        [lineNumber]: acc[lineNumber] ? [acc[lineNumber], word].join(' ') : word,
      };
    }, {});
  }

  private renderMessageContent = (): void => {
    const {title, text} = this.message;
    const {x, y} = this.calculateMessageBoxCoordinates();
    const offsetLeft = x + 20;
    this.canvasContext.fillStyle = `rgba(255, 255, 255, ${this.getAlphaValue()})`;

    const titleFont = this.getFontStyle('TITLE');
    const titleLinesCount = this.calculateTextLinesCount(title, titleFont);
    const titleLines = this.textToLinesHashMap(title, titleLinesCount);
    const titleOffsetTop = y + 10;

    this.canvasContext.font = titleFont;
    Object.keys(titleLines).forEach((_, index: number): void => {
      this.canvasContext.fillText(
        titleLines[index],
        offsetLeft,
        titleOffsetTop + (index + 1) * MESSAGE.TITLE.FONT_SIZE,
      );
    });

    const textFont = this.getFontStyle('TEXT');
    const textLinesCount = this.calculateTextLinesCount(text, textFont);
    const textLines = this.textToLinesHashMap(text, textLinesCount);
    const textOffsetTop = titleOffsetTop + MESSAGE.TITLE.FONT_SIZE + MESSAGE.TITLE.FONT_SIZE * titleLinesCount;

    this.canvasContext.font = textFont;
    Object.keys(textLines).forEach((_, index: number): void => {
      this.canvasContext.fillText(
        textLines[index],
        offsetLeft,
        textOffsetTop + (index + 1) * MESSAGE.TEXT.FONT_SIZE,
      );
    });
  }

  private getAlphaValue = (): number => {
    const delta = (this.message.timestamp - performance.now()) / 1000;
    return delta < 1 ? delta : 1;
  }

  private calculateTextLinesCount = (text: string, font: string): number => {
    this.canvasContext.font = font;
    const textWidth = this.canvasContext.measureText(text).width;
    const messageBoxWidth = this.calculateMessageBoxWidth();

    return Math.ceil(textWidth / (messageBoxWidth - messageBoxWidth * 0.05));
  }

  private getFontStyle = (type: 'TITLE' | 'TEXT'): string =>
    `${MESSAGE[type].FONT_WEIGHT} ${MESSAGE[type].FONT_SIZE}px ${MESSAGE[type].FONT_FAMILY}`

  private calculateMessageHeight = (): number => {
    const {title, text} = this.message;

    const titleLinesCount = this.calculateTextLinesCount(title, this.getFontStyle('TITLE'));
    const textLinesCount = this.calculateTextLinesCount(text, this.getFontStyle('TEXT'));

    return titleLinesCount * MESSAGE.TITLE.FONT_SIZE + textLinesCount * MESSAGE.TEXT.FONT_SIZE + 50;
  }

  private calculateMessageBoxWidth = () => this.canvasContainer.width - this.canvasContainer.width * 0.1;

  private calculateMessageBoxCoordinates = () => {
    const width = this.calculateMessageBoxWidth();
    const height = this.calculateMessageHeight() + 20;

    return {
      width,
      height,
      x: this.canvasContainer.width * 0.05,
      y: this.canvasContainer.height - height - this.canvasContainer.height * 0.05,
    };
  }

  private renderMessageBox = () => {
    const {x, y, width, height} = this.calculateMessageBoxCoordinates();
    const radius = 15;
    const alpha = this.getAlphaValue();

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

    this.canvasContext.fillStyle = `rgba(0, 0, 0, ${alpha < 0.6 ? alpha : 0.6})`;
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
