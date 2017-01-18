var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
Galleria.loadTheme('http://cs.unc.edu/~rac/js/galleria/themes/classic/galleria.classic.min.js');
Galleria.configure({
  height: h-20,
  transition:"fade",
  thumbnails:"numbers",
  showInfo:true
});
Galleria.ready(function() {
  this.attachKeyboard({
    right: this.next,
    left: this.prev
  });
});
Galleria.run('.galleria');

