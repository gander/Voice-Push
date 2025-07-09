<template>
  <div class="push-to-talk-container">
    <button
      ref="buttonRef"
      class="btn btn-push-to-talk"
      :class="{
        'btn-recording': isRecording,
        'btn-transmitting': isTransmitting,
        'btn-disabled': disabled
      }"
      :disabled="disabled"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
      @touchcancel="handleTouchCancel"
    >
      <div class="button-content">
        <i 
          :data-feather="getIconName()" 
          class="button-icon"
        ></i>
        <div class="button-text">
          {{ getButtonText() }}
        </div>
        <div class="recording-indicator" v-if="isRecording">
          <div class="pulse"></div>
        </div>
      </div>
    </button>
    
    <div class="instructions mt-3">
      <small class="text-muted">
        {{ getInstructionText() }}
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'

interface Props {
  isRecording: boolean
  isTransmitting: boolean
  disabled: boolean
  needsPermission?: boolean
}

interface Emits {
  (e: 'start-recording'): void
  (e: 'stop-recording'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const buttonRef = ref<HTMLButtonElement>()
const isPressed = ref(false)

const handleMouseDown = (event: MouseEvent) => {
  if (props.disabled) return
  event.preventDefault()
  startRecording()
}

const handleMouseUp = (event: MouseEvent) => {
  if (props.disabled) return
  event.preventDefault()
  stopRecording()
}

const handleMouseLeave = () => {
  if (isPressed.value) {
    stopRecording()
  }
}

const handleTouchStart = (event: TouchEvent) => {
  if (props.disabled) return
  event.preventDefault()
  startRecording()
}

const handleTouchEnd = (event: TouchEvent) => {
  if (props.disabled) return
  event.preventDefault()
  stopRecording()
}

const handleTouchCancel = () => {
  if (isPressed.value) {
    stopRecording()
  }
}

const startRecording = () => {
  if (!isPressed.value && !props.disabled) {
    isPressed.value = true
    emit('start-recording')
  }
}

const stopRecording = () => {
  if (isPressed.value) {
    isPressed.value = false
    emit('stop-recording')
  }
}

const getIconName = () => {
  if (props.isTransmitting) return 'upload'
  if (props.isRecording) return 'mic'
  if (props.disabled) return 'mic-off'
  return 'mic'
}

const getButtonText = () => {
  if (props.isTransmitting) return 'Transmitting...'
  if (props.isRecording) return 'Recording...'
  if (props.needsPermission) return 'Allow Microphone'
  if (props.disabled) return 'Not Available'
  return 'Hold to Record'
}

const getInstructionText = () => {
  if (props.needsPermission) return 'Click to allow microphone access'
  if (props.disabled) return 'Microphone access required'
  if (props.isTransmitting) return 'Sending audio to endpoint...'
  if (props.isRecording) return 'Release to send audio'
  return 'Press and hold to start recording'
}

// Update Feather icons when state changes
watch([() => props.isRecording, () => props.isTransmitting, () => props.disabled], async () => {
  await nextTick()
  if (window.feather) {
    window.feather.replace()
  }
})

onMounted(async () => {
  await nextTick()
  if (window.feather) {
    window.feather.replace()
  }
})
</script>

<style scoped>
.push-to-talk-container {
  position: relative;
}

.btn-push-to-talk {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 4px solid #007bff;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.btn-push-to-talk:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 10px 25px rgba(0, 123, 255, 0.3);
}

.btn-push-to-talk:active:not(:disabled) {
  transform: scale(0.95);
}

.btn-push-to-talk.btn-recording {
  background: linear-gradient(135deg, #dc3545 0%, #a71e2a 100%);
  border-color: #dc3545;
  animation: pulse-ring 1.5s infinite;
}

.btn-push-to-talk.btn-transmitting {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
  border-color: #ffc107;
  color: #000;
}

.btn-push-to-talk.btn-disabled {
  background: linear-gradient(135deg, #6c757d 0%, #545862 100%);
  border-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
}

.button-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
}

.button-text {
  font-size: 0.9rem;
  line-height: 1.2;
  max-width: 120px;
  word-wrap: break-word;
}

.recording-indicator {
  position: absolute;
  top: -10px;
  right: -10px;
}

.pulse {
  width: 20px;
  height: 20px;
  background: #ff4444;
  border-radius: 50%;
  animation: pulse-dot 1s infinite;
}

@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(220, 53, 69, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
  }
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.instructions {
  min-height: 20px;
}

/* Disable text selection and touch callouts */
.btn-push-to-talk {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
