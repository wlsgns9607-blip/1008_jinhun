// Web Audio API mechanical vehicle sound synthesizer for audio diagnosis preview

let audioCtx: AudioContext | null = null;
let currentOscillators: (OscillatorNode | AudioNode)[] = [];

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function stopCurrentSound() {
  currentOscillators.forEach((node) => {
    try {
      if ('stop' in node && typeof node.stop === 'function') {
        node.stop();
      }
      node.disconnect();
    } catch {
      // ignore
    }
  });
  currentOscillators = [];
}

export function playCarSound(soundKey: string, onEnded?: () => void) {
  stopCurrentSound();
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  if (soundKey === 'belt_squeal') {
    // High-pitched squeal / chirp (귀뚜라미/끼익 겉벨트 슬립음)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.linearRampToValueAtTime(2800, now + 0.4);
    osc.frequency.linearRampToValueAtTime(2200, now + 0.8);
    osc.frequency.linearRampToValueAtTime(2900, now + 1.2);
    osc.frequency.linearRampToValueAtTime(2300, now + 1.8);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2600, now);
    filter.Q.setValueAtTime(4.0, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
    gain.gain.setValueAtTime(0.12, now + 1.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 2.0);

    currentOscillators.push(osc, gain);
    osc.onended = () => {
      stopCurrentSound();
      onEnded?.();
    };
  } else if (soundKey === 'transmission_whine') {
    // Whining gear / turbine noise (미션 위잉 소음)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(1250, now + 1.8);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.2);
    gain.gain.setValueAtTime(0.15, now + 1.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 2.2);

    currentOscillators.push(osc, gain);
    osc.onended = () => {
      stopCurrentSound();
      onEnded?.();
    };
  } else if (soundKey === 'pad_grind') {
    // High-pitched metal brake squeal (브레이크 패드 쇳소리)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(3200, now);
    osc.frequency.setValueAtTime(3400, now + 0.5);
    osc.frequency.setValueAtTime(3100, now + 1.0);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.1);
    gain.gain.setValueAtTime(0.14, now + 1.7);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 2.1);

    currentOscillators.push(osc, gain);
    osc.onended = () => {
      stopCurrentSound();
      onEnded?.();
    };
  } else if (soundKey === 'lowerarm_creak') {
    // Creaking rubber / shock spring (방지턱 찌그덕 하체 소음)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(95, now + 0.4);
    osc.frequency.linearRampToValueAtTime(140, now + 0.7);
    osc.frequency.linearRampToValueAtTime(80, now + 1.2);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.1);
    gain.gain.setValueAtTime(0.14, now + 0.9);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.5);

    currentOscillators.push(osc, gain);
    osc.onended = () => {
      stopCurrentSound();
      onEnded?.();
    };
  } else if (soundKey === 'engine_misfire') {
    // Misfire popcorn / thumping (엔진 부조 덜덜덜)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.setValueAtTime(75, now + 0.3);
    osc.frequency.setValueAtTime(50, now + 0.6);
    osc.frequency.setValueAtTime(85, now + 0.9);
    osc.frequency.setValueAtTime(60, now + 1.3);

    gain.gain.setValueAtTime(0.02, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
    gain.gain.setValueAtTime(0.12, now + 1.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.8);

    currentOscillators.push(osc, gain);
    osc.onended = () => {
      stopCurrentSound();
      onEnded?.();
    };
  } else if (soundKey === 'coolant_boil') {
    // Coolant boiling & bubbling sound (보글보글 물 끓는 소음)
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);

    // LFO to simulate bubbling rate
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(12, now);
    lfoGain.gain.setValueAtTime(60, now);
    lfo.connect(osc.frequency);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, now);
    filter.Q.setValueAtTime(2.5, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.1);
    gain.gain.setValueAtTime(0.15, now + 1.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 2.0);
    osc.stop(now + 2.0);

    currentOscillators.push(osc, lfo, gain);
    osc.onended = () => {
      stopCurrentSound();
      onEnded?.();
    };
  } else {
    // Generic warning beep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.8);
    currentOscillators.push(osc, gain);
    osc.onended = () => {
      stopCurrentSound();
      onEnded?.();
    };
  }
}
