import * as ecs from '@8thwall/ecs'

declare global {
  interface Window {
    XR8?: {
      XrController: {
        configure: (options: {imageTargetData: unknown[]}) => void
      }
    }
  }
}

const TARGET_NAME = 'rubia-label'
const ANIMATION_DURATION = 59.083
const LOST_TARGET_GRACE_MS = 650

const narration = new Audio('./assets/LaCibeles_narracion.m4a')
narration.preload = 'auto'
narration.loop = false
narration.setAttribute('playsinline', '')

const intro = document.querySelector<HTMLElement>('#intro')
const startButton = document.querySelector<HTMLButtonElement>('#start-experience')
const status = document.querySelector<HTMLElement>('#ar-status')
const statusText = document.querySelector<HTMLElement>('#ar-status-text')
const soundButton = document.querySelector<HTMLButtonElement>('#sound-toggle')
const replayButton = document.querySelector<HTMLButtonElement>('#replay')

let experienceStarted = false
let targetVisible = false
let modelReady = false
let narrationStarted = false
let experienceComplete = false
let lostTargetTimer = 0
let tailTimer = 0
let modelContext: {world: any; eid: any} | null = null

const setStatus = (message: string, state: 'scanning' | 'found' | 'paused' | 'complete' = 'scanning') => {
  if (!status || !statusText) return
  statusText.textContent = message
  status.dataset.state = state
}

const setModelPlayback = (paused: boolean, time?: number) => {
  if (!modelContext) return
  const data: {paused: boolean; time?: number} = {paused}
  if (typeof time === 'number') data.time = Math.max(0, Math.min(time, ANIMATION_DURATION))
  ecs.GltfModel.set(modelContext.world, modelContext.eid, data)
}

const showReplay = (show: boolean) => {
  replayButton?.classList.toggle('is-visible', show)
}

const stopTailTimer = () => {
  window.clearTimeout(tailTimer)
  tailTimer = 0
}

const pauseExperience = () => {
  stopTailTimer()
  narration.pause()
  setModelPlayback(true, experienceComplete ? ANIMATION_DURATION : narration.currentTime)
  if (experienceComplete) {
    showReplay(true)
    setStatus('Historia completa', 'complete')
  } else {
    setStatus('Vuelve a enfocar el rombo de la etiqueta', 'paused')
  }
}

const playExperience = async (restart = false) => {
  if (!experienceStarted || !targetVisible || !modelReady) return

  if (experienceComplete && !restart) {
    setModelPlayback(true, ANIMATION_DURATION)
    showReplay(true)
    setStatus('Historia completa', 'complete')
    return
  }

  window.clearTimeout(lostTargetTimer)
  stopTailTimer()

  if (restart || narration.ended || narration.currentTime >= narration.duration - 0.25) {
    narration.currentTime = 0
    narrationStarted = false
    experienceComplete = false
  }

  const time = narration.currentTime
  setModelPlayback(false, time)
  setStatus('La Cibeles está contando su historia', 'found')
  showReplay(false)

  try {
    await narration.play()
    narrationStarted = true
  } catch {
    setModelPlayback(true, time)
    setStatus('Toca el botón de sonido para continuar', 'paused')
  }
}

const configureImageTargets = () => {
  window.XR8?.XrController.configure({
    imageTargetData: [require('../image-targets/rubia-label.json')],
  })
}

if (window.XR8) {
  configureImageTargets()
} else {
  window.addEventListener('xrloaded', configureImageTargets, {once: true})
}

startButton?.addEventListener('click', async () => {
  experienceStarted = true
  intro?.classList.add('is-hidden')
  status?.classList.add('is-visible')
  document.body.classList.add('experience-started')

  if (targetVisible && modelReady) {
    await playExperience(!narrationStarted)
    return
  }

  // Unlock mobile audio during the user's gesture, then wait for the target.
  try {
    await narration.play()
    narration.pause()
    narration.currentTime = 0
  } catch {
    // Some browsers unlock only after camera permission; the sound button is a fallback.
  }
  setStatus(modelReady ? 'Apunta al rombo central de la etiqueta' : 'Preparando a La Cibeles…')
})

soundButton?.addEventListener('click', async () => {
  narration.muted = !narration.muted
  soundButton.classList.toggle('is-muted', narration.muted)
  soundButton.setAttribute('aria-label', narration.muted ? 'Activar sonido' : 'Silenciar narración')
  soundButton.setAttribute('aria-pressed', String(narration.muted))

  if (!narration.muted && targetVisible && narration.paused && !narration.ended) {
    await playExperience(false)
  }
})

replayButton?.addEventListener('click', () => {
  void playExperience(true)
})

narration.addEventListener('ended', () => {
  experienceComplete = true
  setStatus('Historia completa', 'complete')
  tailTimer = window.setTimeout(() => {
    setModelPlayback(true, ANIMATION_DURATION)
    showReplay(true)
  }, Math.max(0, (ANIMATION_DURATION - narration.duration) * 1000))
})

narration.addEventListener('error', () => {
  setStatus('No se pudo cargar la narración. Recarga la página.', 'paused')
})

ecs.registerComponent({
  name: 'lacibeles-experience',
  schema: {},
  stateMachine: ({world, eid}) => {
    ecs.defineState('ready')
      .initial()
      .onEnter(() => {
        modelContext = {world, eid}
        setModelPlayback(true, 0)
      })
      .listen(eid, ecs.events.GLTF_MODEL_LOADED, () => {
        modelReady = true
        setModelPlayback(true, 0)
        if (experienceStarted) {
          if (targetVisible) void playExperience(!narrationStarted)
          else setStatus('Apunta al rombo central de la etiqueta')
        }
      })
      .listen(world.events.globalId, ecs.events.REALITY_IMAGE_FOUND, (event: any) => {
        if (event.data?.name !== TARGET_NAME) return
        targetVisible = true
        window.clearTimeout(lostTargetTimer)

        if (!experienceStarted) return
        if (!modelReady) {
          setStatus('Preparando a La Cibeles…')
          return
        }
        void playExperience(!narrationStarted)
      })
      .listen(world.events.globalId, ecs.events.REALITY_IMAGE_LOST, (event: any) => {
        if (event.data?.name !== TARGET_NAME) return
        targetVisible = false
        window.clearTimeout(lostTargetTimer)
        lostTargetTimer = window.setTimeout(pauseExperience, LOST_TARGET_GRACE_MS)
      })
  },
})

export {}
