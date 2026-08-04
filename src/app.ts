declare global {
  interface Window {
    XR8?: {
      XrController: {
        configure: (options: {imageTargetData: unknown[]}) => void
      }
    }
  }
}

// The exported project contains the tracking data, but Expanse does not load
// it until XrController is configured. app.ts is imported before the scene is
// initialized by config/entry-plugin.js.
const configureImageTargets = () => {
  window.XR8?.XrController.configure({
    imageTargetData: [
      require('../image-targets/beer-label.json'),
    ],
  })
}

if (window.XR8) {
  configureImageTargets()
} else {
  window.addEventListener('xrloaded', configureImageTargets, {once: true})
}

export {}
