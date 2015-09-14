.. title: SVG c Snap.svg
.. slug: snap-svg
.. date: 2015-09-13 12:41:53 UTC
.. tags: svg, javascript
.. category: 
.. link: 
.. description: 
.. type: text

Появилась задача показывать превью результата раунда в слотовых играх. Выбор инструментария стоял между HTML и Canvas, второй был отброшен сразу как оверхед. На HTML символы барабана рисовалась легко, но с линиями комбинаций возникла проблема и я вспомнил про SVG.

SVG — XML-подобный язык разметки векторной графики, он легко масштабируется, анимируется и стилизируется через CSS, а сами изображения можно рисовать не используя специальный графический редактор.

XML, для разметки SVG, конечно удобно, но JavaScript удобнее, особенно когда картинки нужно создавать динамически. Для генерации SVG можно было использовать DOM API, но я взял инструмент помощнее – `Snap.svg <http://snapsvg.io/>`_.

Создается новая картинка так:

.. code:: js

    var snap = new Snap();

    
По умолчанию она добавляется в `document.body`, но в конструктор можно передать селектор элемента в который добавить картинку.

Рисовать матрицу на SVG не сложнее чем на HTML. Единственное что второй за счет тега `alt` позволяет обрабатывать ситуацию с отсутствием изображения на сервере, SVG просто показывает иконку битой картинки.

.. code:: js

    var CELL_WIDTH = 42;
    var CELL_HEIGHT = 42;

    function make_matrix(snap, matrix) {
        var group = snap.group();
        for (var i in matrix) {
            for (var j in matrix[i]) {
                group.image('assets/symbol_' + matrix[i][j] + '.png',
                    CELL_WIDTH * i, CELL_HEIGHT * j, CELL_WIDTH, CELL_HEIGHT);
            }
        }
        return group;
    }

Линии рисовать сложнее. Выигрыш на матрице задается массивом смещений сверху барабана, где 0 – символ не сыграл в этой колонке, 1-N – смещение. Линии рисуются из центра в центр символа слева направо, если символ не сыграл – строится линии, если сыграл – рисуется обводка символа.

.. code:: js

    function make_line(snap, win_line) {
        var container = snap.group();

        var win_line_group = container.group().attr({class: 'win_line_group'});
        var path = 'M' + (CELL_WIDTH / 2) + ','
            + (win_line.template[0] * CELL_HEIGHT + CELL_HEIGHT / 2) + ' ';
        for (var i = 0; i < win_line.template.length; ++i) {
            path += 'L' + (i * CELL_WIDTH + CELL_WIDTH / 2) + ','
                + (win_line.template[i] * CELL_HEIGHT + CELL_HEIGHT / 2) + ' ';
            if (win_line.positions[i] == 0) continue;

            win_line_group.rect(
                i * CELL_WIDTH, win_line.template[i] * CELL_HEIGHT,
                CELL_WIDTH, CELL_HEIGHT
            ).attr({class: 'win_line_symbol'});
        }

        win_line_group.path(path).attr({class: 'win_line_underside'});
        win_line_group.path(path).attr({class: 'win_line_upper'});
        return container;
    }

.. code:: css

    .win_line_group {
        transform: matrix(1, 0, 0, 1, 0.5, 0.5);
        font-size: 1em;
    }

    .win_line_upper {
        stroke: red;
        stroke-width: 2;
        stroke-linejoin: round;
        stroke-linecap: round;
        marker-start: url(#circle_marker_red);
        marker-end: url(#circle_marker_red);
        fill-opacity: 0;
    }

    .win_line_underside {
        stroke: white;
        stroke-width: 4;
        stroke-linejoin: round;
        stroke-linecap: round;
        marker-start: url(#circle_marker_white);
        marker-end: url(#circle_marker_white);
        fill-opacity: 0;
    }

    .win_line_symbol {
        stroke: red;
        stroke-width: 1;
        fill-opacity: 0;
    }

Трансформация на 0.5 по осям заставляет браузер рисовать очертания четкими, иначе включается сглаживание. В стилях `.win_line_upper` и `.win_line_underside` используются ссылки на заранее созданные фигуры:

.. code:: js

    function make_markers(snap) {
        var circle_marker = snap.circle(0, 0, 1).marker().attr({
            markerWidth: 1.4,
            markerHeight: 1.4
        });

        circle_marker.clone().attr({
            id: 'circle_marker_white',
            fill: 'white'
        });

        circle_marker.clone().attr({
            id: 'circle_marker_red',
            fill: 'red'
        });
    }

Несколько наложенных друг на друга линий выглядят не красиво, нужно исправить – сделать слайдер. Каждая линия смещается на ширину контейнера, а затем листается по клику, плюс индикатор количества линий:

.. code:: js

    function make_preview(snap, matrix, win_lines) {
        make_markers(snap);
        make_matrix(snap, matrix);

        var win_line_group = snap.group();
        for (var i in win_lines) {
            var line_group = make_line(win_line_group, win_lines[i]);
            line_group.transform('T' + width * i + ',0');
        }

        var counter = 0;
        var part_size = width / details.win_lines.length;
        var progress = group.rect(0, height + 1, part_size, 3)
            .attr({ fill: 'silver' });

        snap.click(function () {
            counter = (counter + 1) % win_line_group.children().length;
            win_line_group.transform('T-' + width * counter);
            progress.animate({width: part_size * (counter + 1)}, 100);
        });
    }

Пример можно посмотреть `тут <https://dl.dropboxusercontent.com/u/6566435/Work/risovalka/index.html>`_ (добавлена информационная панель с суммой выигрыша).