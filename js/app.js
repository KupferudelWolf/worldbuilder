/// Temporary.
console.log(Date.now().toString(32));

(function () {

    var _dragging, DATA, BUBBLE_FRAME, BUBBLE_CONTAINER;

    const SVG = $(document.createElementNS('http://www.w3.org/2000/svg','svg')),
          /// DICT holds all bubbles / entries.
          DICT = {
            /// Redundantly contain all entries in _.
            _: [],
            /// Add a new bubble to the dictionary.
            add: function (bubble) {
              DICT._.push(bubble);
              let key = bubble.class;
              if (typeof(key) !== 'string') return;
              if (!DICT[key]) DICT[key] = [];
              DICT[key].push(bubble);
            },
            /// Select all bubbles of specific classes.
            /// Excluded classes with an exclamation mark.
            select: function (args) {
              let out = [], whitelist, blacklist;
              if (typeof(args) === 'string') args = [args];

              whitelist = args.filter(s => s[0] !== '!');
              blacklist = args.filter(s => s[0] === '!');
              blacklist.push('!_');

              if (whitelist.length <= 0) whitelist = Object.keys(DICT);

              return Object.keys(DICT)
                .filter((key) => {
                  return true
                    && typeof(DICT[key]) === 'object'
                    && whitelist.includes(key)
                    && !blacklist.includes('!'+key);
                })
                .reduce((obj, key) => {
                  obj[key] = DICT[key];
                  return obj[key];
                }, []);
            }
          },

          /// Load data from JSON.
          loadEntires = function () {
            let deferred = $.Deferred();

            $.getJSON('./data/entries.json', (data) => {
              DATA = data;
            }).fail(function () {
              console.error('Invalid data file.');
              deferred.reject();
            }).success(deferred.resolve);

            return deferred;
          },

          /// Save data to JSON.
          saveEntries = function () {
            //
          },

          /// Initialize the bubbles and their container.
          initBubbles = function () {
            let corners = { bottom: 0, right: 0 },
                defaultFramePosition, startX, startY, left, top, rate;

            DATA.forEach((obj, ind) => {
              let bubble = new Bubble(obj);

              corners.bottom = Math.max(corners.bottom, bubble.y + bubble.element.outerHeight() + BUBBLE_FRAME.width()/2);
              corners.right  = Math.max(corners.right, bubble.x + bubble.element.outerWidth() + BUBBLE_FRAME.height()/2);

              if (obj.focus) {
                defaultFramePosition = [
                  bubble.x + bubble.element.outerWidth()/2,
                  bubble.y + bubble.element.outerHeight()/2
                ];
              }

              obj.bubble = bubble;
            });

            if (!defaultFramePosition) {
              defaultFramePosition = [corners.right/2, corners.bottom/2];
            }

            BUBBLE_CONTAINER
              .css({
                'width':  corners.right + 'px',
                'height': corners.bottom + 'px',
                'left': -defaultFramePosition[0] + BUBBLE_FRAME.width()/2 - parseInt(BUBBLE_CONTAINER.css('margin-left')),
                'top':  -defaultFramePosition[1] + BUBBLE_FRAME.height()/2 - parseInt(BUBBLE_CONTAINER.css('margin-top'))
              })
              .on('mousedown', (e) => {
                if (_dragging) return;
                _dragging = {
                  self: BUBBLE_CONTAINER,
                  rate: 0.75
                };
              })
              .on('mouseup mouseleave', () => {
                if (!_dragging) return;
                let left = BUBBLE_CONTAINER.css('left').slice(0, -2),
                    top = BUBBLE_CONTAINER.css('top').slice(0, -2);
                left = Math.min(Math.max(left, BUBBLE_FRAME.width() - BUBBLE_CONTAINER.outerWidth(true)), 0);
                top = Math.min(Math.max(top, BUBBLE_FRAME.height() - BUBBLE_CONTAINER.outerHeight(true)), 0);
                BUBBLE_CONTAINER.css('left', left + 'px');
                BUBBLE_CONTAINER.css('top',  top + 'px');
              });
          },

          /// Click-and-drag functionality.
          /// Activates when _dragging is set.
          controlDrag = function () {
            let startX, startY, rate, left, top;
            $('.bubble-frame')
              .on('mousedown', (e) => {
                if (!_dragging) return;
                e = _dragging.e || e;
                e.preventDefault();

                left = _dragging.self.position().left;
                top = _dragging.self.position().top;
                startX = e.pageX;
                startY = e.pageY;
                rate = _dragging.rate || 1;
                _dragging.self.addClass('active');
              })
              .on('mousemove', (e) => {
                if (!_dragging) return;
                e.preventDefault();

                let dX = e.pageX - startX,
                    dY = e.pageY - startY;
                _dragging.self.css({
                  left: dX * rate + left + 'px',
                  top:  dY * rate + top  + 'px'
                });
              })
              .on('mouseup mouseleave', (e) => {
                if (!_dragging) return;
                e.preventDefault();

                _dragging.self.removeClass('active');
                _dragging = false;
              });
          },

          /// Line manipulation; for Bubble internal use.
          updateLine = function (elems, line) {
      let attr = {}, pos = [], rad = [], dist, angle, radii = 0;

      for (let i = 0; i < 2; ++i) {
        let e = elems[i];
        pos[i] = elems[i].position();
        rad[i] = [
          e.outerWidth()/2,
          e.outerHeight()/2
        ];
        radii += Math.max(...rad[i]);
        pos[i].left += rad[i][0];
        pos[i].top += rad[i][1];
      }

      dist = Math.sqrt((pos[1].top - pos[0].top)**2 + (pos[1].left - pos[0].left)**2);
      if (dist <= radii) {
        /// Circles meet or intersect.
        line.attr({
          x1: 0, x2: 0,
          y1: 0, y2: 0
        });
        return;
      }

      angle = Math.atan2(pos[1].top - pos[0].top, pos[1].left - pos[0].left);

      for (let i = 0; i < 2; ++i) {
        let sgn = 1,//i ? -1 : 1,
            x = pos[i].left + sgn * Math.cos(angle) * rad[i][0],
            y = pos[i].top + sgn * Math.sin(angle) * rad[i][1];
        attr[`x${i+1}`] = Math.round(x);
        attr[`y${i+1}`] = Math.round(y);
        angle += Math.PI;
      }

      line.attr(attr);
    };

    class Bubble {
      constructor(prop, x, y) {
        if (!prop.bubble) {
          prop.bubble = {
            x: x || 0,
            y: y || 0
          }
        }
        this.x = prop.bubble.x;
        this.y = prop.bubble.y;
        this.events = prop.events || [];
        this.class = prop.class || 'event';
        this.title = prop.title || 'New Bubble';
        this.id = prop.id;
        if (!this.id) {
          this.id = this.title
            .toLowerCase()
            .replace(/[\s\-]/g, '_')
            .replace(/[^0-9a-z_]/g, '')
            + '-' + Date.now().toString(32);
        }

        DICT.add(this);

        this.element =  $('<div>')
          .addClass('bubble')
          .addClass(this.class)
          .attr('id', this.id)
          .css({
            'left': this.x + 'px',
            'top': this.y + 'px'
          })
          .html(`<p>${this.title}</p>`)
          .appendTo(BUBBLE_CONTAINER);

        let startX, startY, moved;
        this.element
          .on('mousedown', function (e) {
            if (_dragging) return;
            e.stopPropagation();
            _dragging = {
              self: $(this),
              e: e
            };
            startX = e.pageX;
            startY = e.pageY;
            moved = false;
            BUBBLE_FRAME.trigger('mousedown');
          })
          .on('mousemove', function (e) {
            if (!_dragging) return;
            const self = $(this);
            let dX = e.pageX - startX,
                dY = e.pageY - startY;
            if (Math.abs(dX) >= 1 || Math.abs(dY) >= 1) {
              moved = true;
            }
            self.trigger('bubble:onmove');
          })
          .on('mouseup mouseleave', function () {
            // if (!_dragging) return;
            const self = $(this);
            let left = self.css('left').slice(0, -2),
                top = self.css('top').slice(0, -2);
            left = Math.min(Math.max(left, 0), BUBBLE_CONTAINER.width() - self.width());
            top = Math.min(Math.max(top, 0), BUBBLE_CONTAINER.height() - self.height());
            self.css('left', left + 'px');
            self.css('top',  top + 'px');
            // self.trigger('bubble:onmove');
          });

        if (this.class === 'event') {
          let targs = DICT.select('!event');
          for (let i = 0, l = targs.length; i < l; ++i) {
            let bubble = targs[i];
            if (!bubble.events.includes(this.id)) continue;
            bubble.createLine(this.element);
          }
        } else {
          for (let i = 0, l = this.events.length; i < l; ++i) {
            let id = this.events[i];
            let target = $(`#${id}`);
            if (!target.length) continue;
            this.createLine(target);
          }
        }
      }

      createLine(targ) {
        let self = this.element,
            line = $(document.createElementNS('http://www.w3.org/2000/svg','line'));
        SVG.append(line);
        updateLine([self, targ], line)
        self.on('bubble:onmove', () => updateLine([self, targ], line));
        targ.on('bubble:onmove', () => updateLine([self, targ], line));
      }
    }

    $(document).ready(function () {
      BUBBLE_FRAME = $('.bubble-frame');
      BUBBLE_CONTAINER = $('.bubble-container');

      SVG.appendTo(BUBBLE_CONTAINER);
      SVG.get(0).classList.add('bubbleSVG');

      loadEntires().then(() => {
        initBubbles();
        controlDrag();
      });
  });
})();
