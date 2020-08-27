const DATA = [
  {
    'template': 'character',
    'Name': 'Abigail',
    'Nickname': 'Abby',
    'Gender': 'Female',
    'Birthdate': new Date('28 Mar 1972'),
    'Home': 'Trioe Town',
    'Species': 'Absol'
  }
];
const TEMPLATES = {
  character: [
    {
      'title': 'Basics',
      'Name': {form: 'text'},
      'Nickname': {form: 'text'},
      'Gender': {
        form: 'choice',
        list: ['Male', 'Female', 'Other']
      },
      'Age': {
        form: 'calc',
        func: function (data) {
          let age = _date.getFullYear() - data.Birthdate.getFullYear();
          return Math.floor(age) + ' years old';
        }
      },
      'Birthdate': {
        form: 'date'
      }
    }
  ]
};
var _date = new Date(Date.now());

(function () {
  $(document).ready(function () {
    ///
    DATA.forEach((data) => {
      let section = $('<section>').addClass('wrapper').appendTo('body').first();
      if (data.name) section.attr('id', data.name);

      TEMPLATES[data.template].forEach((sectData) => {
        let sect = $('<table>')
          .addClass('section')
          .attr('id', sectData.title)
          .appendTo(section)
          .first();
        for (const prop in sectData) {
          let key = prop,
              val = sectData[prop];
          if (key !== 'title') {
            let attr = {},
                value = (data[key]+'') || '',
                element;
            switch (val.form) {
              case 'text':
                element = $('<input>')
                  .attr('type', 'text')
                  .attr('value', value);
                break;
              case 'choice':
                element = $('<span>');
                // element.attr('id', key).appendTo(sect);
                val.list.forEach((option) => {
                  let checked = value === option ? 'checked' : null;
                  $('<input>')
                    .attr('type', 'radio')
                    .attr('id', key + '-' + option)
                    .attr('name', key)
                    .attr('value', option)
                    .attr('checked', checked)
                    .appendTo(element);
                  $('<label>')
                    .attr('for', key + '-' + option)
                    .html(option)
                    .appendTo(element);
                });
                break;
              case 'calc':
                let txt = val.func(data);
                element = $('<span>')
                  .html(txt);
                break;
              case 'date':
                element = $('<span>');
                break;
              default:
                element = $('<span>');
                break;
            }

            let row = $('<tr>')
              .addClass('item')
              .attr('id', key)
              .appendTo(sect);

            $('<th>')
              .addClass('item-title')
              .html(key + ': ')
              .wrap('<td />')
              .appendTo(row);

            element
              .wrap('<td />')
              .parent()
              .appendTo(row);
          }
        };
      });

      // $('<div>').addClass('content').html(data.content).appendTo(section);
      // let div = $('<div>').addClass('content').appendTo(section).first();
      // let content = $('<textarea>')
      //       .addClass('content-input')
      //       .html(data.content)
      //       .css('width', '80%')
      //       .css('height', '100px')
      //       .on('click', (e) => {e.stopPropagation();})
      //       .appendTo(div)
      //       .first();
    });

    // $('.content').each((i) => {
    //   let div = $('.content').eq(i),
    //       input;
    //   div.on('click', (e) => {
    //     e.stopPropagation();
    //     if (input) return;
    //     div.css('display', 'none');
    //     input = $('<textarea>')
    //       .addClass('content-input')
    //       .html(div.html())
    //       .css('width', '80%')
    //       .on('click', (e) => {e.stopPropagation();})
    //       .appendTo(div.parent())
    //       .first();
    //     setTimeout(()=>{input.css('height', '100px')},1);
    //   });
    //   div.parent().on('click', () => {
    //     if (!input) return;
    //     div.css('display', '');
    //     div.html(input.attr('value'));
    //     input.remove();
    //     input = null;
    //   });
    // });
  });
})();
