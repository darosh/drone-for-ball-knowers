<script>
import { useThrelte } from '@threlte/core'
import { onMount } from 'svelte'
import { Canvas, T, extend } from '@threlte/core'
import { VirtualEnvironment } from '@threlte/extras'
import { World, Attractor } from '@threlte/rapier'
import Sphere from './Sphere.svelte'
import Effects from './Effects.svelte'
import { WebGPURenderer } from 'three/webgpu'
import * as THREE from 'three/webgpu'
import Lightformer from './Lightformer.svelte'
import Tone from './Tone.svelte'

let toneRef = $state(undefined)
let showMenu = $state(true)
let slowMachine = $state(false)
let play = $state(false)

extend(THREE)

const connectors = [
  { note: 'C3', color: '#444' },
  { note: 'C3', color: '#444' },
  { note: 'C2', color: '#444' },
  { note: 'C2', color: '#eee' },
  { note: 'C2', color: '#eee' },
  { note: 'G2', color: '#eee' },
  { note: 'G2', color: '#ff4060' },
  { note: 'G2', color: '#ff4060' },
  { note: 'G2', color: '#ff4060' },
  { note: 'G2', color: '#444' },
  { note: 'G4', color: '#444' },
  { note: 'G4', color: '#444' },
  { note: 'G4', color: '#eee' },
  { note: 'C4', color: '#eee' },
  { note: 'C4', color: '#eee' },
  { note: 'C4', color: '#ff4060' },
  { note: 'C4', color: '#ff4060' },
  { note: 'C4', color: '#ff4060' },
]

function SetToneMapping () {
  const { renderer } = useThrelte()

  onMount(() => {
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.8
  })

  return null
}

onMount(() => {
  addEventListener('mouseover', onMouseOver)
})

let timer

function onMouseOver () {
  showMenu = true
  document.body.style.cursor = 'initial'

  if (timer) {
    clearTimeout(timer)
  }

  timer = setTimeout(() => {
    showMenu = false
    document.body.style.cursor = 'none'
  }, 3300)
}

let canvasElement = document.body

function toggleFullscreen () {
  if (!canvasElement) {
    return
  }

  if (!document.fullscreenElement) {
    canvasElement.requestFullscreen().catch(err => {
      console.error('Fullscreen failed', err)
    })
  } else {
    document.exitFullscreen()
  }
}
</script>

<Tone bind:this={toneRef} />

<Canvas
  createRenderer={(canvas) => {
    return new WebGPURenderer({
      canvas,
      antialias: false,
      forceWebGL: false,
    })
  }}
>
  <SetToneMapping />
  <T.PerspectiveCamera
    makeDefault
    position={[0, 0, 30]}
    fov={17.5}
  />

  <T.Color attach="background" args={['#000']} />

  <T.AmbientLight intensity={3} color={0xff9999} />

  <VirtualEnvironment isBackground={false} far={1000} near={.1} frames={1}>
    <T.Group rotation={[-Math.PI / 3, 0, 1]}>
      <Lightformer
        form="circle"
        intensity={100}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 5, -9]}
        scale={2}
      />
      <Lightformer
        form="circle"
        intensity={0}
        rotation={[0, Math.PI / 2, 0]}
        position={[-5, 1, -1]}
        scale={2}
      />
      <Lightformer
        form="circle"
        intensity={0}
        rotation={[0, Math.PI / 2, 0]}
        position={[-5, -1, -1]}
        scale={2}
      />
      <Lightformer
        form="circle"
        intensity={2}
        rotation={[0, -Math.PI / 2, 0]}
        position={[10, 1, 0]}
        scale={8}
      />
      <Lightformer
        form="ring"
        color="red"
        intensity={80}
        position={[10, 10, 0]}
        scale={10}
        lookAt={[0, 0, 0]}
      />
    </T.Group>
  </VirtualEnvironment>

  <World gravity={[0, 0, 0]}>
    <Attractor position={[0,.333,-6]} gravityType="static" range={900} strength={100} />
    {#each connectors as props, i (i)}
      <Sphere {...props} play={play} onCollision={toneRef?.play} id={i} />
    {/each}
  </World>

  {#if !slowMachine}
    <Effects />
  {/if}
</Canvas>

<div style="visibility: { showMenu ? null : 'hidden' }; color: white; flex-direction: column; display: flex;"
     class="fill">
  <div
    style="font-weight: lighter; text-align: center; line-height: 1.2; padding: 1em .5em .5em; font-size: 12vh; color: rgba(255,255,255, .87); word-spacing: .2em;">
    Drone for Ball Knowers
  </div>
  <div style="flex: 1 0; display: flex; align-items: center; justify-content: center;">
    <button onclick={() => {toneRef.startAudio(); play = !play;}}
            style="text-transform: uppercase; font-size: 4vh; letter-spacing: .3em;"><span style="padding-left: .4em;">{play ? 'Stop' : 'Play'}</span></button>
  </div>
  <div style="margin-bottom: 3em; font-size: 2vh; text-align: center;">
    <button onclick={toggleFullscreen}>Fullscreen</button>
    <button onclick={slowMachine = !slowMachine}>FX: {slowMachine ? 'Off' : 'On' }</button>
    <a target="_blank" href="https://www.reddit.com/r/geometricnightmares/">r/geometricnightmares</a>
    <a target="_blank" href="https://github.com/darosh/drone-for-ball-knowers">Github</a>
  </div>
</div>

<style>
button {
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}

button, a {
    background: rgb(0, 0, 0, .5);
    border: 1px solid rgb(255, 255, 255, .87);
    color: white;
    padding: 1em;
    margin: 1em;
    font-size: 2vh;
    text-decoration: none;
    font-weight: lighter;
    display: inline-block;
    min-width: 16vw;
    word-spacing: .2em;
    letter-spacing: 0.1em;
    text-align: center;
}

a:hover {
    text-decoration: underline;
}

.fill {
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
}
</style>
