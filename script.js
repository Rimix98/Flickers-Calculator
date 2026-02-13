class Calculator {
    constructor() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.shouldResetScreen = false;
        this.history = [];
        
        this.currentOperandElement = document.querySelector('.current-operand');
        this.previousOperandElement = document.querySelector('.previous-operand');
        
        this.initializeButtons();
        this.initializeModes();
        this.initializeConverter();
    }

    initializeButtons() {
        document.querySelectorAll('.btn.number').forEach(button => {
            button.addEventListener('click', () => {
                this.appendNumber(button.dataset.number);
            });
        });

        document.querySelectorAll('.btn.operator').forEach(button => {
            button.addEventListener('click', () => {
                this.chooseOperation(button.dataset.operator);
            });
        });

        document.querySelectorAll('[data-action="clear"]').forEach(button => {
            button.addEventListener('click', () => {
                this.clear();
            });
        });

        document.querySelectorAll('[data-action="delete"]').forEach(button => {
            button.addEventListener('click', () => {
                this.delete();
            });
        });

        document.querySelectorAll('[data-action="equals"]').forEach(button => {
            button.addEventListener('click', () => {
                this.compute();
            });
        });

        document.querySelector('[data-action="percent"]')?.addEventListener('click', () => {
            this.percent();
        });

        // Научные функции
        document.querySelectorAll('[data-sci]').forEach(button => {
            button.addEventListener('click', () => {
                this.scientificFunction(button.dataset.sci);
            });
        });
    }

    initializeModes() {
        const modeButtons = document.querySelectorAll('.mode-btn');
        const modePanels = document.querySelectorAll('.mode-panel');
        let currentModeIndex = 0;
        const modes = ['basic', 'converter'];

        modeButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                const targetMode = button.dataset.mode;
                const targetIndex = modes.indexOf(targetMode);
                
                if (targetIndex === currentModeIndex) return;

                // Определяем направление анимации
                const direction = targetIndex > currentModeIndex ? 'left' : 'right';
                
                // Убираем активный класс с кнопок
                modeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Находим текущую и целевую панели
                const currentPanel = document.querySelector('.mode-panel.active');
                const targetPanel = document.getElementById(`${targetMode}-mode`);

                // Анимация выхода текущей панели
                currentPanel.classList.add(`slide-out-${direction}`);
                
                setTimeout(() => {
                    currentPanel.classList.remove('active', `slide-out-${direction}`);
                    currentPanel.style.display = 'none';
                    
                    // Анимация входа новой панели
                    targetPanel.style.display = 'block';
                    targetPanel.classList.add('active');
                    
                    // Небольшая задержка для плавности
                    requestAnimationFrame(() => {
                        targetPanel.classList.add(`slide-in-${direction === 'left' ? 'right' : 'left'}`);
                    });
                    
                    setTimeout(() => {
                        targetPanel.classList.remove(`slide-in-${direction === 'left' ? 'right' : 'left'}`);
                    }, 500);
                }, 400);

                currentModeIndex = targetIndex;
            });
        });

        // Кнопка настроек
        document.getElementById('settings-btn').addEventListener('click', () => {
            const settingsPanel = document.getElementById('settings-mode');
            const currentPanel = document.querySelector('.mode-panel.active');
            
            if (settingsPanel.classList.contains('active')) {
                // Закрываем настройки с анимацией
                settingsPanel.classList.add('slide-out-right');
                
                setTimeout(() => {
                    settingsPanel.classList.remove('active', 'slide-out-right');
                    settingsPanel.style.display = 'none';
                    
                    // Возвращаем активную панель с анимацией
                    const activeBtn = document.querySelector('.mode-btn.active');
                    const targetMode = activeBtn.dataset.mode;
                    const targetPanel = document.getElementById(`${targetMode}-mode`);
                    
                    targetPanel.style.display = 'block';
                    targetPanel.classList.add('active');
                    
                    requestAnimationFrame(() => {
                        targetPanel.classList.add('slide-in-left');
                    });
                    
                    setTimeout(() => {
                        targetPanel.classList.remove('slide-in-left');
                    }, 500);
                }, 400);
            } else {
                // Открываем настройки с анимацией
                currentPanel.classList.add('slide-out-left');
                
                setTimeout(() => {
                    currentPanel.classList.remove('active', 'slide-out-left');
                    currentPanel.style.display = 'none';
                    
                    settingsPanel.style.display = 'block';
                    settingsPanel.classList.add('active');
                    
                    requestAnimationFrame(() => {
                        settingsPanel.classList.add('slide-in-right');
                    });
                    
                    setTimeout(() => {
                        settingsPanel.classList.remove('slide-in-right');
                    }, 500);
                }, 400);
            }
        });

        // Инициализация настроек
        this.initializeSettings();
    }

    initializeSettings() {
        // Загрузка сохраненной темы
        const savedTheme = localStorage.getItem('calculator-theme') || 'purple';
        document.body.className = savedTheme === 'purple' ? '' : `theme-${savedTheme}`;
        document.querySelector(`[data-theme="${savedTheme}"]`)?.classList.add('active');

        // Переключение темы
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                document.body.className = theme === 'purple' ? '' : `theme-${theme}`;
                localStorage.setItem('calculator-theme', theme);
            });
        });

        // Очистка истории
        document.getElementById('clear-history').addEventListener('click', () => {
            this.history = [];
            localStorage.removeItem('calculator-history');
            this.updateHistoryDisplay();
        });

        // Загрузка истории
        this.history = JSON.parse(localStorage.getItem('calculator-history') || '[]');
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const container = document.getElementById('history-container');
        
        if (this.history.length === 0) {
            container.innerHTML = '<p class="history-empty">История пуста</p>';
            return;
        }

        container.innerHTML = this.history.slice(-10).reverse().map(item => 
            `<div class="history-item">${item}</div>`
        ).join('');
    }

    addToHistory(expression, result) {
        const entry = `${expression} = ${result}`;
        this.history.push(entry);
        if (this.history.length > 50) this.history.shift();
        localStorage.setItem('calculator-history', JSON.stringify(this.history));
        this.updateHistoryDisplay();
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
        this.updateDisplay();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        const expression = `${this.previousOperand} ${this.operation} ${this.currentOperand}`;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                computation = prev / current;
                break;
            default:
                return;
        }

        this.addToHistory(expression, computation);
        this.currentOperand = computation.toString();
        this.operation = null;
        this.previousOperand = '';
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.updateDisplay();
    }

    delete() {
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
        this.updateDisplay();
    }

    percent() {
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        this.currentOperand = (current / 100).toString();
        this.updateDisplay();
    }

    scientificFunction(func) {
        const current = parseFloat(this.currentOperand);
        let result;

        switch(func) {
            case 'sin':
                result = Math.sin(current * Math.PI / 180);
                break;
            case 'cos':
                result = Math.cos(current * Math.PI / 180);
                break;
            case 'tan':
                result = Math.tan(current * Math.PI / 180);
                break;
            case 'ln':
                result = Math.log(current);
                break;
            case 'log':
                result = Math.log10(current);
                break;
            case 'sqrt':
                result = Math.sqrt(current);
                break;
            case 'pi':
                this.currentOperand = Math.PI.toString();
                this.updateDisplay();
                return;
            case 'e':
                this.currentOperand = Math.E.toString();
                this.updateDisplay();
                return;
            case 'pow':
                result = Math.pow(current, 2);
                break;
            case 'paren':
                this.appendNumber('(');
                return;
            default:
                return;
        }

        if (!isNaN(result)) {
            this.currentOperand = result.toString();
            this.shouldResetScreen = true;
            this.updateDisplay();
        }
    }

    updateDisplay() {
        this.currentOperandElement.textContent = this.currentOperand;
        if (this.operation != null) {
            this.previousOperandElement.textContent = `${this.previousOperand} ${this.operation}`;
        } else {
            this.previousOperandElement.textContent = '';
        }
    }

    initializeConverter() {
        const converterSelect = document.getElementById('converter-select');
        const fromUnit = document.getElementById('from-unit');
        const toUnit = document.getElementById('to-unit');
        const fromValue = document.getElementById('from-value');
        const toValue = document.getElementById('to-value');

        // Кастомный селект
        const selectSelected = document.querySelector('.select-selected');
        const selectItems = document.querySelector('.select-items');
        const selectItemElements = document.querySelectorAll('.select-item');

        selectSelected.addEventListener('click', () => {
            selectSelected.classList.toggle('active');
            selectItems.classList.toggle('active');
        });

        selectItemElements.forEach(item => {
            item.addEventListener('click', () => {
                const value = item.dataset.value;
                const icon = item.querySelector('.select-item-icon').textContent;
                const text = item.querySelector('.select-item-text').textContent;
                
                selectSelected.querySelector('.select-text').textContent = `${icon} ${text}`;
                
                selectItemElements.forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
                
                converterSelect.value = value;
                converterSelect.dispatchEvent(new Event('change'));
                
                selectSelected.classList.remove('active');
                selectItems.classList.remove('active');
            });
        });

        // Закрытие при клике вне селекта
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-select')) {
                selectSelected.classList.remove('active');
                selectItems.classList.remove('active');
            }
        });

        const units = {
            mass: {
                'кг': 1,
                'г': 0.001,
                'мг': 0.000001,
                'т': 1000,
                'фунт': 0.453592,
                'унция': 0.0283495
            },
            speed: {
                'м/с': 1,
                'км/ч': 0.277778,
                'миль/ч': 0.44704,
                'узел': 0.514444,
                'фут/с': 0.3048
            },
            pressure: {
                'Па': 1,
                'кПа': 1000,
                'МПа': 1000000,
                'бар': 100000,
                'атм': 101325,
                'мм рт.ст.': 133.322,
                'psi': 6894.76
            },
            temperature: {
                '°C': 'celsius',
                '°F': 'fahrenheit',
                'K': 'kelvin'
            },
            length: {
                'м': 1,
                'см': 0.01,
                'мм': 0.001,
                'км': 1000,
                'миля': 1609.34,
                'ярд': 0.9144,
                'фут': 0.3048,
                'дюйм': 0.0254
            },
            volume: {
                'л': 1,
                'мл': 0.001,
                'м³': 1000,
                'галлон': 3.78541,
                'кварта': 0.946353,
                'пинта': 0.473176
            },
            currency: {
                'USD': 1,
                'EUR': 0.92,
                'RUB': 92.5,
                'GBP': 0.79,
                'JPY': 149.5,
                'CNY': 7.24,
                'CHF': 0.88,
                'CAD': 1.36,
                'AUD': 1.53
            },
            time: {
                'сек': 1,
                'мин': 60,
                'час': 3600,
                'день': 86400,
                'неделя': 604800,
                'месяц': 2592000,
                'год': 31536000
            },
            area: {
                'м²': 1,
                'см²': 0.0001,
                'мм²': 0.000001,
                'км²': 1000000,
                'га': 10000,
                'ар': 100,
                'акр': 4046.86,
                'фут²': 0.092903,
                'дюйм²': 0.00064516
            },
            numeral: {
                'DEC': 10,
                'BIN': 2,
                'OCT': 8,
                'HEX': 16
            }
        };

        function updateUnits() {
            const type = converterSelect.value;
            
            // Специальные режимы
            if (type === 'discount' || type === 'bmi') {
                fromUnit.style.display = 'none';
                toUnit.style.display = 'none';
                fromValue.placeholder = type === 'discount' ? 'Цена' : 'Вес (кг)';
                toValue.placeholder = type === 'discount' ? 'Скидка %' : 'Рост (м)';
                toValue.readOnly = false;
                return;
            }
            
            fromUnit.style.display = 'block';
            toUnit.style.display = 'block';
            toValue.readOnly = true;
            fromValue.placeholder = '0';
            toValue.placeholder = '0';
            
            const unitList = Object.keys(units[type]);
            
            fromUnit.innerHTML = '';
            toUnit.innerHTML = '';
            
            unitList.forEach(unit => {
                fromUnit.innerHTML += `<option value="${unit}">${unit}</option>`;
                toUnit.innerHTML += `<option value="${unit}">${unit}</option>`;
            });
            
            if (unitList.length > 1) {
                toUnit.selectedIndex = 1;
            }
            
            convert();
        }

        function convert() {
            const type = converterSelect.value;
            const value = parseFloat(fromValue.value) || 0;

            let result;

            // Специальные калькуляторы
            if (type === 'discount') {
                const discount = parseFloat(toValue.value) || 0;
                result = value - (value * discount / 100);
                toValue.value = result.toFixed(2);
                return;
            }

            if (type === 'bmi') {
                const height = parseFloat(toValue.value) || 1;
                result = value / (height * height);
                let category = '';
                if (result < 18.5) category = ' (Недостаток)';
                else if (result < 25) category = ' (Норма)';
                else if (result < 30) category = ' (Избыток)';
                else category = ' (Ожирение)';
                toValue.value = result.toFixed(2) + category;
                return;
            }

            const from = fromUnit.value;
            const to = toUnit.value;

            if (type === 'temperature') {
                result = convertTemperature(value, from, to);
            } else if (type === 'numeral') {
                result = convertNumeral(value, from, to);
            } else {
                const fromBase = value * units[type][from];
                result = fromBase / units[type][to];
            }

            toValue.value = result.toFixed(6).replace(/\.?0+$/, '');
        }

        function convertTemperature(value, from, to) {
            let celsius;
            
            if (from === '°C') celsius = value;
            else if (from === '°F') celsius = (value - 32) * 5/9;
            else if (from === 'K') celsius = value - 273.15;

            if (to === '°C') return celsius;
            else if (to === '°F') return celsius * 9/5 + 32;
            else if (to === 'K') return celsius + 273.15;
        }

        function convertNumeral(value, from, to) {
            const fromBase = units.numeral[from];
            const toBase = units.numeral[to];
            
            // Конвертируем в десятичную
            let decimal;
            if (fromBase === 10) {
                decimal = parseInt(value);
            } else {
                decimal = parseInt(value.toString(), fromBase);
            }
            
            // Конвертируем из десятичной в целевую
            if (toBase === 10) {
                return decimal;
            } else {
                return decimal.toString(toBase).toUpperCase();
            }
        }

        converterSelect.addEventListener('change', updateUnits);
        fromUnit.addEventListener('change', convert);
        toUnit.addEventListener('change', convert);
        fromValue.addEventListener('input', convert);
        toValue.addEventListener('input', () => {
            const type = converterSelect.value;
            if (type === 'discount' || type === 'bmi') {
                convert();
            }
        });

        updateUnits();
    }
}

const calculator = new Calculator();
