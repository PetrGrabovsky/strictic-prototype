import { useRef } from 'react'

const DEFAULT_GAIN = 0.18
const ATTACK_SECONDS = 0.02
const MIN_GAIN = 0.0001
const RELEASE_TAIL_SECONDS = 0.03

/** One scheduled beep: when it starts, what it plays and for how long. */
type Tone = {
  durationSeconds: number
  frequencyHz: number
  gain?: number
  startOffsetSeconds: number
}

/** The rest-over cue: a rising three-note chime (≈ E5 → A5 → D6). */
const REST_DONE_CHIME: readonly Tone[] = [
  { durationSeconds: 0.16, frequencyHz: 660, startOffsetSeconds: 0 },
  { durationSeconds: 0.16, frequencyHz: 880, startOffsetSeconds: 0.15 },
  {
    durationSeconds: 0.34,
    frequencyHz: 1175,
    gain: 0.2,
    startOffsetSeconds: 0.3,
  },
]

/** The set-logged cue: one short, quiet mid blip (≈ C5). */
const SET_TICK: readonly Tone[] = [
  {
    durationSeconds: 0.07,
    frequencyHz: 520,
    gain: 0.07,
    startOffsetSeconds: 0,
  },
]

/** Schedules one sine-wave beep with a short attack/release on the context. */
const playTone = (context: AudioContext, tone: Tone): void => {
  const oscillator = context.createOscillator()
  const envelope = context.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = tone.frequencyHz
  oscillator.connect(envelope)
  envelope.connect(context.destination)
  const startTime = context.currentTime + tone.startOffsetSeconds
  envelope.gain.setValueAtTime(MIN_GAIN, startTime)
  envelope.gain.exponentialRampToValueAtTime(
    tone.gain ?? DEFAULT_GAIN,
    startTime + ATTACK_SECONDS,
  )
  envelope.gain.exponentialRampToValueAtTime(
    MIN_GAIN,
    startTime + tone.durationSeconds,
  )
  oscillator.start(startTime)
  oscillator.stop(startTime + tone.durationSeconds + RELEASE_TAIL_SECONDS)
}

/**
 * Web Audio cues for the workout: a rest-over chime and a set-logged tick.
 * One AudioContext is created lazily and shared; `unlock()` must run inside a
 * user gesture (a tap) so the first sound is allowed by autoplay policy. The
 * legacy webkit-prefixed constructor is intentionally dropped — every 2026
 * target browser ships `AudioContext`. Callers gate these on the mute setting
 * (unlike haptics).
 */
export const useAudio = () => {
  const contextRef = useRef<AudioContext | null>(null)

  const ensureContext = (): AudioContext | null => {
    if (typeof window === 'undefined' || !('AudioContext' in globalThis)) {
      return null
    }
    try {
      contextRef.current ??= new AudioContext()
      if (contextRef.current.state === 'suspended') {
        void contextRef.current.resume()
      }
    } catch {
      // Audio is optional; a blocked context simply means no sound.
      return null
    }
    return contextRef.current
  }

  const play = (tones: readonly Tone[]): void => {
    const context = ensureContext()
    if (context === null) {
      return
    }
    for (const tone of tones) {
      playTone(context, tone)
    }
  }

  return {
    restDone: () => play(REST_DONE_CHIME),
    tick: () => play(SET_TICK),
    unlock: ensureContext,
  }
}
