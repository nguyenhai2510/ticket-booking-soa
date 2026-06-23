export interface Slide {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  displayOrder: number;
  isActive: boolean;
}

const STORAGE_KEY = 'eventpass_sliders';

const defaultSlides: Slide[] = [
  {
    id: 'slide-1',
    title: 'Đại nhạc hội EventPass Night: Summer Concert 2026',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMKC62VpHaQv8O32gcLY1EKkW_xq5JLdK7PFkmpJk1RDsHKIwH667carRCXFJ3Ibsh6M3NDbTvbZgaoCym5i51eu447dUn7awJWLlzW0cDsbWS4e0wYNHvPfvrMcWb1z9VtoGwapb1KdPHQ9mgnNEb0upPpwFC-NjZZXpjpyOu6cmv5rZvUBNFR8fVy5eVFvWALPa3WLkyegUpX79DqMqAHWvMEavfWJMQTeprI5tQwEaHtWB4ngplKHzhVxPS-WLhBARSswSIkA',
    linkUrl: '/events/1',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'slide-2',
    title: 'Diễn đàn Công nghệ & Đổi mới Tech Summit 2026',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiIFtXiYn7jX0CyClXXyAORQJoxbYQHs5KVTKeIUKSVV3J7HDVuwWQHzbO25JxqQBbNTgeCq-63PdBBh10nmbFrYD_LX3rOXbU0NkoIX_TbY6HPCb3c3JuJJwZlBRl2SeLPRl3A_r8BovUPzUwtpGmrER6qXcGzjXHf5WLpvRgYa-1_F-gF1LaqTtdBwfWW6WJckmPXrTZjZWng045XTaToNW8AUDesarn6nlCIRIzxElyWjqrsB7SEfMXteVZ53eks_FgOAsvFA',
    linkUrl: '/events/2',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'slide-3',
    title: 'Triển lãm Nghệ thuật Đương đại Quốc tế',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTphX2FIsHJOOnIzN2ixnfbQ_IhCHIAiJ2wVkVT7f4MUtcbddx1vALU6N_tRWpTfc1eP7Kl2vrH7Jdry-ItZBG8msL92raubO86zbZud7HEXESxbdz2glQ-_6tBhvjTKgmCvySdqBaGbIAsFy0h-eLKu0-IeBoIMFz2RjIbGLz446QiA8eQ7Tw3z0c6DIjELTcKmxcNmXlV-i3ICXwkQ_ujaBpMTgQDo2kRjYnFDQuZCK_iShR3L4Cp39a_gQp45olrr62Y0OcnQ',
    linkUrl: '/events/3',
    displayOrder: 3,
    isActive: true,
  },
];

export const sliderService = {
  getSlides: async (): Promise<Slide[]> => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSlides));
      return defaultSlides;
    }
    const slides = JSON.parse(data) as Slide[];
    return slides.sort((a, b) => a.displayOrder - b.displayOrder);
  },

  getSlideById: async (id: string): Promise<Slide> => {
    const slides = await sliderService.getSlides();
    const slide = slides.find((s) => s.id === id);
    if (!slide) throw new Error('Không tìm thấy slide với ID: ' + id);
    return slide;
  },

  createSlide: async (slideData: Omit<Slide, 'id'>): Promise<Slide> => {
    const slides = await sliderService.getSlides();
    const newSlide: Slide = {
      ...slideData,
      id: 'slide-' + Math.random().toString(36).substr(2, 9),
    };
    slides.push(newSlide);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slides));
    return newSlide;
  },

  updateSlide: async (id: string, slideData: Partial<Slide>): Promise<Slide> => {
    const slides = await sliderService.getSlides();
    const index = slides.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Không tìm thấy slide với ID: ' + id);
    
    const updatedSlide = {
      ...slides[index],
      ...slideData,
    };
    slides[index] = updatedSlide;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slides));
    return updatedSlide;
  },

  deleteSlide: async (id: string): Promise<void> => {
    const slides = await sliderService.getSlides();
    const filtered = slides.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },
};
