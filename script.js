import { playSVG, pauseSVG, volumeSVG, volumeMutedSVG, fullscreenSVG, fullscreenExitSVG } from './assets/icons/icons.js';

const player = document.querySelector('.video-player');
const fullscreenContainer = player.querySelector('.fullscreen-container');
const videoContainer = player.querySelector('.video-player-screen-container');
let video = player.querySelector('.video-player-screen__video');
const speedContainer = player.querySelector('.speed-container');
const screenPlay = player.querySelector('.video-player-screen__play');
const play = player.querySelector('.video-player-control__play');
const progress = player.querySelector('.video-player-control__progress-bar');
const volume = player.querySelector('.video-player-control__volume');
const volumeRange = player.querySelector('.video-player-control__volume-range');
const fullscreen = player.querySelector('.video-player-control__fullscreen');

let currentVideo = 0;
let currentState;
let currentVolumeState;
let currentFullscreenState = 0;
let needToggleVolume = false;
let mousedownProgress = false;

function checkIndex(n) {
  return (n + slides.length) % slides.length;
};

const state = {
  mode: {
    1: 'play',
    0: 'pause',
  },
  screenPlay: {
    1: '0',
    0: '1',
  },
  play: {
    1: pauseSVG,
    0: playSVG,
  },
};

const volumeState = {
  muted: {
    0: true,
    1: false,
  },
  icon: {
    1: volumeSVG,
    0: volumeMutedSVG,
  },
  currentVolume: 0.4,
};
video.volume = volumeState.currentVolume;

const fullscreenState = {
  mode: {
    0: () => document.exitFullscreen(),
    1: () => fullscreenContainer.requestFullscreen(),
  },
  icon: {
    0: fullscreenSVG,
    1: fullscreenExitSVG,
  },
}

function toggleCurrentState() {
  currentState = video.paused ? 1 : 0;

  video[state.mode[currentState]]();
  screenPlay.style.opacity = state.screenPlay[currentState];
  play.innerHTML = state.play[currentState];
  if(progress.getAttribute('max') == 0) progress.setAttribute('max', '100');
}

function toggleVolume() {
  currentVolumeState = video.muted ? 1 : 0;
  video.muted = volumeState.muted[currentVolumeState];
  volume.innerHTML = volumeState.icon[currentVolumeState];
}

function toggleFullscreen() {
  currentFullscreenState = currentFullscreenState ? 0 : 1;
  fullscreen.innerHTML = fullscreenState.icon[currentFullscreenState];
  fullscreenState.mode[currentFullscreenState]();
}

function changeVideo() {
  const elem = document.createElement('div');
  elem.innerHTML = `
    <video preload="auto" class="video-player-screen__video" poster="assets/video/poster${currentVideo}.jpg" >
      <source src="assets/video/video${currentVideo}.mp4" type="video/mp4">
    </video>
  `;
  const nextVideo = elem.firstElementChild;
  videoContainer.firstElementChild.replaceWith(nextVideo);
  video = player.querySelector('.video-player-screen__video');
  video.load();
  video.addEventListener('pointerdown', toggleCurrentState);
  video.addEventListener('timeupdate', handleProgress);  
}

