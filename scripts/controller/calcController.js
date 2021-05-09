class CalcController {

    constructor() {

        //this._alguma coisa, quer dizer que é privado  
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';
        this._operation = [];
        this._locale = 'pt-BR';
        this._displayCalcEl = document.querySelector('#display');
        this._dateEl = document.querySelector('#data');
        this._timeEl = document.querySelector('#hora');
        this._currentDate;
        this.initialize();
        this.initButtonsEvents();
        this.initKeyboard();

        // Classe é da web api, não é nativa do javascript.
        this._audio = new Audio('click.mp3');
    }

    // Serve para um colar um valor na calculador (ctrl+v)
    pasteFromClipboard(){
        document.addEventListener('paste', e=>{
            let text = e.clipboardData.getData('text');
            this.displayCalc = parseFloat(text);   
        });
    }

    // Serve para um copiar um valor da calculador (ctrl+c)
    copyToClipboard(){
        let input = document.createElement('input');
        input.value = this.displayCalc;
        document.body.appendChild(input);
        input.select();
        document.execCommand('Copy');
        input.remove();

    }
    initialize() {
        this.setDisplayDateTime();
        let interval = setInterval(() => {
            this.setDisplayDateTime();
        }, 1000);
        this.setLastNamberToDisplay();
        this.pasteFromClipboard();

        document.querySelectorAll('.btn-ac').forEach(btn=>{
            btn.addEventListener('dblclick', e=>{
                this.toggleAudio();
            });
        });
        
        /* usado para realizar uma ação, no caso abaixo ele
        está sendo usado para parar a contagem da hora na
        calculadora*/

        // setTimeout(()=>{
        //     clearInterval(interval);
        // }, 10000);
    }

    // Ligar ou desligar o áudio.
    toggleAudio(){

        this._audioOnOff = !this._audioOnOff;


        //this._audioOnOff = (this._audioOnOff) ? false : true;
        

        // if(this._audioOnOff) {
        //     this._audioOnOff = false;
        // } else {
        //     this._audioOnOff = true;
        // }
    }


    playAudio(){
        if (this._audioOnOff){
            this._audio.currentTime = 0;
            this._audio.play();
        }

    }

    // Eventos de teclado.
    initKeyboard(){
        document.addEventListener('keyup', e=>{

            this.playAudio();
            switch (e.key) {
                case 'Escape':
                    this.clearAll();
                    break;
                case 'Backspace':
                    this.clearEntry();
                    break;
                case '+':
                case '-':
                case '*':
                case '/':
                case '%':
                    this.addOperation(e.key);
                    break;
                case 'Enter':
                case '=':
                    this.calc();
                    break;
                case '.':
                case ',':
                    this.addDot();
                    break;
    
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;
                case 'c':
                    if (e.ctrlKey) this.copyToClipboard();
                    break;
            }
        });

    }

    // serve para retorna o elemento desejado. O false é para o dom parar
    //no primeiro dos eventos que possam acontecer
    addEventListenerAll(element, events, fn) {
        events.split(' ').forEach(event => {
            element.addEventListener(event, fn, false);
        });
    }

    clearAll() {
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';
        this.setLastNamberToDisplay();
    }

    clearEntry() {
        this._operation.pop();
        this.setLastNamberToDisplay();
    }

    getLastOperation() {
        return this._operation[this._operation.length - 1];
    }

    setLastOperation(value) {
        this._operation[this._operation.length - 1] = value;
    }

    isOperator(value) {
        return (['+', '-', '*', '/', '%'].indexOf(value) > -1);
    }

    pushOperation(value) {
        this._operation.push(value);
        if (this._operation.length > 3) {
            this.calc();
        }
    }

    getResult() {
        try{
        return eval(this._operation.join(""));
        } catch(e){
            setTimeout(()=>{
                this.setError();
            },1);
           // alert('realizando uma operação só um só número, digite o próximo.')
        }
    }

    calc() {
        let last = '';
        this._lastOperator = this.getLastItem();

        if(this._operation.length < 3){
            let firtsItem = this._operation[0];
            this._operation = [firtsItem, this._lastOperator, this._lastNumber];
        }

        if (this._operation.length > 3) {
            last = this._operation.pop();
            this._lastNumber = this.getResult();
        
        } else if (this._operation.length == 3) {
            this._lastNumber = this.getLastItem(false);
        }

        let result = this.getResult();

        if (last == "%") {
            result /= 100;
            this._operation = [result];
        } else {
            this._operation = [result];
            if (last) this._operation.push(last);

        }
        this.setLastNamberToDisplay();
    }

    getLastItem(isOperator = true) {
        let lastItem;

        for (let i = this._operation.length - 1; i >= 0; i--) {

            if (this.isOperator(this._operation[i]) == isOperator) {
                lastItem = this._operation[i];
                break;
            }
        }
        if(!lastItem){
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
        }
        return lastItem;
    }
    setLastNamberToDisplay() {
        let lastNumber = this.getLastItem(false);

        if (!lastNumber) lastNumber = 0;
        
        this.displayCalc = lastNumber;
    }

    addOperation(value) {
        if (isNaN(this.getLastOperation())) {
            if (this.isOperator(value)) {

                this.setLastOperation(value);

            } else {
                this.pushOperation(value);
                this.setLastNamberToDisplay();
            }
        } else {

            if (this.isOperator(value)) {
                this.pushOperation(value);

            } else {

                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);
                this.setLastNamberToDisplay();
            }
        }
    }

    setError() {
        this.displayCalc = "Error";
    }

    addDot(){
        let lastOperation = this.getLastOperation();

        if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

        if (this.isOperator(lastOperation) || !lastOperation){
            this.pushOperation('0.');
        
        } else {
            this.setLastOperation(lastOperation.toString() + '.');
        }
        this.setLastNamberToDisplay();
    }

    execBtn(value) {

       this.playAudio();

        switch (value) {
            case 'ac':
                this.clearAll();
                break;
            case 'ce':
                this.clearEntry();
                break;
            case 'soma':
                this.addOperation('+');
                break;
            case 'subtracao':
                this.addOperation('-');
                break;
            case 'multiplicacao':
                this.addOperation('*');
                break;
            case 'divisao':
                this.addOperation('/');
                break;
            case 'porcento':
                this.addOperation('%');
                break;
            case 'igual':
                this.calc();
                break;
            case 'ponto':
                this.addDot();
                break;

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;
            default:
                this.setError();
                break;
        }
    }

    //Método para os eventos do botão
    initButtonsEvents() {
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");
        //Quando recebe só 1 parâmetro pode deixar sem os parênteses, mas quando adiciona
        //mais algum, os parênteses são obrigatórios. No caso de (btn, index)
        buttons.forEach((btn, index) => {
            //click e drag são eventos, click se clicar e drag se arrastar
            this.addEventListenerAll(btn, 'click drag', e => {
                //btn.className.baseVal = retorna só o nome da classe.
                let textBtn = btn.className.baseVal.replace("btn-", "");

                this.execBtn(textBtn);

            });

            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {
                btn.style.cursor = 'pointer';
            })
        })
    }

    setDisplayDateTime() {
        this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    }

    get displayTime() {
        return this._timeEl.innerHTML;
    }

    set displayTime(value) {
        this._timeEl.innerHTML = value;
    }

    get displayDate() {
        return this._dateEl.innerHTML;
    }

    set displayDate(value) {
        this._dateEl.innerHTML = value;
    }

    get displayCalc() {
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value) {
        if(value.toString().length > 10) {
            this.setError();
            return false;
        }
        this._displayCalcEl.innerHTML = value;
    }

    get currentDate() {
        return new Date();
    }

    set currentDate(value) {
        this._currentDate = value;
    }

}