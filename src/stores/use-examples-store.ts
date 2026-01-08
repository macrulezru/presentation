import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useExamplesStore = defineStore('examples', () => {
  const videoStatus = ref<boolean>(false);
  const isShowVideoButton = ref<boolean>(false);

  const setVideoStatus = (status: boolean) => {
    videoStatus.value = status;
  };

  const setIsShowVideoButton = (status: boolean) => {
    isShowVideoButton.value = status;
  };

  return {
    videoStatus,
    isShowVideoButton,
    setVideoStatus,
    setIsShowVideoButton,
  };
});
