const DATA = [
  {
    template: 'character',
    name: 'Abigail',
    nickname: 'Abby',
    gender: 'Female',
    birthdate: 720328,
    home: 'Trioe Town',
    species: 'Absol'
  }
];
const TEMPLATES = {
  character: [
    {
      title: 'Basics',
      name: {form: 'text'},
      nickname: {form: 'text'},
      gender: {
        form: 'choice',
        list: ['Male', 'Female', 'Other']
      },
      age: {
        form: 'calc',
        func: function (t) {
          return Math.floor((_date - t.birthdate)/1000);
        }
      },
      birthdate: {form: 'date'}
    }
  ]
};
var _date = 1000101;

(function () {
  $(document).ready(function () {
    ///
    DATA.forEach((data) => {
      let section = $('<section>').addClass('wrapper').appendTo('body').first();
      if (data.name) section.attr('id', data.name);

      TEMPLATES[data.template].forEach((rowData) => {
        let row = $('<section>')
          .attr('id', rowData.title)
          .addClass('row')
          .appendTo(section)
          .first();
        for (const prop in rowData) {
          let key = prop,
              val = rowData[prop];
          if (key !== 'title') {
            let attr = {};
            let value = (data[key]+'') || '';
            switch (val.form) {
              case 'text':
                $('<input>')
                  .attr('type', 'text')
                  .attr('id', key)
                  .attr('value', value)
                  .appendTo(row);
                break;
              case 'choice':
                let container = $('<span>');
                container.attr('id', key).appendTo(row);
                val.list.forEach((option) => {
                  let checked = value === option ? 'checked' : null;
                  $('<input>')
                    .attr('type', 'radio')
                    .attr('id', key + '-' + option)
                    .attr('name', key)
                    .attr('value', option)
                    .attr('checked', checked)
                    .appendTo(container);
                  $('<label>')
                    .attr('for', key + '-' + option)
                    .html(option)
                    .appendTo(container);
                });
                break;
              case 'calc':
                attr = {

                };
                break;
              case 'date':
                attr = {

                };
                break;
              default:
                attr = {

                };
                break;
            }
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
