export class AudioController {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;

  constructor() {
    this.init();
  }

  private init() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      this.audioContext = new AudioContextClass();
    }
  }

  public getContext(): AudioContext | null {
    return this.audioContext;
  }

  public async resumeContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  public setupAnalyser() {
    if (!this.audioContext) return;
    
    if (!this.analyser) {
      this.analyser = this.audioContext.createAnalyser();
      // Increased FFT size for better resolution on the visualizer
      this.analyser.fftSize = 2048; 
      // Smoother transition between values
      this.analyser.smoothingTimeConstant = 0.85;
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
    }
  }

  public disconnectCurrentSource() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
  }

  public async connectMicrophone(): Promise<void> {
    await this.resumeContext();
    this.setupAnalyser();
    this.disconnectCurrentSource();

    if (!this.audioContext || !this.analyser) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.source = this.audioContext.createMediaStreamSource(stream);
      this.source.connect(this.analyser);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      throw err;
    }
  }

  public connectAudioElement(audioElement: HTMLAudioElement) {
    this.resumeContext();
    this.setupAnalyser();
    this.disconnectCurrentSource();

    if (!this.audioContext || !this.analyser) return;

    try {
        this.source = this.audioContext.createMediaElementSource(audioElement);
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
    } catch (e) {
        console.warn("Re-using audio node or error connecting", e);
    }
  }

  public getFrequencyData(): Uint8Array {
    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);
      return this.dataArray;
    }
    return new Uint8Array(0);
  }

  public getWaveformData(): Uint8Array {
    if (this.analyser && this.dataArray) {
        this.analyser.getByteTimeDomainData(this.dataArray);
        return this.dataArray;
    }
    return new Uint8Array(0);
  }

  public getAverageFrequency(): number {
    const data = this.getFrequencyData();
    if (data.length === 0) return 0;
    
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    return sum / data.length;
  }
}

export const audioController = new AudioController();