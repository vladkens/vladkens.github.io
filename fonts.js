function range(from, to = null) {
    if (to === null) [from, to] = [0, from];
    return Array.from(new Array(to - from)).map((_, i) => i + from);
}

function alphabetToCharCode(letters) {
    letters = `${letters.toUpperCase()} ${letters.toLowerCase()}`.split(' ');
    return Array.from(new Set(letters)).map(i => i.charCodeAt(0));
}

let app = {
    run() {
        this.initDropZone();

        document.querySelectorAll('.char-table td').forEach(el => el.addEventListener('click', () => {
            let data = window.location.hash.substr(1).split(',').filter(i => i.length);
            if (data.indexOf(el.dataset.id) === -1) data.push(el.dataset.id);
            else data = data.filter(i => i !== el.dataset.id);

            data = data.map(i => parseInt(i, 10));
            this.selectChars(data);
        }));

        let btnReset = document.createElement('button');
        document.body.insertBefore(btnReset, document.body.children[0]);
        btnReset.addEventListener('click', () => this.resetSelectedChars());
        btnReset.innerText = 'reset selected symbols';
        btnReset.classList.add('btn-reset');

        let btnFind = document.createElement('button');
        document.body.insertBefore(btnFind, document.body.children[1]);
        btnFind.innerText = 'select symbols in text';
        btnFind.classList.add('btn-find');
        btnFind.addEventListener('click', () => this.selectSymbolsFromDemo());

        let lblDemo = document.createElement('textarea');
        document.body.insertBefore(lblDemo, document.body.children[2]);
        lblDemo.value = 'demo text';
        lblDemo.classList.add('lbl-demo');

        this.illuminateSelectedChars();
    },

    selectChars(chars) {
        // let data = window.location.hash.substr(1).split(',').filter(i => i.length);
        let data = [];
        data = data.concat(chars).map(i => parseInt(i, 10));
        data = Array.from(new Set(data));
        data = data.sort((a, b) => a - b);

        let scrollY = window.pageYOffset;
        window.location.hash = '#' + data.join(',');
        setTimeout(() => window.scrollTo(0, scrollY), 1);
        this.illuminateSelectedChars();
    },

    loadFont(name, src) {
        name = name.replace(/[^A-z0-9]/g);
        console.log(`font-name: ${name}`);

        let style = document.createElement('style');
        style.type = 'text/css';
        style.rel = 'stylesheet';
        style.innerHTML = `@font-face {
            font-family: "${name}";
            src: url(${src});
        }`;
        document.head.appendChild(style);
        this.setFontFamily(name);
    },

    setFontFamily(name) {
        document.querySelector('.lbl-demo').style.fontFamily = name;
        Array.from(document.querySelectorAll('.char-table')).forEach(i => {
            i.style.fontFamily = name;
        });
    },

    initDropZone() {
        let control = document.body;
        control.ondrop = e => {
            e.preventDefault();
            Array.from(e.dataTransfer.files).forEach(file => {
                let reader = new FileReader();
                reader.onload = e => {
                    let mime = 'application/octet-stream';
                    let data = `data:${mime};${e.target.result.slice(6)}`;
                    this.loadFont(file.name, data);
                };
                reader.readAsDataURL(file);
            });
        };
        control.ondragover = (e => e.preventDefault());
    },

    createCharTable(title = null, charCodes, split = 16) {
        if (title !== null) {
            let el = document.createElement('div');
            el.innerHTML = title;
            document.body.appendChild(el);
        }

        let table = document.createElement('table');
        table.classList.add('char-table');
        let tr;

        for (let i = 0; i < charCodes.length; ++i) {
            if (i % split === 0) {
                tr = document.createElement('tr');
                table.appendChild(tr);
            }

            let td = document.createElement('td');
            td.classList.add(`char-${charCodes[i]}`);
            td.dataset.id = charCodes[i];
            tr.appendChild(td);
            td.innerHTML = String.fromCharCode(charCodes[i]);

            let elDemo = document.createElement('div');
            td.appendChild(elDemo);
            elDemo.innerHTML = String.fromCharCode(charCodes[i]);
            elDemo.classList.add('char-demo');

            let elCode = document.createElement('div');
            td.appendChild(elCode);
            elCode.innerHTML = charCodes[i].toString(16);
            elCode.classList.add('char-code');
        }

        document.body.appendChild(table);
    },

    illuminateSelectedChars() {
        let data = window.location.hash.substr(1).split(',').filter(i => i.length);
        document.querySelectorAll('.char-table td').forEach(el => el.classList.remove('active'));
        data.forEach(i => document.querySelectorAll(`.char-${i}`).forEach(el => el.classList.add('active')));
    },

    resetSelectedChars() {
        window.location.hash = '#';
        this.illuminateSelectedChars();
    },

    selectSymbolsFromDemo() {
        this.resetSelectedChars();
        let uniqueSymbols = Array.from(new Set(document.querySelector('.lbl-demo').value.split('')));
        this.selectChars(uniqueSymbols.map(i => i.charCodeAt(0)));
    }
};

