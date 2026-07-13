class AuraProductV2Gallery {
  constructor(root) {
    this.root = root;
    this.slides = [...root.querySelectorAll('[data-aura-product-v2-slide]')];
    this.thumbnails = [...root.querySelectorAll('[data-aura-product-v2-thumbnail]')];
    this.viewport = root.querySelector('[data-aura-product-v2-viewport]');
    this.current = root.querySelector('[data-aura-product-v2-current]');
    this.dialog = root.parentElement.querySelector('[data-aura-product-v2-dialog]');
    this.dialogImage = this.dialog?.querySelector('[data-aura-product-v2-dialog-image]');
    this.dialogZoom = this.dialog?.querySelector('[data-aura-product-v2-dialog-zoom]');
    this.index = 0;
    this.lastFocusedElement = null;
    this.mobileQuery = window.matchMedia('(max-width: 749px)');
    this.bind();
    this.updateForViewport();
  }

  bind() {
    this.thumbnails.forEach((button, index) => {
      button.addEventListener('click', () => this.goTo(index, { focus: true }));
    });

    this.root.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        this.goTo(this.index - 1, { focus: true });
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        this.goTo(this.index + 1, { focus: true });
      }
    });

    this.viewport?.addEventListener('scroll', () => this.onScroll(), { passive: true });
    this.mobileQuery.addEventListener('change', () => this.updateForViewport());

    this.root.querySelectorAll('[data-aura-product-v2-fullscreen-trigger]').forEach((trigger) => {
      trigger.addEventListener('click', () => this.openDialog(trigger));
    });
    this.dialog?.querySelector('[data-aura-product-v2-dialog-close]')?.addEventListener('click', () => this.dialog.close());
    this.dialog?.addEventListener('click', (event) => {
      if (event.target === this.dialog) this.dialog.close();
    });
    this.dialog?.addEventListener('cancel', () => this.resetDialogZoom());
    this.dialog?.addEventListener('close', () => {
      this.resetDialogZoom();
      this.lastFocusedElement?.focus();
    });
    this.dialogZoom?.addEventListener('click', () => this.toggleDialogZoom());
  }

  goTo(index, options = {}) {
    if (!this.slides.length) return;
    this.index = (index + this.slides.length) % this.slides.length;
    this.setActive(this.index);
    if (this.mobileQuery.matches) {
      this.slides[this.index].scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
    if (options.focus) this.thumbnails[this.index]?.focus({ preventScroll: true });
  }

  setActive(index) {
    this.slides.forEach((slide, slideIndex) => {
      const active = slideIndex === index;
      slide.classList.toggle('is-active', active);
      slide.hidden = !this.mobileQuery.matches && !active;
      slide.setAttribute('aria-hidden', String(!active));
    });
    this.thumbnails.forEach((thumbnail, thumbnailIndex) => {
      const active = thumbnailIndex === index;
      thumbnail.classList.toggle('is-active', active);
      thumbnail.setAttribute('aria-current', String(active));
    });
    if (this.current) this.current.textContent = index + 1;
  }

  updateForViewport() {
    this.setActive(this.index);
  }

  onScroll() {
    if (!this.mobileQuery.matches || !this.viewport || this.scrollFrame) return;
    this.scrollFrame = window.requestAnimationFrame(() => {
      const viewportCenter = this.viewport.scrollLeft + (this.viewport.clientWidth / 2);
      const nearestIndex = this.slides.reduce((nearest, slide, index) => {
        const distance = Math.abs((slide.offsetLeft + (slide.clientWidth / 2)) - viewportCenter);
        return distance < nearest.distance ? { index, distance } : nearest;
      }, { index: this.index, distance: Number.POSITIVE_INFINITY }).index;
      if (nearestIndex !== this.index) {
        this.index = nearestIndex;
        this.setActive(nearestIndex);
      }
      this.scrollFrame = null;
    });
  }

  openDialog(trigger) {
    if (!this.dialog || !this.dialogImage) return;
    this.lastFocusedElement = trigger;
    this.dialogImage.src = trigger.dataset.fullscreenSrc;
    this.dialogImage.alt = trigger.dataset.fullscreenAlt || '';
    this.dialog.showModal();
    this.dialog.querySelector('[data-aura-product-v2-dialog-close]')?.focus();
  }

  toggleDialogZoom() {
    if (!this.dialogZoom) return;
    const zoomed = this.dialogZoom.classList.toggle('is-zoomed');
    this.dialogZoom.setAttribute('aria-pressed', String(zoomed));
  }

  resetDialogZoom() {
    this.dialogZoom?.classList.remove('is-zoomed');
    this.dialogZoom?.setAttribute('aria-pressed', 'false');
  }
}

const initializeAuraProductV2Galleries = (scope = document) => {
  scope.querySelectorAll('[data-aura-product-v2-gallery]').forEach((gallery) => {
    if (!gallery.dataset.auraProductV2Initialized) {
      gallery.dataset.auraProductV2Initialized = 'true';
      new AuraProductV2Gallery(gallery);
    }
  });
};

initializeAuraProductV2Galleries();
document.addEventListener('shopify:section:load', (event) => initializeAuraProductV2Galleries(event.target));
