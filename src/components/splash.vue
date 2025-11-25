<script setup lang="ts">
  const { t } = useI18n()

  const emit = defineEmits<{
    scrollToAbout: []
  }>()

  const messages = computed(() => {
    return {
      welcome: t('splash.welcome'),
      subtitle: t('splash.subtitle'),
      description: t('splash.description'),
      more: t('splash.more'),
    }
  })

  const scrollToAbout = () => {
    emit('scrollToAbout')
  }
</script>

<template>
  <div class="splash">
    <div class="splash__animation">
      <svg
        id="face"
        class="face"
        xmlns="http://www.w3.org/2000/svg"
        width="307"
        height="307"
        x="0px"
        y="0px"
        viewBox="0 0 307.3 307.3"
        xml:space="preserve"
      >
        <polygon
          fill="#ff6600"
          points="153.6,2.8 158.5,0 163.1,3.1 168.1,0.6 172.6,4 177.7,1.8 181.9,5.5 187.2,3.6 191.2,7.5 196.5,6 200.3,10.2 205.7,9 209.2,13.4 214.7,12.6 217.9,17.2 223.4,16.7 226.3,21.5 231.9,21.3 234.5,26.3 240.1,26.5 242.3,31.6 247.9,32.2 249.8,37.4 255.3,38.3 256.9,43.7 262.3,44.9 263.6,50.4 269,52 269.9,57.5 275.1,59.4 275.7,65 280.8,67.2 281,72.8 286,75.4 285.8,81 290.6,83.9 290.1,89.4 294.7,92.6 293.9,98.1 298.3,101.6 297.1,107 301.3,110.8 299.8,116.1 303.7,120.1 301.8,125.4 305.5,129.6 303.3,134.7 306.7,139.2 304.2,144.2 307.3,148.8 304.5,153.6 307.3,158.5 304.2,163.1 306.7,168.1 303.3,172.6 305.5,177.7 301.8,181.9 303.7,187.2 299.8,191.2 301.3,196.5 297.1,200.3 298.3,205.7 293.9,209.2 294.7,214.7 290.1,217.9 290.6,223.4 285.8,226.3 286,231.9 281,234.5 280.8,240.1 275.7,242.3 275.1,247.9 269.9,249.8 269,255.3 263.6,256.9 262.3,262.3 256.9,263.6 255.3,269 249.8,269.9 247.9,275.1 242.3,275.7 240.1,280.8 234.5,281 231.9,286 226.3,285.8 223.4,290.6 217.9,290.1 214.7,294.7 209.2,293.9 205.7,298.3 200.3,297.1 196.5,301.3 191.2,299.8 187.2,303.7 181.9,301.8 177.7,305.5 172.6,303.3 168.1,306.7 163.1,304.2 158.5,307.3 153.6,304.5 148.8,307.3 144.2,304.2 139.2,306.7 134.7,303.3 129.6,305.5 125.4,301.8 120.1,303.7 116.1,299.8 110.8,301.3 107,297.1 101.6,298.3 98.1,293.9 92.6,294.7 89.4,290.1 83.9,290.6 81,285.8 75.4,286 72.8,281 67.2,280.8 65,275.7 59.4,275.1 57.5,269.9 52,269 50.4,263.6 44.9,262.3 43.7,256.9 38.3,255.3 37.4,249.8 32.2,247.9 31.6,242.3 26.5,240.1 26.3,234.5 21.3,231.9 21.5,226.3 16.7,223.4 17.2,217.9 12.6,214.7 13.4,209.2 9,205.7 10.2,200.3 6,196.5 7.5,191.2 3.6,187.2 5.5,181.9 1.8,177.7 4,172.6 0.6,168.1 3.1,163.1 0,158.5 2.8,153.6 0,148.8 3.1,144.2 0.6,139.2 4,134.7 1.8,129.6 5.5,125.4 3.6,120.1 7.5,116.1 6,110.8 10.2,107 9,101.6 13.4,98.1 12.6,92.6 17.2,89.4 16.7,83.9 21.5,81 21.3,75.4 26.3,72.8 26.5,67.2 31.6,65 32.2,59.4 37.4,57.5 38.3,52 43.7,50.4 44.9,44.9 50.4,43.7 52,38.3 57.5,37.4 59.4,32.2 65,31.6 67.2,26.5 72.8,26.3 75.4,21.3 81,21.5 83.9,16.7 89.4,17.2 92.6,12.6 98.1,13.4 101.6,9 107,10.2 110.8,6 116.1,7.5 120.1,3.6 125.4,5.5 129.6,1.8 134.7,4 139.2,0.6 144.2,3.1 148.8,0 "
        />
        <g>
          <circle fill="#962058" cx="153.2" cy="153.6" r="142.7" />
          <path
            fill="#832058"
            d="M153.2,296.4c-78.8,0-142.7-63.9-142.7-142.7S74.3,10.9,153.2,10.9"
          />
        </g>
        <g>
          <path
            fill="#f1c40f"
            d="M154,93.6h14.1c0.9-7,17.5-15.8,19-35.8c1.4-18.8-14.4-34.2-33.3-34.2S119.1,39,120.5,57.8 c1.5,20,18.1,28.8,19,35.8h14.1H154z"
          />
          <path
            fill="#f39c12"
            d="M153.6,23.6c-18.8,0.1-34.6,15.4-33.1,34.2c1.5,20,18.1,28.8,19,35.8h14.1V23.6z"
          />
          <rect x="139.5" y="98.7" fill="#95a5a6" width="28.6" height="5.1" />
          <rect x="139.5" y="103.7" fill="#bdc3c7" width="28.6" height="5.1" />
          <rect x="139.5" y="108.8" fill="#95a5a6" width="28.6" height="5.1" />
          <polygon
            fill="#303030"
            points="153.6,113.9 139.5,113.9 146.6,119.9 153.6,119.9 160.7,119.9 167.8,113.9 	"
          />
          <path fill="#bdc3c7" d="M153.6,119.9h-7.1c0,0,1.1,3,7.1,3s7.1-3,7.1-3H153.6z" />
          <polygon points="153.6,113.9 139.5,113.9 146.6,119.9 153.6,119.9 	" />
          <path fill="#95a5a6" d="M153.6,119.9h-7.1c0,0,1.1,3,7.1,3V119.9z" />
          <path
            fill="#e67e22"
            d="M172.2,54c-0.5-0.2-1,0.1-1.2,0.6l-0.2,0.5l-2.9-3.6l-4.8,4.8l-4.7-4.5l-4.8,3.9l-4.8-3.9l-4.7,4.5l-4.8-4.8 l-2.9,3.6l-0.2-0.5c-0.2-0.5-0.7-0.7-1.2-0.6c-0.5,0.2-0.7,0.7-0.6,1.2l13.5,38.7c0.1,0.4,0.5,0.6,0.9,0.6c0.1,0,0.2,0,0.3-0.1 c0.5-0.2,0.7-0.7,0.6-1.2l-12.3-35.1l2.1-2.5l4.5,4.5l4.9-4.7l4.6,3.7l4.6-3.7l4.9,4.7l4.5-4.5l2.1,2.5l-12.3,35.1 c-0.2,0.5,0.1,1,0.6,1.2c0.1,0,0.2,0.1,0.3,0.1c0.4,0,0.7-0.2,0.9-0.6l13.5-38.7C172.9,54.7,172.7,54.2,172.2,54z"
          />
          <path
            fill="#e67e22"
            d="M137.5,58.1l2.1-2.5l4.5,4.5l4.9-4.7l4.6,3.7v-3.6l-4.8-3.9l-4.7,4.5l-4.8-4.8l-2.9,3.6l-0.2-0.5 c-0.2-0.5-0.7-0.7-1.2-0.6c-0.5,0.2-0.7,0.7-0.6,1.2l13.5,38.7c0.1,0.4,0.5,0.6,0.9,0.6c0.1,0,0.2,0,0.3-0.1 c0.5-0.2,0.7-0.7,0.6-1.2L137.5,58.1z"
          />
          <rect x="139.5" y="98.7" fill="#7f8c8d" width="14.1" height="5.1" />
          <rect x="139.5" y="93.6" fill="#bdc3c7" width="28.6" height="5.1" />
          <rect x="139.5" y="103.7" fill="#95a5a6" width="14.1" height="5.1" />
          <rect x="139.5" y="108.8" fill="#7f8c8d" width="14.1" height="5.1" />
          <rect x="139.5" y="93.6" fill="#95a5a6" width="14.1" height="5.1" />
        </g>
        <g>
          <path
            fill="#d98e45"
            d="M98.6,200.5l-14.5,1.4c-4.7,0.4-8.9-3-9.4-7.8L73,175.3c-0.4-4.7,3-8.9,7.8-9.4l14.5-1.4 c4.7-0.4,8.9,3,9.4,7.8l1.7,18.7C106.8,195.8,103.4,200,98.6,200.5z"
          />
          <path
            fill="#ffc389"
            d="M208.7,200.5l14.5,1.4c4.7,0.4,8.9-3,9.4-7.8l1.7-18.7c0.4-4.7-3-8.9-7.8-9.4l-14.5-1.4 c-4.7-0.4-8.9,3-9.4,7.8l-1.7,18.7C200.4,195.8,203.9,200,208.7,200.5z"
          />
          <g>
            <polygon
              fill="#ffc389"
              points="153.6,264.1 192.5,264.1 210.6,225.9 216.8,136.2 201,118.6 153.6,113.9 106.3,118.6 90.5,136.2 96.7,225.9 114.8,264.1 		"
            />
            <polygon
              fill="#ffb064"
              points="153.6,264.1 114.8,264.1 96.7,225.9 90.5,136.2 106.3,118.6 153.6,113.9 		"
            />
          </g>
          <path
            fill="#df712e"
            d="M165.6,235.1h-23.9c-1.5,0-2.8-1.2-2.8-2.8s1.2-2.8,2.8-2.8h23.9c1.5,0,2.8,1.2,2.8,2.8 S167.1,235.1,165.6,235.1z"
          />
          <path
            fill="#303030"
            d="M153.6,106.5c-53.8,0-70.2,15.1-67.9,48.9c2.3,33.8,1.6,120.7,42.6,120.7c14.6,0,25.3,0,25.3,0s10.7,0,25.3,0 c41,0,40.3-86.9,42.6-120.7S207.4,106.5,153.6,106.5z M174.2,241.6c0,3.6-2.9,6.6-6.6,6.6h-28c-3.6,0-6.6-2.9-6.6-6.6v-9.1 c0-3.6,2.9-6.6,6.6-6.6h28c3.6,0,6.6,2.9,6.6,6.6V241.6z M212.1,155c-2,45.7-8,94.4-23.8,94.4c-6.5,0-6-4.8-6-9.7 c0-4.9,0-11.9,0-18.2c0-6.3-3.6-8.7-8.3-8.7c-4.8,0-20.3,0-20.3,0s-15.5,0-20.3,0c-4.8,0-8.3,2.3-8.3,8.7c0,6.3,0,13.3,0,18.2 c0,4.9,0.5,9.7-6,9.7c-15.8,0-21.8-48.7-23.8-94.4c-1.3-28.9,14.7-32,14.7-32s17.1,9.3,43.8,9.3s43.8-9.3,43.8-9.3 S213.4,126.1,212.1,155z"
          />
          <path
            fill="#d54e20"
            d="M153.6,229.6h-11.9c-1.5,0-2.8,1.2-2.8,2.8s1.2,2.8,2.8,2.8h11.9V229.6z"
          />
          <path
            d="M153.6,248.2h-14c-3.6,0-6.6-2.9-6.6-6.6v-9.1c0-3.6,2.9-6.6,6.6-6.6h14v-13.1c0,0-15.5,0-20.3,0c-4.8,0-8.3,2.3-8.3,8.7 c0,6.3,0,13.3,0,18.2c0,4.9,0.5,9.7-6,9.7c-15.8,0-21.8-48.7-23.8-94.4c-1.3-28.9,14.7-32,14.7-32s17.1,9.3,43.8,9.3v-25.8 c-53.8,0-70.2,15.1-67.9,48.9c2.3,33.8,1.6,120.7,42.6,120.7c14.6,0,25.3,0,25.3,0V248.2z"
          />
          <path
            d="M141.5,171.6h-23.9c-1.5,0-2.8-1.3-2.8-2.8v0c0-1.5,1.3-2.8,2.8-2.8h23.9c1.5,0,2.8,1.3,2.8,2.8v0 C144.3,170.4,143,171.6,141.5,171.6z"
          />
          <path
            d="M189.7,171.6h-23.9c-1.5,0-2.8-1.3-2.8-2.8v0c0-1.5,1.3-2.8,2.8-2.8h23.9c1.5,0,2.8,1.3,2.8,2.8v0 C192.5,170.4,191.2,171.6,189.7,171.6z"
          />
          <g>
            <path
              d="M131.2,168.2L131.2,168.2c-1.6,0-2.8,1.3-2.8,2.8v4.1c0,1.6,1.3,2.8,2.8,2.8l0,0c1.6,0,2.8-1.3,2.8-2.8v-4.1 C134.1,169.5,132.8,168.2,131.2,168.2z"
            />
            <path
              d="M176.2,168.2L176.2,168.2c-1.6,0-2.8,1.3-2.8,2.8v4.1c0,1.6,1.3,2.8,2.8,2.8l0,0c1.6,0,2.8-1.3,2.8-2.8v-4.1 C179.1,169.5,177.8,168.2,176.2,168.2z"
            />
          </g>
        </g>
      </svg>
    </div>
    <div class="splash__content">
      <h1 class="splash__title">{{ messages.welcome }}</h1>
      <p class="splash__subtitle">{{ messages.subtitle }}</p>
      <p class="splash__description">{{ messages.description }}</p>
    </div>
    <div class="compact-chevron" @click="scrollToAbout">
      <div class="compact-chevron-group">
        <svg
          class="compact-chevron-icon"
          width="20"
          height="8"
          viewBox="0 0 20 8"
          fill="none"
        >
          <path
            d="M2 2L10 6L18 2"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <svg
          class="compact-chevron-icon"
          width="20"
          height="8"
          viewBox="0 0 20 8"
          fill="none"
        >
          <path
            d="M2 2L10 6L18 2"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <svg
          class="compact-chevron-icon"
          width="20"
          height="8"
          viewBox="0 0 20 8"
          fill="none"
        >
          <path
            d="M2 2L10 6L18 2"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </div>
      <span class="compact-label">{{ messages.more }}</span>
    </div>
  </div>
