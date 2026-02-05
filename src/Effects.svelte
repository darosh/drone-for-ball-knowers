<script>
import { onMount } from 'svelte'
import { useThrelte, useTask } from '@threlte/core'
import * as THREE from 'three/webgpu'
import * as TSL from 'three/tsl'
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js'
import { ssr } from 'three/examples/jsm/tsl/display/SSRNode.js'
import { traa } from 'three/examples/jsm/tsl/display/TRAANode.js'
import { ssgi } from './SSGINode.js'

const { renderer, scene, camera, autoRender, renderStage } = useThrelte()

let postProcessing
let previousAutoRender = true  // to restore on cleanup

onMount(() => {
  if (!renderer || !scene || !$camera || !renderStage) {
    console.error('Missing Threlte context (renderer/scene/camera/renderStage)')
    return
  }

  previousAutoRender = autoRender.current
  autoRender.set(false)

  postProcessing = new THREE.PostProcessing(renderer)

  const scenePass = TSL.pass(scene, $camera, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter
  })

  scenePass.setMRT(
    TSL.mrt({
      output: TSL.output,
      normal: TSL.directionToColor(TSL.normalView),
      metalrough: TSL.vec2(TSL.metalness, TSL.roughness),
      velocity: TSL.velocity,
    })
  )

  const scenePassColor = scenePass.getTextureNode('output')
  const scenePassNormal = scenePass.getTextureNode('normal')
  const scenePassDepth = scenePass.getTextureNode('depth')
  const scenePassVelocity = scenePass.getTextureNode('velocity')
  const scenePassMetalRough = scenePass.getTextureNode('metalrough')

  const sceneNormal = TSL.sample((uv) =>
    TSL.colorToDirection(scenePassNormal.sample(uv))
  )

  const ssrPass = ssr(
    scenePassColor,
    scenePassDepth,
    sceneNormal,
    scenePassMetalRough.r,
    scenePassMetalRough.g
  )
  ssrPass.maxDistance.value = 5
  ssrPass.blurQuality.value = 1
  ssrPass.thickness.value = 0.15
  ssrPass.resolutionScale = 1

  const bloomPass = bloom(scenePassColor, .5, .3, .01)

  const ssgiPass = ssgi(scenePassColor, scenePassDepth, sceneNormal, $camera)
  ssgiPass.sliceCount.value = 2
  ssgiPass.stepCount.value = 8
  ssgiPass.radius.value = 25
  ssgiPass.giIntensity.value = 100
  ssgiPass.aoIntensity.value = 3
  ssgiPass.thickness.value = 0.5

  const _gi = ssgiPass.rgb
  const _ao = ssgiPass.a

  const finalColor = TSL.vec4(
    TSL.add(scenePassColor.rgb.mul(_ao), scenePassColor.rgb.mul(_gi)),
    scenePassColor.a
  )

  const blendPassA1 = TSL.blendDodge(bloomPass, finalColor)
  const blendPassAO = TSL.add(blendPassA1, finalColor)
  const compositePass = TSL.blendColor(blendPassAO, ssrPass)

  const traaPass = traa(compositePass, scenePassDepth, scenePassVelocity, $camera)

  postProcessing.outputNode = traaPass
  postProcessing.needsUpdate = true

  return () => {
    autoRender.set(previousAutoRender)  // restore original
    postProcessing?.dispose()
  }
})

useTask(() => {
  if (!postProcessing) return

  try {
    postProcessing.render()
  } catch (err) {
    console.error('Post-processing render failed:', err)
  }
}, {
  stage: renderStage,
  autoInvalidate: false
})
</script>
