/**
 * 16-bit PCM Mono WAV Audio Encoder for browser export & playback.
 * Matches Kotlin WavAudioEncoder logic.
 */
export class WavEncoder {
  private sampleRate: number;
  private pcmSamples: number[] = [];

  constructor(sampleRate: number = 4000) {
    this.sampleRate = sampleRate;
  }

  public appendSamples(samples: number[]): void {
    for (let i = 0; i < samples.length; i++) {
      this.pcmSamples.push(Math.max(-32768, Math.min(32767, samples[i])));
    }
  }

  public clear(): void {
    this.pcmSamples = [];
  }

  public getSamples(): number[] {
    return [...this.pcmSamples];
  }

  public encodeToBlob(): Blob {
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = (this.sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const dataSize = this.pcmSamples.length * 2;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    this.writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, this.sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // data sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write PCM samples
    let offset = 44;
    for (let i = 0; i < this.pcmSamples.length; i++) {
      view.setInt16(offset, this.pcmSamples[i], true);
      offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}