</template>

<style scoped>
  .splash {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-width: 100%;
    min-height: 100vh;
    gap: 3rem;
    padding: 2rem;
    text-align: center;
    background-image: url('@/assets/images/splash-background.jpg');
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
  }

  .splash__animation {
    max-width: 500px;
    max-height: 500px;
  }

  .face {
    width: 100%;
    height: 100%;
    animation: float 6s ease-in-out infinite;
  }

  .splash__content {
    max-width: 600px;
    color: #ffffff;
  }

  .splash__title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  .splash__subtitle {
    font-size: 1.5rem;
    font-weight: 500;
    margin-bottom: 1.5rem;
  }

  .splash__description {
    font-size: 1.1rem;
    line-height: 1.6;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .compact-chevron {
    position: absolute;
    bottom: 25px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #506e8a;
    opacity: 0.8;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 10;
  }

  .compact-chevron:hover {
    opacity: 1;
    transform: translateX(-50%) scale(1.05);
  }

  .compact-chevron-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
    animation: compact-bounce 2s infinite;
  }

  .compact-chevron-icon:nth-child(1) {
    opacity: 1;
  }

  .compact-chevron-icon:nth-child(2) {
    opacity: 0.6;
  }

  .compact-chevron-icon:nth-child(3) {
    opacity: 0.3;
  }

  .compact-label {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 1px;
  }

  @keyframes compact-bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-3px);
    }
  }

  /* Адаптивность */
  @media (max-width: 768px) {
    .splash__title {
      font-size: 2rem;
    }

    .splash__subtitle {
      font-size: 1.25rem;
    }

    .splash__description {
      font-size: 1rem;
    }

    .splash__animation {
      max-width: 150px;
      max-height: 150px;
    }
  }
</style>
