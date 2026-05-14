let display = document.getElementById('display');

function appendNumber(num) {
    display.value += num;
}

function appendOperator(op) {
    // Prevent multiple operators in a row
    const lastChar = display.value[display.value.length - 1];
    if (lastChar === '+' || lastChar === '-' || lastChar === '*' || lastChar === '/') {
        return;
    }
    
    // Prevent decimal point duplication
    if (op === '.' && display.value.includes('.')) {
        return;
    }
    
    display.value += op;
}

function clearDisplay() {
    display.value = '';
}

function deleteLast() {
    display.value = display.value.slice(0, -1);
}

function calculate() {
    try {
        // Replace × with * for calculation
        let expression = display.value.replace(/×/g, '*');
        
        // Prevent empty calculations
        if (expression === '') {
            return;
        }
        
        // Evaluate the expression
        let result = eval(expression);
        
        // Handle floating point precision
        result = Math.round(result * 100000000) / 100000000;
        
        display.value = result;
    } catch (error) {
        display.value = 'Error';
        setTimeout(() => {
            display.value = '';
        }, 1500);
    }
}

// Allow keyboard input
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
        appendNumber(e.key);
    } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        e.preventDefault();
        appendOperator(e.key);
    } else if (e.key === '.') {
        e.preventDefault();
        appendOperator('.');
    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculate();
    } else if (e.key === 'Backspace') {
        e.preventDefault();
        deleteLast();
    } else if (e.key === 'Escape') {
        e.preventDefault();
        clearDisplay();
    }
});
