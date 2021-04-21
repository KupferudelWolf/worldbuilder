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
    let frame = $('.bubble-frame');
    let container = $('.bubble-container');
    let cont = {
      // top: 0,
      bottom: 0,
      // left: 0,
      right: 0
    }
    let focus;

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
        focus = [
          obj.bubble.x + bubble.outerWidth()/2,
          obj.bubble.y + bubble.outerHeight()/2
        ];
      }

      let startX, startY, left, top, dragging, moved;
      bubble
        .on('mousedown', function (e) {
          e.preventDefault();
          const self = $(this);
          left = self.position().left;
          top = self.position().top;
          startX = e.pageX;
          startY = e.pageY;
          dragging = true;
          moved = false;
          self.addClass('active');
        })
        .on('mousemove', function (e) {
          if (!dragging) return;
          const self = $(this);
          e.preventDefault();
          let dX = e.pageX - startX,
              dY = e.pageY - startY,
              rate = 1;
          self.css('left', dX * rate + left + 'px');
          self.css('top',  dY * rate + top + 'px');
          if (Math.abs(dX) >= 1 || Math.abs(dY) >= 1) {
            moved = true;
          }
          self.trigger('bubble:onmove');
        })
        .on('mouseup mouseleave', function () {
          if (!dragging) return;
          // console.log(moved);
          const self = $(this);
          let left = self.css('left').slice(0, -2),
              top = self.css('top').slice(0, -2);
          left = Math.min(Math.max(left, 0), container.width() - self.width());
          top = Math.min(Math.max(top, 0), container.height() - self.height());
          self.css('left', left + 'px');
          self.css('top',  top + 'px');
          dragging = false;
          self.removeClass('active');
        });

      obj.div = bubble;
    });

    let updateLineFunction = function (elems, line) {
      let pos = [],
          rad = [],
          attr = {},
          angle;

      for (let i = 0; i < 2; ++i) {
        let e = elems[i],
            p = e.position();
        rad[i] = [
          e.outerWidth()/2,
          e.outerHeight()/2
        ];
        pos[i] = [
          p.left + rad[i][0],
          p.top + rad[i][1]
        ];
      }

      angle = Math.atan2(pos[1][1] - pos[0][1], pos[1][0] - pos[0][0]);

      for (let i = 0; i < 2; ++i) {
        let sgn = i ? -1 : 1,
            x = pos[i][0] + sgn * Math.cos(angle) * rad[i][0],
            y = pos[i][1] + sgn * Math.sin(angle) * rad[i][1];
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

    if (!focus) {
      focus = [cW/2, cH/2];
    }

    container.css({
      'width':  cW + 'px',
      'height': cH + 'px',
      'left': -focus[0] + frame.width()/2 - parseInt(container.css('margin-left')),
      'top':  -focus[1] + frame.height()/2 - parseInt(container.css('margin-top'))
    });



    controlContainerDrag();


    function controlContainerDrag() {
      let startX, startY, left, top, dragging;
      container
        .on('mousedown', (e) => {
          left = container.position().left;
          top = container.position().top;
          startX = e.pageX;
          startY = e.pageY;
          dragging = true;
          container.addClass('active');
        })
        .on('mousemove', (e) => {
          if (!dragging || $('.bubble.active').length) return;
          e.preventDefault();
          container.css('left', (e.pageX - startX) * 0.75 + left + 'px');
          container.css('top',  (e.pageY - startY) * 0.75 + top + 'px');
        })
        .on('mouseup mouseleave', () => {
          if (!dragging || $('.bubble.active').length) return;
          let left = container.css('left').slice(0, -2),
              top = container.css('top').slice(0, -2);
          left = Math.min(Math.max(left, frame.width() - container.outerWidth(true)), 0);
          top = Math.min(Math.max(top, frame.height() - container.outerHeight(true)), 0);
          container.css('left', left + 'px');
          container.css('top',  top + 'px');
          dragging = false;
          container.removeClass('active');
        });
      }

    //

  });
})();
