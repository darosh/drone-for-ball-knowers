<script>
import { T, useTask } from '@threlte/core'
import { RigidBody, Collider } from '@threlte/rapier'

let {
  color,
  position,
  note,
  play,
  onCollision,
  id
} = $props()

const randFloatSpread = (range) => (Math.random() - 0.5) * range
const pos = $derived(position || [randFloatSpread(10), randFloatSpread(10), randFloatSpread(0)])

let rigidBody = $state(undefined)
let meshRef = $state(undefined)
let playTime

$effect(() => {
  if (play) {
    console.log('play')
    playTime = Date.now()
  }
})

useTask(() => {
  if (rigidBody) {
    rigidBody

    if (!play) {
      rigidBody.setLinearDamping(Infinity)
    } else {
      rigidBody.setLinearDamping(Math.max(.25, 4000 - (Date.now() - playTime)))
    }
  }
})
</script>

<RigidBody
  linearDamping={.25}
  angularDamping={1}
  bind:rigidBody
>

  <T.Mesh position={pos} bind:ref={meshRef} castShadow receiveShadow>
    <Collider oncollisionenter={() => onCollision(note, meshRef.position)} shape="ball" mass={700} args={[1]} />
    <T.SphereGeometry args={[1, 64, 64]} />
    <T.MeshStandardMaterial
      {color}
      metalness={0.9}
      roughness={.3}
    />
  </T.Mesh>
</RigidBody>
