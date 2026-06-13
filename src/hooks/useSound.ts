/**
 * useSound — Web Audio API synthesiser (no static files required).
 *
 * All sounds are generated programmatically so the app works offline
 * and doesn't need any /public/sounds/ assets.
 *
 * The AudioContext is created lazily on the first user-triggered play()
 * call to satisfy browser autoplay policies.
 */
import { useCallback, useRef } from 'react'

export type SoundKey = 'deal' | 'shuffle' | 'correct' | 'incorrect' | 'chip'

// ── Low-level helpers ─────────────────────────────────────────────────────

/** Play a single oscillator tone with an exponential volume fade-out */
function tone(
  ctx: AudioContext,
  type: OscillatorType,
  freqStart: number,
  freqEnd: number,
  gainPeak: number,
  startTime: number,
  duration: number,
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = type
  osc.frequency.setValueAtTime(freqStart, startTime)
  if (freqEnd !== freqStart) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration)
  }

  gain.gain.setValueAtTime(gainPeak, startTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  osc.start(startTime)
  osc.stop(startTime + duration + 0.02)
}

/** Play a burst of band-pass–filtered white noise */
function noiseBurst(
  ctx: AudioContext,
  gainPeak: number,
  startTime: number,
  duration: number,
  filterFreq: number,
  filterQ: number,
) {
  const sampleRate = ctx.sampleRate
  const frameCount = Math.ceil(sampleRate * duration)
  const buffer = ctx.createBuffer(1, frameCount, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frameCount; i++) {
    data[i] = Math.random() * 2 - 1
  }

  const src = ctx.createBufferSource()
  src.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = filterFreq
  filter.Q.value = filterQ

  const gain = ctx.createGain()
  src.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  gain.gain.setValueAtTime(gainPeak, startTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  src.start(startTime)
  src.stop(startTime + duration + 0.02)
}

// ── Sound designs ─────────────────────────────────────────────────────────

const SOUNDS: Record<SoundKey, (ctx: AudioContext) => void> = {
  /** Short crisp click — chip placed on felt */
  chip(ctx) {
    const t = ctx.currentTime
    tone(ctx, 'triangle', 1200, 700, 0.30, t, 0.055)
    tone(ctx, 'sine',     200,  200, 0.15, t, 0.04)
  },

  /** Quick swish — single card dealt */
  deal(ctx) {
    const t = ctx.currentTime
    noiseBurst(ctx, 0.40, t, 0.08, 2200, 3.5)
    tone(ctx, 'triangle', 550, 380, 0.07, t, 0.07)
  },

  /** Riffle shuffle — three quick noise bursts */
  shuffle(ctx) {
    const t = ctx.currentTime
    for (let i = 0; i < 4; i++) {
      noiseBurst(ctx, 0.28, t + i * 0.055, 0.05, 1600, 2.5)
    }
  },

  /** Ascending three-note chime — correct answer */
  correct(ctx) {
    const t = ctx.currentTime
    // C5 → E5 → G5  (major triad, bright)
    tone(ctx, 'triangle', 523, 523, 0.28, t,        0.18)
    tone(ctx, 'triangle', 659, 659, 0.28, t + 0.13, 0.20)
    tone(ctx, 'triangle', 784, 784, 0.22, t + 0.26, 0.22)
  },

  /** Descending dull thud — wrong answer */
  incorrect(ctx) {
    const t = ctx.currentTime
    tone(ctx, 'sawtooth', 320, 140, 0.18, t, 0.28)
    tone(ctx, 'sine',     160, 80,   0.25, t, 0.32)
  },
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useSound(enabled = true) {
  const ctxRef = useRef<AudioContext | null>(null)

  const play = useCallback(
    (key: SoundKey) => {
      if (!enabled) return

      // Create AudioContext lazily inside a user-gesture handler
      if (!ctxRef.current) {
        try {
          ctxRef.current = new AudioContext()
        } catch {
          return  // audio not supported
        }
      }

      const ctx = ctxRef.current

      const run = () => {
        try {
          SOUNDS[key](ctx)
        } catch {
          // Silently ignore any synthesis errors
        }
      }

      // Resume if the browser auto-suspended the context
      if (ctx.state === 'suspended') {
        ctx.resume().then(run).catch(() => undefined)
      } else {
        run()
      }
    },
    [enabled],
  )

  return { play }
}
