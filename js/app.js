const DATA = [
  {
    class: 'character',
    title: 'Abigail',
    desc: '',
    id: 'abigail-1f3ohguup',
    focus: true,
    bubble: {
      x: 500,
      y: 800
    },
    stats: {
      'Name': 'Abigail',
      'Nickname': 'Abby',
      'Gender': 'Female',
      'Home': 'Trioe Town',
      'Species': 'Absol'
    },
    events: [
      'abigail_was_born-1f3ok8sv5'
    ]
  },
  {
    class: 'event',
    title: 'Abigail was born.',
    desc: '',
    id: 'abigail_was_born-1f3ok8sv5',
    timestamp: 'Y-20 D140',
    bubble: {
      x: 550,
      y: 990
    }
  }
];

console.log(Date.now().toString(32));

(function () {
  $(document).ready(function () {
    const frame = $('.bubble-frame'),
          container = $('.bubble-container'),
          cont = {
            // top: 0,
            bottom: 0,
            // left: 0,
            right: 0
          };

    let defaultFramePosition;

    var dragging;

    DATA.forEach((obj, ind) => {
      let bubble = $('<div>')
            .addClass('bubble')
            .addClass(obj.class)
            .attr('id', obj.id)
            .css({
              'left': obj.bubble.x + 'px',
              'top': obj.bubble.y + 'px'
            })
            .html(`<p>${obj.title}</p>`)
            .appendTo(container);

      // cont.top    = Math.max(cont.top, obj.bubble.y);
      cont.bottom = Math.max(cont.bottom, obj.bubble.y + bubble.outerHeight() + frame.width()/2);
      // cont.left   = Math.max(cont.left, obj.bubble.x);
      cont.right  = Math.max(cont.right, obj.bubble.x + bubble.outerWidth() + frame.height()/2);

      if (obj.focus) {
        defaultFramePosition = [
          obj.bubble.x + bubble.outerWidth()/2,
          obj.bubble.y + bubble.outerHeight()/2
        ];
      }

      let startX, startY, moved;
      bubble
        .on('mousedown', function (e) {
          if (dragging) return;
          e.stopPropagation();
          const self = $(this);
          dragging = {
            self: self,
            e: e
          };
          startX = e.pageX;
          startY = e.pageY;
          moved = false;
          frame.trigger('mousedown');
          // return false;
        })
        .on('mousemove', function (e) {
          if (!dragging) return;
          const self = $(this);
          let dX = e.pageX - startX,
              dY = e.pageY - startY;//,
              // rate = 1;
          // self.css('left', dX * rate + left + 'px');
          // self.css('top',  dY * rate + top + 'px');
          if (Math.abs(dX) >= 1 || Math.abs(dY) >= 1) {
            moved = true;
          }
          self.trigger('bubble:onmove');
        })
        .on('mouseup mouseleave', function () {
          // if (!dragging) return;
          const self = $(this);
          let left = self.css('left').slice(0, -2),
              top = self.css('top').slice(0, -2);
          left = Math.min(Math.max(left, 0), container.width() - self.width());
          top = Math.min(Math.max(top, 0), container.height() - self.height());
          self.css('left', left + 'px');
          self.css('top',  top + 'px');
          // dragging = false;
          // self.removeClass('active');
          self.trigger('bubble:onmove');
        });

      obj.div = bubble;
    });

    let updateLineFunction = function (elems, line) {
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
        line.attr({
          x1: 0, x2: 0,
          y1: 0, y2: 0
        });
        return;
      }

      angle = Math.atan2(pos[1].top - pos[0].top, pos[1].left - pos[0].left);

      for (let i = 0; i < 2; ++i) {
        let sgn = i ? -1 : 1,
            x = pos[i].left + sgn * Math.cos(angle) * rad[i][0],
            y = pos[i].top + sgn * Math.sin(angle) * rad[i][1];
        attr[`x${i+1}`] = x;
        attr[`y${i+1}`] = y;
      }

      // for (let key in attr) {
        // attr[key] += 'px';
      // }
      line.attr(attr);
    };

    let svgContainer = $(document.createElementNS('http://www.w3.org/2000/svg','svg'));
    svgContainer.appendTo(container);
    svgContainer.get(0).classList.add('bubbleSVG');
    for (let i = 0, l = DATA.length; i < l; ++i) {
      let obj = DATA[i];
      if (!obj.events) continue;
      let divA = obj.div;
      for (let j = 0, m = obj.events.length; j < m; ++j) {
        let id = obj.events[j];
        let divB = $(`#${id}`);
        if (!divB.length) continue;
        let line = $(document.createElementNS('http://www.w3.org/2000/svg','line'));
        svgContainer.append(line);
        updateLineFunction([divA, divB], line)
        divA.on('bubble:onmove', () => updateLineFunction([divA, divB], line));
        divB.on('bubble:onmove', () => updateLineFunction([divA, divB], line));
      }
    }

    let cW = cont.right /*- cont.left*/,
        cH = cont.bottom /*- cont.top*/;

    if (!defaultFramePosition) {
      defaultFramePosition = [cW/2, cH/2];
    }

    container.css({
      'width':  cW + 'px',
      'height': cH + 'px',
      'left': -defaultFramePosition[0] + frame.width()/2 - parseInt(container.css('margin-left')),
      'top':  -defaultFramePosition[1] + frame.height()/2 - parseInt(container.css('margin-top'))
    });



    controlDrag();


    function controlDrag() {
      let startX, startY, left, top, rate;
      container
        .on('mousedown', (e) => {
          if (dragging) return;
          dragging = {
            self: container,
            rate: 0.75
          };
        })
        .on('mouseup mouseleave', () => {
          if (!dragging) return;
          let left = container.css('left').slice(0, -2),
              top = container.css('top').slice(0, -2);
          left = Math.min(Math.max(left, frame.width() - container.outerWidth(true)), 0);
          top = Math.min(Math.max(top, frame.height() - container.outerHeight(true)), 0);
          container.css('left', left + 'px');
          container.css('top',  top + 'px');
        });

      frame
        .on('mousedown', (e) => {
          if (!dragging) return;
          e = dragging.e || e;
          e.preventDefault();

          left = dragging.self.position().left;
          top = dragging.self.position().top;
          startX = e.pageX;
          startY = e.pageY;
          rate = dragging.rate || 1;
          dragging.self.addClass('active');
        })
        .on('mousemove', (e) => {
          if (!dragging) return;
          e.preventDefault();

          let dX = e.pageX - startX,
              dY = e.pageY - startY;
          dragging.self.css('left', dX * rate + left + 'px');
          dragging.self.css('top',  dY * rate + top + 'px');
        })
        .on('mouseup mouseleave', (e) => {
          if (!dragging) return;
          e.preventDefault();

          dragging.self.removeClass('active');
          dragging = false;
        });
    }

    //

  });
})();
