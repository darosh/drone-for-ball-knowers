<script>
import { T } from '@threlte/core'
import * as THREE from 'three'
import { onMount } from 'svelte'

let {
  form,
  intensity,
  color,
  position,
  rotation,
  scale,
  lookAt
} = $props()

let meshRef = $state(undefined)

let emissiveColor = $derived(new THREE.Color(color).multiplyScalar(intensity))

onMount(() => {
  if (lookAt && meshRef) {
    meshRef.lookAt(...(Array.isArray(lookAt) ? lookAt : [0, 0, 0]))
  }
})
</script>

<T.Mesh
  bind:ref={meshRef}
  {position}
  {rotation}
  scale={Array.isArray(scale) ? scale : [scale, scale, scale]}
>
  {#if form === 'circle'}
    <T.CircleGeometry args={[1, 64]} />
  {:else if form === 'ring'}
    <T.RingGeometry args={[0.5, 1, 64]} />
  {:else}
    <T.PlaneGeometry args={[1, 1]} />
  {/if}

  <T.MeshBasicMaterial
    color={emissiveColor}
    toneMapped={false}
    side={2}
  />
</T.Mesh>