function handleKeyboard(event) {
  if(event.code === 'Space') {
    toggleCurrentState();
    if(progress.getAttribute('max') == 0) progress.setAttribute('max', '100');
    return;
  };
  if(event.code === 'KeyM') {
    if(video.volume > 0) toggleVolume();
    return;
  };
  if(event.code === 'Period') {
    video.playbackRate = Math.ceil((video.playbackRate + 0.1) * 10) / 10;  ;
    speedContainer.textContent = video.playbackRate;
    speedContainer.style.display = 'block';
    setTimeout(()=> {
      speedContainer.style.display = 'none';
    }, 1000);
    return;
  }
  if(event.code === 'Comma') {
    if(video.playbackRate == 0) return;  
    video.playbackRate = Math.floor((video.playbackRate - 0.1) * 10) / 10;
    speedContainer.textContent = video.playbackRate;
    speedContainer.style.display = 'block';
    setTimeout(()=> {
      speedContainer.style.display = 'none';
    }, 1000);
    return;
  }
  if(event.code === 'KeyF') {
    toggleFullscreen();
    return;
  }
  if(event.code === 'KeyN') {
    if(!video.paused) toggleCurrentState();
    currentVideo++;
    currentVideo = checkIndex(currentVideo);
    changeVideo();
    video.currentTime = 0;
    progress.setAttribute('max', '0');
    progress.style.background = `linear-gradient(to right, #710707 0%, #710707 0%, #C4C4C4 0%, #C4C4C4 100%)`;
    video.volume = volumeState.currentVolume;
    toRight();
    return;
  }
  if(event.code === 'KeyP') {
    if(!video.paused) toggleCurrentState();
    currentVideo--;
    currentVideo = checkIndex(currentVideo);
    changeVideo();
    video.currentTime = 0;
    progress.setAttribute('max', '0');
    progress.style.background = `linear-gradient(to right, #710707 0%, #710707 0%, #C4C4C4 0%, #C4C4C4 100%)`;
    video.volume = volumeState.currentVolume;
    toLeft();
    return;
  }
  if(event.code === 'Home') {
    video.currentTime = 0;
    handleProgress();
    return;
  }
  if(event.code === 'End') {
    video.currentTime = video.duration;
    handleProgress();
    return;
  }
  if(event.code === 'ArrowUp') {
    if(video.volume < 1) {
      if(video.volume == 0) {
        toggleVolume();
        needToggleVolume = false;
      } 
      video.volume = Math.floor((video.volume + 0.1) * 100) / 100;
      volumeRange.value = video.volume;
      volumeRange.style.background = `linear-gradient(to right, #710707 0%, #710707 ${video.volume * 100}%, #C4C4C4 ${video.volume * 100}%, #C4C4C4 100%)`;
      volumeState.currentVolume = video.volume;
    }
    return;
  }
  if(event.code === 'ArrowDown') {
    if(video.volume > 0) {
      video.volume = Math.floor((video.volume - 0.1) * 100) / 100;
      volumeRange.value = video.volume;
      volumeRange.style.background = `linear-gradient(to right, #710707 0%, #710707 ${video.volume * 100}%, #C4C4C4 ${video.volume * 100}%, #C4C4C4 100%)`;
      if(video.volume == 0 && !video.muted) {
        toggleVolume();
        needToggleVolume = true;
      } 
      volumeState.currentVolume = video.volume;
    }
    return;
  }
  if(event.code === 'Numpad1') {
    video.currentTime = (1 / 10) * video.duration;
    handleProgress();
    return;
  }
  if(event.code === 'Numpad2') {
    video.currentTime = (2 / 10) * video.duration;
    handleProgress();
    return;
  }
  if(event.code === 'Numpad3') {
    video.currentTime = (3 / 10) * video.duration;
    handleProgress();
    return;
  }
  if(event.code === 'Numpad4') {
    video.currentTime = (4 / 10) * video.duration;
    handleProgress();
    return;
  }
  if(event.code === 'Numpad5') {
    video.currentTime = (5 / 10) * video.duration;
    handleProgress();
    return;
  }
  if(event.code === 'Numpad6') {
    video.currentTime = (6 / 10) * video.duration;
    handleProgress();
    return;
  }
  if(event.code === 'Numpad7') {
    video.currentTime = (7 / 10) * video.duration;
    handleProgress();
    return;
  }
  if(event.code === 'Numpad8') {
    video.currentTime = (8 / 10) * video.duration;
    handleProgress();
    return;
  }
  if(event.code === 'Numpad9') {
    video.currentTime = (9 / 10) * video.duration;
    handleProgress();
    return;
  }
}

function handleVolumeRange() {
  const value = this.value;
  if(value == 0 && !video.muted) {
    toggleVolume();
    needToggleVolume = true;
  } 
  if(value > 0 && needToggleVolume) {
    toggleVolume();
    needToggleVolume = false;
  }  
  video.volume = value;
  volumeState.currentVolume = value;
  this.style.background = `linear-gradient(to right, #710707 0%, #710707 ${value * 100}%, #C4C4C4 ${value * 100}%, #C4C4C4 100%)`
}

