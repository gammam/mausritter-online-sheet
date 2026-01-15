import vue from '@vitejs/plugin-vue'
import ReactivityTransform from '@vue-macros/reactivity-transform/vite'

export default {
  base: '/mausritter-online-sheet/',
  plugins: [
    vue(),
    ReactivityTransform()
  ]
}
