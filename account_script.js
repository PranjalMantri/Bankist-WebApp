"use strict";

/////////////////////////////////////////////////
// BANKIST APP
// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// Data
// const account1 = {
//   owner: "Pranjal Mantri",
//   movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
//   interestRate: 1.2, // %
//   pin: 1234,
// };

// const account2 = {
//   owner: "Jessica Davis",
//   movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
//   interestRate: 1.5,
//   pin: 2222,
// };

// const account3 = {
//   owner: "Steven Thomas Williams",
//   movements: [200, -200, 340, -300, -20, 50, 400, -460],
//   interestRate: 0.7,
//   pin: 3333,
// };

// const account4 = {
//   owner: "Sarah Smith",
//   movements: [430, 1000, 700, 50, 90],
//   interestRate: 1,
//   pin: 4444,
// };

// const accounts = [account1, account2, account3, account4];

const account1 = {
  owner: "Pranjal Mantri",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2023-12-28T09:15:04.904Z",
    "2023-12-01T10:17:24.185Z",
    "2023-05-08T14:11:59.604Z",
    "2023-05-27T17:01:17.194Z",
    "2022-07-11T23:36:17.929Z",
    "2020-07-12T10:51:36.790Z",
    "2023-12-29T21:31:17.178Z",
    "2023-12-23T07:42:02.383Z",
  ],
  currency: "INR",
  locale: "en-IN",
};

const account2 = {
  owner: "Elon Musk",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

const currencies = new Map([
  ["USD", "United States dollar"],
  ["EUR", "Euro"],
  ["GBP", "Pound sterling"],
]);

/////////////////////////////////////////////////

let currentAccount;
let timer;
let sorted = false;

// Creating usernames for each users
createUsername(accounts);

// Calculate total deposists
function calcIncome(movements) {
  const income = movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov);

  return formatCurrency(income, currentAccount.locale, currentAccount.currency);
}

// Calculate totals withdrawls
function calcOutgoing(movements) {
  const outgoing = movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov);

  return formatCurrency(
    Math.abs(outgoing),
    currentAccount.locale,
    currentAccount.currency
  );
}

// Calculate the interest on deposits
function calcInterest(acc) {
  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((mov) => (mov * acc.interestRate) / 100)
    .filter((interest) => interest >= 1)
    .reduce((acc, int) => acc + int);

  return formatCurrency(
    interest,
    currentAccount.locale,
    currentAccount.currency
  );
}

// Creating usernames
function createUsername(accs) {
  accounts.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
}

function displayBalance(acc) {
  acc.balance = acc.movements.reduce(function (acc, mov) {
    return acc + mov;
  });

  labelBalance.textContent = formatCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  );
}

function formatMovementDate(date, locale) {
  function calcDaysPassed(date1, date2) {
    return Math.floor(Math.abs((date1 - date2) / (24 * 60 * 60 * 1000)));
  }

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed == 0) return "TODAY";
  if (daysPassed == 1) return "YESTERDAY";
  if (daysPassed <= 7) return `${daysPassed} DAYS AGO`;

  return Intl.DateTimeFormat(locale).format(date);
}

function formatCurrency(value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
}

function displayMovements(acc, sort = false) {
  containerMovements.innerHTML = "";

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCurrency(mov, acc.locale, acc.currency);

    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type.toUpperCase()}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedMov}</div>
        </div>`;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
}

// Calling all sumamary related functions
function displaySummary(acc) {
  const income = calcIncome(acc.movements);
  labelSumIn.textContent = `${income}`;

  const outgoing = calcOutgoing(acc.movements);
  labelSumOut.textContent = `${outgoing}`;

  const interest = calcInterest(acc);
  labelSumInterest.textContent = `${interest}`;
}

function updateUI(acc) {
  displayMovements(acc);
  displayBalance(acc);
  displaySummary(acc);
}

function logoutTimer() {
  const tick = function () {
    const min = `${Math.trunc(time / 60)}`.padStart(2, "0");
    const seconds = `${Math.trunc(time % 60)}`.padStart(2, "0");

    labelTimer.textContent = `${min}:${seconds}`;

    if (time == 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = "Log in to get started";
    }

    time--;
  };
  let time = 60 * 5;

  tick();
  timer = setInterval(tick, 1000);

  return timer;
}

function login() {
  // Checking if user exists
  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value.trim()
  );

  // Verifying password
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;

    // Displaying content
    setInterval(function () {
      const now = new Date();

      const options = {
        hour: "numeric",
        minute: "numeric",
        day: "numeric",
        month: "numeric",
        year: "numeric",
      };

      labelDate.textContent = new Intl.DateTimeFormat(
        currentAccount.locale,
        options
      ).format(now);
    }),
      30000;

    containerApp.style.opacity = 100;
    updateUI(currentAccount);
  } else {
    labelWelcome.textContent = "Invalid Login Credentials";
  }

  if (timer) {
    clearInterval(timer);
    timer = logoutTimer();
  } else {
    timer = logoutTimer();
  }
  // Clearing fields
  inputLoginUsername.value = inputLoginPin.value = "";
  inputLoginPin.blur();
}

function transfer() {
  const amount = Number(inputTransferAmount.value);
  const reciveerAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );

  // Clearing fields
  inputTransferAmount.value = inputTransferTo.value = "";
  inputTransferAmount.blur();

  if (
    amount > 0 &&
    reciveerAcc &&
    currentAccount.balance >= amount &&
    reciveerAcc?.username !== currentAccount.username
  ) {
    // Transfering Money
    currentAccount.movements.push(-amount);
    reciveerAcc.movements.push(amount);

    currentAccount.movementsDates.push(new Date());
    reciveerAcc.movementsDates.push(new Date());
    // Updating UI
    updateUI(currentAccount);
  } else {
    console.log("Cannot Transfer money");
  }
}

function loan() {
  const amount = Math.floor(inputLoanAmount.value);
  // Checking whether user is elligible for loan

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    // Add movement
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
    }, 4000);
  }

  inputLoanAmount.value = "";
  inputLoanAmount.blur();
}

function closeAccount() {
  // Verifying credentials
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    // Finding the user and removing them from data
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);

    // Reverting view to the start
    containerApp.style.opacity = 0;

    labelWelcome.textContent = "Log in to get started";
  } else {
    labelWelcome.textContent = "Invalid Credentials";
  }

  // Clearing fields
  inputClosePin.value = inputCloseUsername.value = "";
  inputClosePin.blur();
}

btnLogin.addEventListener("click", function (e) {
  e.preventDefault();
  login();
});

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  transfer();
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  loan();
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();
  closeAccount();
});

btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  sorted = !sorted;
  displayMovements(currentAccount, sorted);
});