app.createCharTable('', range(256));
app.createCharTable('en', alphabetToCharCode('a b c d e f g h i j k l m n o p q r s t u v w x y z'));
app.createCharTable('ru', alphabetToCharCode('а б в г д е ё ж з и й к л м н о п р с т у ф х ц ч ш щ ъ ы ь э ю я'));

app.createCharTable('it', alphabetToCharCode('a b c d e f g h i j k l m n o p q r s t u v w x y z'));
app.createCharTable('es', alphabetToCharCode('a b c d e f g h i j k l m n ñ o p q r s t u v w x y z'));
app.createCharTable('fr', alphabetToCharCode('a b c d e f g h i j k l m n o p q r s t u v w x y z à â ç é è ê ë î ï ô ù û ü ÿ')); // æ œ
app.createCharTable('pt', alphabetToCharCode('a b c d e f g h i j k l m n o p q r s t u v w x y z á â ã à ç é ê í ó ô õ ú'));
app.createCharTable('tr', alphabetToCharCode('a b c ç d e f g ğ h ı i j k l m n o ö p r s ş t u ü v y z'));

app.createCharTable('de', alphabetToCharCode('a ä b c d e f g h i j k l m n o ö p q r s ß t u ü v w x y z'));
app.createCharTable('fi', alphabetToCharCode('a b c d e f g h i j k l m n o p q r s š t u v w x y z ž å ä ö'));
app.createCharTable('no', alphabetToCharCode('a b c d e f g h i j k l m n o p q r s t u v w x y z æ ø å'));
app.createCharTable('sv', alphabetToCharCode('a b c d e f g h i j k l m n o p q r s t u v w x y z å ä ö'));

app.createCharTable('vi', alphabetToCharCode('a ă â b c d đ e ê g h i k l m n o ô ơ p q r s t u ư v x y a ă â e ê i o ô ơ u ư y à ằ ầ è ề ì ò ồ ờ ù ừ ỳ ả ẳ ẩ ẻ ể ỉ ỏ ổ ở ủ ử ỷ ã ẵ ẫ ẽ ễ ĩ õ ỗ ỡ ũ ữ ỹ á ắ ấ é ế í ó ố ớ ú ứ ý ạ ặ ậ ẹ ệ ị ọ ộ ợ ụ ự ỵ'));

// http://www.xe.com/symbols.php
// JSON.stringify(Object.assign(...Array.from(document.querySelectorAll('.currencySymblTable tr')).map(el => [el.querySelector('td:nth-child(2)').innerText, el.querySelector('td:nth-child(5)').innerText]).map(([k, v]) => ({[k]: v})).slice(1)))

let data = `{"ALL":"Lek","AFN":"؋","ARS":"$","AWG":"ƒ","AUD":"$","AZN":"ман","BSD":"$","BBD":"$","BYN":"Br","BZD":"BZ$","BMD":"$","BOB":"$b","BAM":"KM","BWP":"P","BGN":"лв","BRL":"R$","BND":"$","KHR":"៛","CAD":"$","KYD":"$","CLP":"$","CNY":"¥","COP":"$","CRC":"₡","HRK":"kn","CUP":"₱","CZK":"Kč","DKK":"kr","DOP":"RD$","XCD":"$","EGP":"£","SVC":"$","EUR":"€","FKP":"£","FJD":"$","GHS":"¢","GIP":"£","GTQ":"Q","GGP":"£","GYD":"$","HNL":"L","HKD":"$","HUF":"Ft","ISK":"kr","INR":"","IDR":"Rp","IRR":"﷼","IMP":"£","ILS":"₪","JMD":"J$","JPY":"¥","JEP":"£","KZT":"лв","KPW":"₩","KRW":"₩","KGS":"лв","LAK":"₭","LBP":"£","LRD":"$","MKD":"ден","MYR":"RM","MUR":"₨","MXN":"$","MNT":"₮","MZN":"MT","NAD":"$","NPR":"₨","ANG":"ƒ","NZD":"$","NIO":"C$","NGN":"₦","NOK":"kr","OMR":"﷼","PKR":"₨","PAB":"B/.","PYG":"Gs","PEN":"S/.","PHP":"₱","PLN":"zł","QAR":"﷼","RON":"lei","RUB":"₽","SHP":"£","SAR":"﷼","RSD":"Дин.","SCR":"₨","SGD":"$","SBD":"$","SOS":"S","ZAR":"R","LKR":"₨","SEK":"kr","CHF":"CHF","SRD":"$","SYP":"£","TWD":"NT$","THB":"฿","TTD":"TT$","TRY":"","TVD":"$","UAH":"₴","GBP":"£","USD":"$","UYU":"$U","UZS":"лв","VEF":"Bs","VND":"₫","YER":"﷼","ZWD":"Z$"}`;
app.createCharTable('currencies', alphabetToCharCode(Object.values(JSON.parse(data)).join(' ')));

app.run();
