-- 💸 SQL Database Schema for Personal Expense and Savings Management

-- 1. ACCOUNTS TABLE
-- Tracks all financial accounts (Checking, Savings, Credit Card, Cash, etc.)
CREATE TABLE Accounts (
    AccountID INTEGER PRIMARY KEY,
    AccountName VARCHAR(255) NOT NULL,
    AccountType VARCHAR(50) NOT NULL, -- e.g., 'Checking', 'Savings', 'Credit Card', 'Cash'
    CurrentBalance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE
);

---

-- 2. CATEGORIES TABLE
-- Defines classifications for all income and expenses
CREATE TABLE Categories (
    CategoryID INTEGER PRIMARY KEY,
    CategoryName VARCHAR(255) NOT NULL UNIQUE,
    CategoryType VARCHAR(50) NOT NULL -- 'Income' or 'Expense'
);

---

-- 3. TRANSACTIONS TABLE
-- The central table for every financial event (Expenses, Income, Transfers)
CREATE TABLE Transactions (
    TransactionID INTEGER PRIMARY KEY,
    TransactionDate DATETIME NOT NULL,
    AccountID INTEGER NOT NULL,
    CategoryID INTEGER NOT NULL,
    Amount DECIMAL(10, 2) NOT NULL,
    TransactionType VARCHAR(50) NOT NULL, -- 'Expense', 'Income', 'Transfer'
    Description VARCHAR(255),
    Notes TEXT,
    FOREIGN KEY (AccountID) REFERENCES Accounts(AccountID),
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);

---

-- 4. TRANSFERS TABLE
-- Specifically tracks movements between your own accounts, separate from income/expense
CREATE TABLE Transfers (
    TransferID INTEGER PRIMARY KEY,
    TransferDate DATETIME NOT NULL,
    FromAccountID INTEGER NOT NULL,
    ToAccountID INTEGER NOT NULL,
    TransferAmount DECIMAL(10, 2) NOT NULL,
    TransactionID INTEGER, -- Link to the entry in the Transactions table
    FOREIGN KEY (FromAccountID) REFERENCES Accounts(AccountID),
    FOREIGN KEY (ToAccountID) REFERENCES Accounts(AccountID),
    FOREIGN KEY (TransactionID) REFERENCES Transactions(TransactionID)
);

---

-- 5. SAVINGSGOALS TABLE
-- Tracks progress toward specific savings targets
CREATE TABLE SavingsGoals (
    GoalID INTEGER PRIMARY KEY,
    GoalName VARCHAR(255) NOT NULL,
    TargetAmount DECIMAL(10, 2) NOT NULL,
    CurrentAmount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    TargetDate DATE,
    AccountID INTEGER, -- The dedicated account (optional, but helpful)
    IsAchieved BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (AccountID) REFERENCES Accounts(AccountID)
);
