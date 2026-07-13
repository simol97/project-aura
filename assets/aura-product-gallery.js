class AuraProductGallery {
  constructor(root) {
    this.root = root;
    this.slides = [...root.querySelectorAll('[data-aura-gallery-slide]')];
    this.thumbnails = [...root.querySelectorAll('[data-aura-gallery-thumbnail]')];
    this.viewport = root.querySelector('[data-aura-gallery-viewport]');
    this.current = root.querySelector('[data-aura-gallery-current]');
    this.index = 0;
    this.pointers = new Map();
    this.zoomScale = Number(root.dataset.zoomScale || 2);
    this.bind();
  }

  bind() {
    this.root.querySelector('[data-aura-gallery-previous]')?.addEventListener('click', () => this.goTo(this.index - 1));
    this.root.querySelector('[data-aura-gallery-next]')?.addEventListener('click', () => this.goTo(this.index + 1));
    this.thumbnails.forEach((button, index) => button.addEventListener('click', () => this.goTo(index, true)));
    this.root.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); this.goTo(this.index - 1, true); }
      if (event.key === 'ArrowRight') { event.preventDefault(); this.goTo(this.index + 1, true); }
    });
    this.viewport?.addEventListener('scroll', () => this.onScroll(), { passive: true });
    this.slides.forEach((slide) => this.bindZoom(slide));
  }

  goTo(index, focus = false) {
    this.index = (index + this.slides.length) % this.slides.length;
    const slide = this.slides[this.index];
    this.slides.forEach((item, itemIndex) => {
      item.hidden = itemIndex !== this.index;
      item.classList.toggle('is-active', itemIndex === this.index);
    });
    this.thumbnails.forEach((item, itemIndex) => {
      const active = itemIndex === this.index;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-current', String(active));
    });
    if (this.current) this.current.textContent = this.index + 1;
    if (window.matchMedia('(max-width: 749px)').matches) {
      slide.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
    if (focus) this.thumbnails[this.index]?.focus({ preventScroll: true });
  }

  onScroll() {
    if (!window.matchMedia('(max-width: 749px)').matches || !this.viewport) return;
    const index = Math.round(this.viewport.scrollLeft / this.viewport.clientWidth);
    if (index !== this.index && this.slides[index]) this.goTo(index);
  }

  bindZoom(slide) {
    const media = slide.querySelector('[data-aura-gallery-media]');
    const image = media?.querySelector('img');
    if (!media || !image) return;
    if (this.root.dataset.zoomEnabled === 'true') {
      media.addEventListener('pointermove', (event) => {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        const box = media.getBoundingClientRect();
        image.style.transformOrigin = `${((event.clientX - box.left) / box.width) * 100}% ${((event.clientY - box.top) / box.height) * 100}%`;
        image.style.transform = `scale(${this.zoomScale})`;
      });
      media.addEventListener('pointerleave', () => { image.style.transform = ''; image.style.transformOrigin = ''; });
    }
    if (this.root.dataset.pinchEnabled === 'true') {
      media.addEventListener('pointerdown', (event) => { this.pointers.set(event.pointerId, event); media.setPointerCapture?.(event.pointerId); });
      media.addEventListener('pointermove', (event) => this.onPinch(event, image));
      ['pointerup', 'pointercancel', 'pointerleave'].forEach((name) => media.addEventListener(name, (event) => {
        this.pointers.delete(event.pointerId);
        if (!this.pointers.size) {
          this.startDistance = null;
          image.style.transform = '';
        }
      }));
    }
  }

  onPinch(event, image) {
    if (!this.pointers.has(event.pointerId)) return;
    this.pointers.set(event.pointerId, event);
    const points = [...this.pointers.values()];
    if (points.length !== 2) return;
    const distance = Math.hypot(points[0].clientX - points[1].clientX, points[0].clientY - points[1].clientY);
    if (!this.startDistance) this.startDistance = distance;
    const scale = Math.max(1, Math.min(this.zoomScale, distance / this.startDistance));
    image.style.transformOrigin = 'center';
    image.style.transform = `scale(${scale})`;
  }
}

const initializeAuraProductGalleries = (scope = document) => {
  scope.querySelectorAll('[data-aura-product-gallery]').forEach((gallery) => {
    if (!gallery.dataset.auraGalleryInitialized) {
      gallery.dataset.auraGalleryInitialized = 'true';
      new AuraProductGallery(gallery);
    }
  });
};

initializeAuraProductGalleries();
document.addEventListener('shopify:section:load', (event) => initializeAuraProductGalleries(event.target));
