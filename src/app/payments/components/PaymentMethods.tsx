'use client';

import { useState } from 'react';
import { CreditCard, Plus, Trash2, Edit, Shield, AlertCircle, Building2, X } from 'lucide-react';

export default function PaymentMethods() {
  const [creditCards, setCreditCards] = useState([
    {
      id: 1,
      type: 'Visa',
      number: '•••• 4242',
      holder: 'John Doe',
      expires: '12/2027',
      added: '1/15/2024',
      isDefault: true
    }
  ]);

  interface BankAccount {
    id: number;
    bank: string;
    number: string;
    type: string;
    routing: string;
    added: string;
    isDefault: boolean;
    isVerified: boolean;
  }

  interface CreditCard {
    id: number;
    type: string;
    number: string;
    holder: string;
    expires: string;
    added: string;
    isDefault: boolean;
  }

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: 1,
      bank: 'Chase Bank',
      number: '•••• 8901',
      type: 'Checking Account',
      routing: '021000021',
      added: '2/1/2024',
      isDefault: true,
      isVerified: true
    }
  ]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [showEditCardModal, setShowEditCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [bankNameInput, setBankNameInput] = useState('');
  const [cardHolderInput, setCardHolderInput] = useState('');
  
  // Add Payment Method Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMethodType, setAddMethodType] = useState<'credit' | 'bank'>('credit');
  
  // Credit Card Form States
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardMonth, setNewCardMonth] = useState('');
  const [newCardYear, setNewCardYear] = useState('');
  const [newCardCVV, setNewCardCVV] = useState('');
  
  // Bank Account Form States
  const [newBankName, setNewBankName] = useState('');
  const [newAccountType, setNewAccountType] = useState('Checking Account');
  const [newRoutingNumber, setNewRoutingNumber] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');

  const handleDeleteCard = (cardId: number) => {
    setCreditCards(creditCards.filter(card => card.id !== cardId));
  };

  const handleDeleteBankAccount = (accountId: number) => {
    setBankAccounts(bankAccounts.filter(account => account.id !== accountId));
  };

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount(account);
    setBankNameInput(account.bank);
    setShowEditModal(true);
  };

  const handleEditCard = (card: CreditCard) => {
    setEditingCard(card);
    setCardHolderInput(card.holder);
    setShowEditCardModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingAccount(null);
    setBankNameInput('');
  };

  const handleCloseCardModal = () => {
    setShowEditCardModal(false);
    setEditingCard(null);
    setCardHolderInput('');
  };

  const handleUpdateAccount = () => {
    if (editingAccount) {
      setBankAccounts(prev => 
        prev.map(account => 
          account.id === editingAccount.id 
            ? { ...account, bank: bankNameInput }
            : account
        )
      );
    }
    handleCloseModal();
  };

  const handleUpdateCard = () => {
    if (editingCard) {
      setCreditCards(prev => 
        prev.map(card => 
          card.id === editingCard.id 
            ? { ...card, holder: cardHolderInput }
            : card
        )
      );
    }
    handleCloseCardModal();
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setAddMethodType('credit');
    resetAddFormInputs();
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    resetAddFormInputs();
  };

  const resetAddFormInputs = () => {
    setNewCardHolder('');
    setNewCardNumber('');
    setNewCardMonth('');
    setNewCardYear('');
    setNewCardCVV('');
    setNewBankName('');
    setNewAccountType('Checking Account');
    setNewRoutingNumber('');
    setNewAccountNumber('');
  };

  const handleAddCreditCard = () => {
    const newCard: CreditCard = {
      id: Date.now(),
      type: 'Visa', // Could be determined from card number
      number: `•••• ${newCardNumber.slice(-4)}`,
      holder: newCardHolder,
      expires: `${newCardMonth}/${newCardYear}`,
      added: new Date().toLocaleDateString(),
      isDefault: creditCards.length === 0
    };
    setCreditCards(prev => [...prev, newCard]);
    handleCloseAddModal();
  };

  const handleAddBankAccount = () => {
    const newAccount: BankAccount = {
      id: Date.now(),
      bank: newBankName,
      number: `•••• ${newAccountNumber.slice(-4)}`,
      type: newAccountType,
      routing: newRoutingNumber,
      added: new Date().toLocaleDateString(),
      isDefault: bankAccounts.length === 0,
      isVerified: false
    };
    setBankAccounts(prev => [...prev, newAccount]);
    handleCloseAddModal();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900">Payment Methods</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">Manage your credit cards and bank accounts</p>
          </div>
          <button 
            onClick={handleOpenAddModal}
            className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm md:text-base font-medium"
          >
            <Plus size={16} />
            Add Payment Method
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={20} className="text-gray-700" />
            <h2 className="text-lg font-medium text-gray-900">Credit Cards</h2>
          </div>

          {creditCards.length > 0 ? (
            <div className="space-y-3">
              {creditCards.map((card) => (
                <div key={card.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <CreditCard size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm md:text-base font-medium text-gray-900">
                          {card.type} {card.number}
                        </span>
                        {card.isDefault && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-gray-600">
                        {card.holder} • Expires {card.expires} • Added {card.added}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEditCard(card)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#FF6B35]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard size={24} className="text-[#FF6B35]" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No credit cards added</h3>
              <p className="text-sm md:text-base text-gray-600 mb-6">Add a credit card to start receiving funds</p>
              
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={20} className="text-gray-700" />
            <h2 className="text-lg font-medium text-gray-900">Bank Accounts</h2>
          </div>

          {bankAccounts.length > 0 ? (
            <div className="space-y-3">
              {bankAccounts.map((account) => (
                <div key={account.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-green-100 rounded flex items-center justify-center">
                      <Building2 size={20} className="text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm md:text-base font-medium text-gray-900">
                          {account.bank} {account.number}
                        </span>
                        {account.isDefault && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                        {account.isVerified && (
                          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full flex items-center gap-1">
                            <Shield size={12} />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-gray-600">
                        {account.type} • Routing: {account.routing} • Added {account.added}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEditAccount(account)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteBankAccount(account.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#FF6B35]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 size={24} className="text-[#FF6B35]" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bank accounts added</h3>
              <p className="text-sm md:text-base text-gray-600 mb-6">Add a bank account to start receiving withdrawals</p>
              
            </div>
          )}
        </div>
        <div className="bg-[#FF6B35]/10 border border-[#FF6B35] rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield size={20} className="text-[#FF6B35] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm md:text-base font-medium text-[#FF6B35] mb-1">
                Your Payment Information is Secure
              </h3>
              <p className="text-xs md:text-sm text-[#FF6B35]">
                We use industry-standard encryption and security measures to protect your financial information. 
                Your payment details are never stored on our servers and are processed securely through our 
                certified payment partners.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Bank Account Modal */}
      {showEditModal && editingAccount && (
        <div className="fixed inset-0 bg-[#FF6B35]/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-[#FF6B35]">Edit Bank Account</h2>
                  <p className="text-sm md:text-base text-gray-600 mt-1">Update the details of your bank account.</p>
                </div>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-900 mb-2">Account Information</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {editingAccount.type} {editingAccount.number}
                </p>
              </div>

              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    id="bankName"
                    value={bankNameInput}
                    onChange={(e) => setBankNameInput(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                  />
                  <label
                    htmlFor="bankName"
                    className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-[#FF6B35]"
                  >
                    Bank Name
                  </label>
                </div>
              </div>

              <div className="bg-[#FF6B35]/10 border border-[#FF6B35] rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-[#FF6B35] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#FF6B35]">
                    Account and routing numbers cannot be changed for security reasons.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button 
                  onClick={handleCloseModal}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateAccount}
                  className="px-6 py-2 text-white bg-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/90"
                >
                  Update Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Credit Card Modal */}
      {showEditCardModal && editingCard && (
        <div className="fixed inset-0 bg-[#FF6B35]/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-[#FF6B35]">Edit Credit Card</h2>
                  <p className="text-sm md:text-base text-gray-600 mt-1">Update the details of your credit card.</p>
                </div>
                <button 
                  onClick={handleCloseCardModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-900 mb-2">Card Information</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {editingCard.type} {editingCard.number}
                </p>
              </div>

              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    id="cardHolder"
                    value={cardHolderInput}
                    onChange={(e) => setCardHolderInput(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                  />
                  <label
                    htmlFor="cardHolder"
                    className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-[#FF6B35]"
                  >
                    Card Holder Name
                  </label>
                </div>
              </div>

              <div className="bg-[#FF6B35]/10 border border-[#FF6B35] rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-[#FF6B35] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#FF6B35]">
                    Card numbers and expiration dates cannot be changed for security reasons.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button 
                  onClick={handleCloseCardModal}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateCard}
                  className="px-6 py-2 text-white bg-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/90"
                >
                  Update Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#FF6B35]/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-[#FF6B35]">Add Payment Method</h2>
                  <p className="text-sm md:text-base text-gray-600 mt-1">Add a credit card or bank account for payments and withdrawals.</p>
                </div>
                <button 
                  onClick={handleCloseAddModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setAddMethodType('credit')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    addMethodType === 'credit'
                      ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard size={20} />
                  <span className="font-medium">Credit Card</span>
                </button>
                <button
                  onClick={() => setAddMethodType('bank')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    addMethodType === 'bank'
                      ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Building2 size={20} />
                  <span className="font-medium">Bank Account</span>
                </button>
              </div>

              {addMethodType === 'credit' && (
                <div className="space-y-6">
                  <div className="relative">
                    <input
                      type="text"
                      id="newCardHolder"
                      value={newCardHolder}
                      onChange={(e) => setNewCardHolder(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                    />
                    <label
                      htmlFor="newCardHolder"
                      className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-[#FF6B35]"
                    >
                      Cardholder Name
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      id="newCardNumber"
                      value={newCardNumber}
                      onChange={(e) => setNewCardNumber(e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim())}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                      maxLength={19}
                    />
                    <label
                      htmlFor="newCardNumber"
                      className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-[#FF6B35]"
                    >
                      Card Number
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="relative">
                      <select
                        id="newCardMonth"
                        value={newCardMonth}
                        onChange={(e) => setNewCardMonth(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] appearance-none bg-white"
                      >
                        <option value="">MM</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                            {String(i + 1).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <label
                        htmlFor="newCardMonth"
                        className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-[#FF6B35]"
                      >
                        Month
                      </label>
                    </div>

                    <div className="relative">
                      <select
                        id="newCardYear"
                        value={newCardYear}
                        onChange={(e) => setNewCardYear(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] appearance-none bg-white"
                      >
                        <option value="">YYYY</option>
                        {Array.from({ length: 10 }, (_, i) => (
                          <option key={i} value={2024 + i}>
                            {2024 + i}
                          </option>
                        ))}
                      </select>
                      <label
                        htmlFor="newCardYear"
                        className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-[#FF6B35]"
                      >
                        Year
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        id="newCardCVV"
                        value={newCardCVV}
                        onChange={(e) => setNewCardCVV(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                        maxLength={4}
                      />
                      <label
                        htmlFor="newCardCVV"
                        className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-[#FF6B35]"
                      >
                        CVV
                      </label>
                    </div>
                  </div>

                  <div className="bg-[#FF6B35]/10 border border-[#FF6B35] rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield size={20} className="text-[#FF6B35] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-[#FF6B35]">
                        Your card information is securely encrypted and stored.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button 
                      onClick={handleCloseAddModal}
                      className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleAddCreditCard}
                      className="px-6 py-2 text-white bg-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/90"
                    >
                      Add Card
                    </button>
                  </div>
                </div>
              )}

              {addMethodType === 'bank' && (
                <div className="space-y-6">
                  <div className="relative">
                    <input
                      type="text"
                      id="newBankName"
                      value={newBankName}
                      onChange={(e) => setNewBankName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                    />
                    <label
                      htmlFor="newBankName"
                      className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-[#FF6B35]"
                    >
                      Bank Name
                    </label>
                  </div>

                  <div className="relative">
                    <select
                      id="newAccountType"
                      value={newAccountType}
                      onChange={(e) => setNewAccountType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] appearance-none bg-white"
                    >
                      <option value="Checking Account">Checking Account</option>
                      <option value="Savings Account">Savings Account</option>
                    </select>
                    <label
                      htmlFor="newAccountType"
                      className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-[#FF6B35]"
                    >
                      Account Type
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      id="newRoutingNumber"
                      value={newRoutingNumber}
                      onChange={(e) => setNewRoutingNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                      maxLength={9}
                    />
                    <label
                      htmlFor="newRoutingNumber"
                      className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-[#FF6B35]"
                    >
                      Routing Number
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      id="newAccountNumber"
                      value={newAccountNumber}
                      onChange={(e) => setNewAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 17))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                      maxLength={17}
                    />
                    <label
                      htmlFor="newAccountNumber"
                      className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-[#FF6B35]"
                    >
                      Account Number
                    </label>
                  </div>

                  <div className="bg-[#FF6B35]/10 border border-[#FF6B35] rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={20} className="text-[#FF6B35] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-[#FF6B35]">
                        Bank accounts require verification before they can be used for withdrawals.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button 
                      onClick={handleCloseAddModal}
                      className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleAddBankAccount}
                      className="px-6 py-2 text-white bg-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/90"
                    >
                      Add Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}