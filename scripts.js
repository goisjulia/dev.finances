
const modal = {
    open() {
        document.querySelector('.modal-overlay').classList.add('active');
    },

    close() {
        document.querySelector('.modal-overlay').classList.remove('active');

    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || [];
    },
    set(transactions) {
        localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions));
    }
}

const transaction = {
    all: Storage.get(),

    // {
    //     description: 'Luz',
    //     amount: -50000,
    //     date: '23/01/2021'
    // },
    // {
    //     description: 'Website',
    //     amount: 500000,
    //     date: '23/01/2021'
    // },
    // {
    //     description: 'Internet',
    //     amount: -20000,
    //     date: '23/01/2021'
    // },
    // {
    //     description: 'App',
    //     amount: 200000,
    //     date: '23/01/2021'
    // },

    add(transaction) {
        this.all.push(transaction);
        App.reload();
    },

    remove(index) {
        this.all.splice(index, 1);
        App.reload();
    },

    incomes() {
        let income = 0;

        this.all.forEach(transaction => {
            income += transaction.amount > 0 ? transaction.amount : 0;
        })

        return income;
    },

    expenses() {
        let expense = 0;

        this.all.forEach(transaction => {
            expense += transaction.amount < 0 ? transaction.amount : 0;
        })

        return expense;
    },

    total() {
        let total = 0;

        this.all.forEach(transaction => {
            total += transaction.amount;
        })

        return this.incomes() + this.expenses();
    }
}

const DOM = {
    transactionContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = this.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;
        this.transactionContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) {
        const CSSClass = transaction.amount > 0 ? 'income' : 'expense';
        const amount = Utils.formatCurrency(transaction.amount)
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSClass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td> <img src="./assets/minus.svg" alt="Remover transação" onclick="transaction.remove(${index})" /></td>
        `;
        return html;
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(transaction.total());
    },

    clearTransactions() {
        DOM.transactionContainer.innerHTML = '';
    }
}

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : '';

        value = String(value).replace(/\D/g, '');
        value = Number(value) / 100;
        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });

        return signal + value;
    },

    formatAmount(value) {
        value = Number(value) * 100;
        return value;
    },

    formatDate(value) {
        const splittedDate = value.split('-');
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value,
        }
    },

    validateFields() {
        const { description, amount, date } = this.getValues();

        if (description.trim() === '' ||
            amount.trim() === '' ||
            date.trim() === ''
        ) {
            throw new Error("Por favor, preencha todos os campos!")
        }
    },

    formatValues() {
        let { description, amount, date } = this.getValues();
        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        this.description.value = '';
        this.amount.value = '';
        this.date.value = '';
    },

    submit(event) {
        event.preventDefault();

        try {
            this.validateFields();
            const newTransaction = this.formatValues();
            transaction.add(newTransaction);
            this.clearFields();
            modal.close();

        } catch (error) {
            alert(error.message);
        }

    }
}

const App = {
    init() {
        DOM.updateBalance();

        transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        });

        Storage.set(transaction.all);
    },

    reload() {
        DOM.clearTransactions();
        this.init();
    }
}

App.init();
