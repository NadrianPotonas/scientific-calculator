let history = [];

// Appends the given value to the display screen
function appendToDisplay(value) {
    const display = document.getElementById('display');
    let cursorPos = display.selectionStart;
    let currentText = display.value;

    // Insert the value at the cursor position
    let newText = currentText.slice(0, cursorPos) + value + currentText.slice(cursorPos);
    display.value = newText;

    // Move the cursor after the inserted value
    display.setSelectionRange(cursorPos + value.length, cursorPos + value.length);
    display.focus();
}

// Clears the display screen
function clearDisplay() {
    document.getElementById('display').value = '';
}

// Handles backspace (deletes the character before the cursor)
function backDisplay() {
    const display = document.getElementById('display');
    let cursorPos = display.selectionStart;

    if (cursorPos > 0) {
        let currentText = display.value;
        let newText = currentText.slice(0, cursorPos - 1) + currentText.slice(cursorPos);
        display.value = newText;
        display.setSelectionRange(cursorPos - 1, cursorPos - 1);
        display.focus();
    }
}

// Calculates the expression and shows the result
function calculate() {
    let expression = document.getElementById('display').value;

    try {
        // Validate the expression to avoid errors
        if (!isValidExpression(expression)) {
            throw new Error('Invalid Expression');
        }

        let result = evaluateExpression(expression);

        // Handle math errors like division by zero
        if (result === Infinity || result === -Infinity || isNaN(result)) {
            document.getElementById('display').value = 'Math Error';
        } else {
            result = roundToEightDecimalPlaces(result);
            document.getElementById('display').value = result;
            addToHistory(expression, result); // Store the result in history
        }
    } catch (e) {
        console.error('Calculation error:', e);
        document.getElementById('display').value = 'Syntax Error';
    }
}

// Validates the expression to ensure it's safe
function isValidExpression(expression) {
    const allowedChars = /^[0-9+\-*/^().πsin⁻¹cos⁻¹tan⁻¹√logln! ]*$/;
    return allowedChars.test(expression); // Allow only valid characters
}

// Evaluates the mathematical expression securely by converting operators and functions
function evaluateExpression(expression) {
    expression = expression.replace(/x/g, '*')
        .replace(/X/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**')
        .replace(/√/g, 'Math.sqrt')
        .replace(/π/g, 'Math.PI');
    
    expression = handleLogFunctions(expression);
    expression = handleTrigFunctions(expression);
    expression = handleFactorialExpression(expression);

    return parseMathExpression(expression);
}

// Handles logarithms (log and ln)
function handleLogFunctions(expression) {
    expression = expression.replace(/log\(/g, 'Math.log10(');
    expression = expression.replace(/ln\(/g, 'Math.log(');
    return expression;
}

// Handles trigonometric and inverse trigonometric functions in the expression
function handleTrigFunctions(expression) {
    expression = expression.replace(/(sin|cos|tan)\(([^)]+)\)/g, function (match, func, args) {
        if (!args || isNaN(args)) {
            console.error(`Invalid argument for function ${func}: ${args}`);
            return match;
        }
        args = convertToRadians(args);
        return 'Math.' + func + '(' + args + ')';
    });

    expression = expression.replace(/(sin⁻¹|cos⁻¹|tan⁻¹)\(([^)]+)\)/g, function (match, func, args) {
        if (!args || isNaN(args)) {
            console.error(`Invalid argument for function ${func}: ${args}`);
            return match;
        }

        if (func === 'sin⁻¹') {
            func = 'asin';
        } else if (func === 'cos⁻¹') {
            func = 'acos';
        } else if (func === 'tan⁻¹') {
            func = 'atan';
        }

        return 'Math.' + func + '(' + args + ') * (180 / Math.PI)';
    });

    return expression;
}

// Helper to convert degrees to radians
function convertToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Handles the calculation of factorials
function handleFactorialExpression(expression) {
    if (expression.includes('!')) {
        const factorialMatch = expression.match(/(\d+)!/);
        if (factorialMatch) {
            let num = parseInt(factorialMatch[1], 10);
            if (num >= 0) {
                let fact = factorial(num);
                expression = expression.replace(factorialMatch[0], fact.toString());
            }
        }
    }
    return expression;
}

// Calculates the factorial of a number
function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// Manually parses and evaluates the mathematical expression
function parseMathExpression(expression) {
    try {
        return Function('return ' + expression)();
    } catch (e) {
        throw new Error('Invalid expression format');
    }
}

// Rounds results to 8 decimal places
function roundToEightDecimalPlaces(value) {
    return Math.round(value * 100000000) / 100000000;
}

// Adds the calculation to the history
function addToHistory(expression, result) {
    history.push({ expression, result });
    updateHistoryUI();
}

// Updates the history UI in the side menu
function updateHistoryUI() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    history.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.expression} = ${item.result}`;
        li.onclick = () => {
            document.getElementById('display').value = item.expression;
        };
        historyList.appendChild(li);
    });
}

// Function to toggle the side menu
function toggleMenu() {
    const sideMenu = document.getElementById('side-menu');
    sideMenu.classList.toggle('open');
    const historySection = document.getElementById('history-section');
    historySection.style.display = 'none';
}

// Function to toggle dark mode
function toggleDarkMode() {
    const body = document.body;
    const calculatorContainer = document.querySelector('.calculator-container');
    const display = document.getElementById('display');
    const buttonContainer = document.querySelector('.button-container');
    const buttons = document.querySelectorAll('.button');
    const sideMenu = document.getElementById('side-menu');

    body.classList.toggle('dark-mode');
    calculatorContainer.classList.toggle('dark-mode');
    display.classList.toggle('dark-mode');
    buttonContainer.classList.toggle('dark-mode');
    sideMenu.classList.toggle('dark-mode');
    
    buttons.forEach(button => {
        button.classList.toggle('dark-mode');
    });

    const toggleButton = document.getElementById('dark-mode-toggle');
    toggleButton.textContent = body.classList.contains('dark-mode') ? '🌞' : '🌙';
}

// Function to toggle history display in the side menu
function toggleHistory() {
    const historySection = document.getElementById('history-section');
    historySection.style.display = historySection.style.display === 'block' ? 'none' : 'block';
}

