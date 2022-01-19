'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const account5 = {
  owner: 'Mohamad Hanafi',
  movements: [
    5000, 3400, -150, -790, -3210, -1000, 8500, -30, 600, -300, 1234, 432, 345,
    -635, -1000,
  ],
  interestRate: 1.5,
  pin: 5555,
};

const accounts = [account1, account2, account3, account4, account5];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//global variables
let currentAccount;
let timeToLogout;
let timer;
let sort = false;

// App
main();

// Functions
function main() {
  // dynamically creat username and calculate balance for each account
  accounts.forEach(account => {
    account.username = createUsername(account.owner);
    account.balance = calcBalance(account.movements);
  });
  updateCurrentDate();
}

function updateCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toLocaleString('en-us', {
    minimumIntegerDigits: 2,
  });
  const day = now.getDate().toLocaleString('en-us', {
    minimumIntegerDigits: 2,
  });
  const currentDate = `${day}/${month}/${year}`;

  labelDate.textContent = currentDate;
}

function login() {
  //display ui and a welcome message
  labelWelcome.textContent = `Welcome back, ${
    currentAccount.owner.split(' ')[0]
  }`;
  containerApp.style.opacity = 1;
  // display movements
  displayMovements(currentAccount?.movements);
  //display balance
  displayBalance(currentAccount);
  //display summary
  calculateAndPrintAssets(currentAccount);
  //rest timer
  if (timer) clearInterval(timer);
  //start timer
  timeToLogout = 10 * 60; // global variable
  timer = startLogoutTimer();
}

function logout() {
  labelWelcome.textContent = 'Login to get started';
  currentAccount = null;
  containerApp.style.opacity = 0;
}

function calcBalance(movements) {
  return movements.reduce((acc, movement) => acc + movement, 0);
}

function displayBalance(acc) {
  labelBalance.textContent = `${acc.balance} EUR`;
}

function createUsername(user) {
  return user
    .toLowerCase()
    .split(' ')
    .map(name => {
      return name.at(0);
    })
    .join('');
}

function displayMovements(movements) {
  // reset the movementContainers
  containerMovements.innerHTML = '';

  movements.forEach((move, index) => {
    const type = move > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      index + 1
    } ${type}</div>
        <div class="movements__value">${move.toFixed(2)}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
}

function calculateAndPrintAssets({ movements, interestRate }) {
  const totalDeposit = movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumIn.textContent = `${totalDeposit.toFixed(2)}€`;

  const totalWithdrawal = movements
    .filter(mov => mov < 0)
    .map(mov => -mov)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumOut.textContent = `${totalWithdrawal.toFixed(2)}€`;

  const interest = movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * interestRate) / 100)
    .reduce((acc, deposit) => acc + deposit, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
}

function startLogoutTimer() {
  //using global variable: timeToLogout

  const timer = setInterval(() => {
    const min = String(Math.trunc(timeToLogout / 60)).padStart(2, 0);
    const sec = String(timeToLogout % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    if (timeToLogout === 0) {
      logout();
      clearInterval(timer);
    }
    timeToLogout--;
  }, 1000);

  return timer;
}

// event listener

//global variable: let currentAccount

btnLogin.addEventListener('click', e => {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    login();
    //empty the form
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
  } else {
    window.alert('wrong credentials');
  }
});

btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  const currentBalance = currentAccount.balance;
  const transferTo = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  const transferAmount = +inputTransferAmount.value;

  if (!transferTo) {
    window.alert('user you want to transfer to not found');
    return;
  }

  if (!transferAmount) {
    window.alert('please specify an amount');
    return;
  }

  if (transferAmount > currentBalance) {
    window.alert('No enough balance');
    return;
  }

  currentAccount.movements.push(-transferAmount);
  transferTo.movements.push(transferAmount);

  displayMovements(currentAccount?.movements);
  displayBalance(currentAccount);
  calculateAndPrintAssets(currentAccount);

  inputTransferTo.value = '';
  inputTransferAmount.value = '';

  window.alert('success');
});

btnClose.addEventListener('click', e => {
  const user = inputCloseUsername.value;
  const pin = +inputClosePin.value;
  const { username: currentUser, pin: currentUserPin } = currentAccount;

  e.preventDefault();

  if (currentUser !== user || currentUserPin !== pin) {
    alert('wrong credentials');
    return;
  }

  const index = accounts.findIndex(acc => acc.username === user);

  accounts.splice(index, 1);
  logout();

  inputCloseUsername.value = '';
  inputClosePin.value = '';
});

btnLoan.addEventListener('click', e => {
  e.preventDefault();
  const loanAmount = Math.floor(inputLoanAmount.value);
  const valid = currentAccount.movements.some(move => move >= loanAmount * 0.1);
  console.log(valid);
  if (loanAmount > 0 && valid) {
    currentAccount.movements.push(loanAmount);
  } else {
    window.alert('error');
  }
  inputLoanAmount.value = '';
  displayMovements(currentAccount?.movements);
  displayBalance(currentAccount);
  calculateAndPrintAssets(currentAccount);
});

btnSort.addEventListener('click', e => {
  // using global variable: sort
  e.preventDefault();
  sort = !sort;
  if (sort) {
    let sorted = currentAccount.movements.slice().sort((a, b) => a - b);
    displayMovements(sorted);
  } else {
    displayMovements(currentAccount.movements);
  }
});
