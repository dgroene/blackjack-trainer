import { useCallback, useEffect, useRef } from 'react'
import { Howl } from 'howler'

export type SoundKey = 'deal' | 'shuffle' | 'correct' | 'incorrect' | 'chip'

// Sound file paths relative to /public/sounds/ — assets added in Phase 7
const SOUND_SOURCES: Record<SoundKey, string> = {
  deal: '/blackjack-trainer/sounds/card-deal.mp3',
  shuffle: '/blackjack-trainer/sounds/shuffle.mp3',
  correct: '/blackjack-trainer/sounds/correct.mp3',
  incorrect: '/blackjack-trainer/sounds/incorrect.mp3',
  chip: '/blackjack-trainer/sounds/chip.mp3',
}

type HowlMap = Partial<Record<SoundKey, Howl>>

export function useSound(enabled = true) {
  const howls = useRef<HowlMap>({})

  useEffect(() => {
    if (!enabled) return

    const keys = Object.keys(SOUND_SOURCES) as SoundKey[]
    for (const key of keys) {
      howls.current[key] = new Howl({
        src: [SOUND_SOURCES[key]],
        volume: 0.6,
        // Silently ignore missing files during development
        onloaderror: () => {
          howls.current[key] = undefined
        },
      })
    }

    return () => {
      for (const howl of Object.values(howls.current)) {
        howl?.unload()
      }
      howls.current = {}
    }
  }, [enabled])

  const play = useCallback(
    (key: SoundKey) => {
      if (!enabled) return
      howls.current[key]?.play()
    },
    [enabled]
  )

  return { play }
}