function handleProgress() {
  const percent = (video.currentTime / video.duration) * 100;
  progress.value = percent;
  progress.style.background = `linear-gradient(to right, #710707 0%, #710707 ${percent}%, #C4C4C4 ${percent}%, #C4C4C4 100%)`;
  if(percent === 100) {
    screenPlay.style.opacity = 1;
    play.innerHTML = playSVG;
  };
}

function changeProgress(e) {
  const newCurrentTime = (e.offsetX / progress.offsetWidth) * video.duration;
  video.currentTime = newCurrentTime;
  handleProgress();
}

video.addEventListener('pointerdown', toggleCurrentState);
screenPlay.addEventListener('pointerdown', toggleCurrentState);
play.addEventListener('pointerdown', toggleCurrentState);
video.addEventListener('timeupdate', handleProgress);
progress.addEventListener('mousemove', (e) => mousedownProgress && changeProgress(e));
progress.addEventListener('mousedown', () => mousedownProgress = true);
progress.addEventListener('mouseup', () => mousedownProgress = false);
progress.addEventListener('pointerdown', changeProgress);

volume.addEventListener('pointerdown', () => {
  if(video.volume > 0) toggleVolume();
});
volumeRange.addEventListener('input', handleVolumeRange);

fullscreen.addEventListener('pointerdown', toggleFullscreen)

document.addEventListener('keyup', handleKeyboard);
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    currentFullscreenState = 0;
    fullscreen.innerHTML = fullscreenSVG;
  }
})


// slider //
  const slides = document.querySelectorAll('.carousel__slide');
  const container = document.querySelector('.carousel-slides-container');
  const leftArrow = document.querySelector('.carousel-control__left');
  const rightArrow = document.querySelector('.carousel-control__right');  

  let startSlide = 0;
  let endSlide = slides.length-1;
  let isEnabled = true;

  function toLeft() {
    isEnabled = false; 
    container.classList.add('to-left');
    const hanler = function() {
      container.classList.remove('to-left');
      container.removeEventListener('animationend', hanler);

      startSlide = endSlide;
      endSlide--;
      endSlide = checkIndex(endSlide);
      
      isEnabled = true;
    }

    container.addEventListener('animationend', hanler);
    container.prepend(slides[endSlide]);
  };

  function toRight() {
    isEnabled = false; 
    container.classList.add('to-right');
    const handler = function() {
      container.append(slides[startSlide]);
      container.classList.remove('to-right');

      endSlide = startSlide;
      startSlide++;
      startSlide = checkIndex(startSlide);
      
      container.removeEventListener('animationend', handler);
      isEnabled = true;
    }

    container.addEventListener('animationend', handler);
  };

  leftArrow.addEventListener('pointerdown', function() {
    if(isEnabled) {
      toLeft();
    } 
  });

  rightArrow.addEventListener('pointerdown', function() {
    if(isEnabled) {
      toRight();
    } 
  });

  slides.forEach(elem => {
    elem.addEventListener('pointerdown', () => {
    currentVideo = elem.getAttribute('value');
    if(!video.paused) toggleCurrentState();
    changeVideo();
    video.volume = volumeState.currentVolume;
    video.currentTime = 0;
    progress.setAttribute('max', '0');
    progress.style.background = `linear-gradient(to right, #710707 0%, #710707 0%, #C4C4C4 0%, #C4C4C4 100%)`;
    })
  })

// --- клавиша Пробел — пауза,
// --- клавиша M — отключение/включение звука, 
// --- клавиша > — ускорение воспроизведения ролика, 
// --- клавиша < — замедление воспроизведения ролика, 
// --- клавиша F — включение/выключение полноэкранного режим
// --- клавиша P - перейти к предыдущему видео
// --- клавиша N - перейти к следующему видео
// --- клавиша Home — переход в начало видео
// --- клавиша End — переход в конец видео
// --- клавиши 1-9 — переход к фрагментам видео в процентах 10-90%
// --- клавиша Стрелка вверх — увеличение громкости
// --- клавиша Стрелка вниз — уменьшение громкости
// --- слайдер
// ---- по клику на слайд меняется основное видео
// ---- клавиша P - плюс смещение слайдера на одну позицию влево
// ---- клавиша N - плюс смещение слайдера на одну позицию вправо