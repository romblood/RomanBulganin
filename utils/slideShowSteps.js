import debounce from "./debounce.js";

function createSlideShow(gridStepsSelector) {
  let currentSlideIndex = 0;
  let gridSteps = document.querySelector(gridStepsSelector);
  const steps = gridSteps.querySelectorAll('.grid-steps__step');
  const prevButton = document.querySelector('.slider-controls__button_type_prev');
  const nextButton = document.querySelector('.slider-controls__button_type_next');
  const indicatorsContainer = document.querySelector('.slider-controls__buttons-container');
  let cachedSlides = calculateSlides(steps);

  // Отображает активный слайд, обновляет состояние кнопок навигации
  function showCurrentSlide() {

    steps.forEach((step) => {
      step.style.visibility = 'hidden';
      step.style.position = 'absolute';
      step.style.opacity = '0';
    });

    cachedSlides[currentSlideIndex].forEach((step) => {
      step.style.opacity = '1';
      step.style.visibility = 'visible';
      step.style.position = 'relative';
    });

    updateActiveIndicators();

    prevButton.disabled = currentSlideIndex === 0;
    nextButton.disabled = currentSlideIndex === cachedSlides.length - 1;
  }

  // Рассчитывает и группирует шаги в слайды, в зависимости от высоты шагов с учетом контента.
  function calculateSlides() {
    const gridStepsStyles = window.getComputedStyle(gridSteps);
    const gridStepsPaddingTop = parseInt(gridStepsStyles.paddingTop, 10);
    const gridStepsPaddingBottom = parseInt(gridStepsStyles.paddingBottom, 10);
    const containerHeight = gridSteps.offsetHeight - gridStepsPaddingBottom - gridStepsPaddingTop;

    const slides = [];
    let currentSlide = [];
    let totalHeight = 0;

    steps.forEach((step) => {
      const stepHeight = step.offsetHeight;
      if (stepHeight > containerHeight / 2) {
        if (totalHeight > 0) {
          slides.push(currentSlide);
          currentSlide = [];
          totalHeight = 0;
        }
        slides.push([step]);
      } else if (totalHeight + stepHeight > containerHeight) {
        slides.push(currentSlide);
        currentSlide = [step];
        totalHeight = stepHeight;
      } else {
        currentSlide.push(step);
        totalHeight += stepHeight;
      }
    });

    if (currentSlide.length > 0) {
      slides.push(currentSlide);
    }

    return slides;
  }

  // Добавляет индикаторы для каждого слайда
  function addIndicators() {
    const indicatorContainer = document.querySelector('.slider-controls__buttons-container');
    indicatorContainer.innerHTML = '';

    for (let i = 0; i < cachedSlides.length; i++) {
      const indicator = document.createElement('button');
      indicator.classList.add('slider-controls__circle-button');
      indicator.addEventListener('click', () => {
        currentSlideIndex = i;
        showCurrentSlide();
      })

      indicatorContainer.appendChild(indicator);
    }

    updateActiveIndicators();
  }

  // Обновляет активный индикатор слайда
  function updateActiveIndicators() {
    indicatorsContainer.querySelectorAll('.slider-controls__circle-button').forEach((indicator, index) => {
      indicator.classList.toggle('slider-controls__circle-button_active', index === currentSlideIndex);
    });
  }

  let isSliderInitialized = false;
  let eventListenersAdded = false;

  // Инициализиует слайдер, добавляет слушатели кнопок навигации
  function initSlider() {
    if (!isSliderInitialized) {
      cachedSlides = calculateSlides();
      currentSlideIndex = Math.min(currentSlideIndex, cachedSlides.length - 1);
      addIndicators();
      showCurrentSlide();

      if (!eventListenersAdded) {
        nextButton.addEventListener('click', nextSlide);
        prevButton.addEventListener('click', prevSlide);
        eventListenersAdded = true;
      }
      isSliderInitialized = true;
    }
  }

  // Удаляет слушатели кнопок и возвращает компонент к исходному виду
  function deinitSlider() {
    if (isSliderInitialized) {
      steps.forEach(step => {
        step.style.visibility = '';
        step.style.position = '';
        step.style.opacity = '';
      });
      if (eventListenersAdded) {
        nextButton.removeEventListener('click', nextSlide);
        prevButton.removeEventListener('click', prevSlide);
        eventListenersAdded = false;
      }
      isSliderInitialized = false;
    }
  }

  // Следующий слайд
  function nextSlide() {
    if (currentSlideIndex < cachedSlides.length - 1) {
      currentSlideIndex++;
      showCurrentSlide();
    }
  }

  // Предыдущий слайд
  function prevSlide() {
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      showCurrentSlide();
    }
  }

  // Проверяет инициализацию слайдера для ширины менее 680px
  function checkSlideShow() {
    if (window.matchMedia('(max-width: 680px)').matches) {
      if (!isSliderInitialized) {
        initSlider();
      } else {
        cachedSlides = calculateSlides(steps);
        addIndicators();
        showCurrentSlide();
      }
    } else {
      deinitSlider();
    }
  }

  checkSlideShow();

  const debouncedCheckSlideShow = debounce(checkSlideShow, 150);
  window.addEventListener('resize', debouncedCheckSlideShow);
}

document.addEventListener('DOMContentLoaded', function () {
  createSlideShow('.grid-steps');
});
