'use client'

import { useRef } from 'react'

const DEFAULT_GAIN = 0.18
const ATTACK_SECONDS = 0.02
const MIN_GAIN = 0.0001
const RELEASE_TAIL_SECONDS = 0.03

/** Schedules one sine-wave beep with a short attack/release on the context. */
const playTone = (
  context: AudioContext,
  frequency: number,
  startOffsetSeconds: number,
  durationSeconds: number,
  gain = DEFAULT_GAIN,
): void => {
  const oscillator = context.createOscillator()
  const envelope = context.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  oscillator.connect(envelope)
  envelope.connect(context.destination)
  const startTime = context.currentTime + startOffsetSeconds
  envelope.gain.setValueAtTime(MIN_GAIN, startTime)
  envelope.gain.exponentialRampToValueAtTime(gain, startTime + ATTACK_SECONDS)
  envelope.gain.exponentialRampToValueAtTime(
    MIN_GAIN,
    startTime + durationSeconds,
  )
  oscillator.start(startTime)
  oscillator.stop(startTime + durationSeconds + RELEASE_TAIL_SECONDS)
}

/**
 * Web Audio cues for the workout: a rest-over chime, a set tick and a
 * personal-record win. One AudioContext is created lazily and shared;
 * `unlock()` must run inside a user gesture (a tap) so the first sound is
 * allowed by autoplay policy. The legacy webkit-prefixed constructor is
 * intentionally dropped — every 2026 target browser ships `AudioContext`.
 * Callers gate these on the mute setting (unlike haptics).
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

  const restDone = (): void => {
    const context = ensureContext()
    if (context === null) {
      return
    }
    playTone(context, 660, 0, 0.16)
    playTone(context, 880, 0.15, 0.16)
    playTone(context, 1175, 0.3, 0.34, 0.2)
  }

  const tick = (): void => {
    const context = ensureContext()
    if (context === null) {
      return
    }
    playTone(context, 520, 0, 0.07, 0.07)
  }

  const win = (): void => {
    const context = ensureContext()
    if (context === null) {
      return
    }
    playTone(context, 784, 0, 0.12, 0.14)
    playTone(context, 1047, 0.1, 0.18, 0.16)
  }

  return { restDone, tick, unlock: ensureContext, win }
}
