import { TransactionType } from '../types';

export const SENT_TRANSACTION_TYPES: TransactionType[] = [
    'sent', 
    'out', 
    'mobile_recharge', 
    'bill_payment', 
    'withdraw', 
    'order_placed', 
    'loan_repayment', 
    'investment_buy', 
    'staking_deposit', 
    'booking_payment', 
    'service', 
    'savings_deposit', 
    'exchange', 
    'govt_fee',
    'train_ticket',
    'bus_ticket'
];

export const isSentTransaction = (type: TransactionType): boolean => SENT_TRANSACTION_TYPES.includes(type);