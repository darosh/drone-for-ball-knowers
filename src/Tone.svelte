<script>
import { clamp, lerp } from 'three/src/math/MathUtils.js'

const PLUCKS = 20
const RATE = 200

let plucks
let plucksLast
let reverb1
let reverb2
let started = false
let Tone

export async function startAudio () {
  if (started) {
    started = false
    return
  }

  Tone = await import('tone')

  await Tone.start() // MUST be user-triggered
  console.log('Audio started')

  const compressor = new Tone.Compressor({}).toDestination()

  const hpFilter = new Tone.OnePoleFilter({
    frequency: 1200,
    type: 'lowpass'
  }).connect(compressor)

  const filter = new Tone.OnePoleFilter({
    frequency: 30,
    type: 'highpass'
  }).connect(hpFilter)

  reverb1 = new Tone.Reverb({
    decay: 20,
    wet: 0.4
  }).connect(filter)

  reverb2 = new Tone.Reverb({
    decay: 10,
    wet: 0.6
  }).connect(reverb1)

  plucksLast = Array.from({ length: PLUCKS }).fill(Date.now())

  plucks = Array.from({ length: PLUCKS }).map((_, i) => {
    const pan = new Tone.Panner({
      pan: lerp(-1, 1, i / (PLUCKS - 1))
    }).connect(reverb2)

    return new Tone.PluckSynth({
      attackNoise: 1,
      release: 10,
      dampening: 4000,
      resonance: .99
    }).connect(pan)
  })

  started = true
}

export function play (note = 'C4', position) {
  if (!started) {
    return
  }

  const index = Math.floor(lerp(0, PLUCKS - 1, (clamp(position.x, -1, 1) + 1) / 2))
  const now = Date.now()

  if ((plucksLast[index] + RATE) > now) {
    return
  }

  const damp = lerp(2000, 4000, (clamp(position.y, -2, 2) + 2) / 4)

  plucks[index].dampening = damp
  plucks[index].triggerAttack(note)
  plucksLast[index] = now
}
</script>
