import React from 'react';
import type { TransactionType } from '../types';
import { 
    ArrowDownLeft, ArrowUpRight, Cog, Receipt, Globe, Briefcase, PlusCircleIcon, ArrowsRightLeftIcon,
    PiggyBank, BarChart2, HandCoins, GiftIcon, Trophy, UsersIcon, Lock, ShoppingBagIcon, DevicePhoneMobileIcon, BedDouble, ArrowUpFromLine, ArrowDownToLine, BookUserIcon, TrainFront, Bus
} from './icons';

export const TransactionIcon: React.FC<{ type: TransactionType }> = ({ type }) => {
    const iconMap: { [key in TransactionType]?: { Icon: React.FC<{ size?: number; className: string; }>; color: string; bg: string; } } = {
        sent: { Icon: ArrowUpRight, color: "text-red-500", bg: 'bg-red-500/10' },
        received: { Icon: ArrowDownLeft, color: "text-primary", bg: 'bg-primary/10' },
        in: { Icon: ArrowDownLeft, color: "text-primary", bg: 'bg-primary/10' },
        out: { Icon: ArrowUpRight, color: "text-red-500", bg: 'bg-red-500/10' },
        salary: { Icon: Briefcase, color: "text-primary", bg: 'bg-primary/10' },
        topup: { Icon: ArrowDownToLine, color: "text-blue-500", bg: 'bg-blue-500/10' },
        withdraw: { Icon: ArrowUpFromLine, color: "text-orange-500", bg: 'bg-orange-500/10' },
        service: { Icon: Cog, color: "text-indigo-500", bg: 'bg-indigo-500/10' },
        order_placed: { Icon: ShoppingBagIcon, color: "text-purple-500", bg: 'bg-purple-500/10' },
        bill_payment: { Icon: Receipt, color: "text-yellow-500", bg: 'bg-yellow-500/10' },
        mobile_recharge: { Icon: DevicePhoneMobileIcon, color: "text-cyan-500", bg: 'bg-cyan-500/10' },
        exchange: { Icon: Globe, color: "text-teal-500", bg: 'bg-teal-500/10' },
        savings_deposit: { Icon: PiggyBank, color: "text-pink-500", bg: 'bg-pink-500/10' },
        savings_withdraw: { Icon: HandCoins, color: "text-pink-500", bg: 'bg-pink-500/10' },
        investment_buy: { Icon: BarChart2, color: "text-amber-500", bg: 'bg-amber-500/10' },
        loan_repayment: { Icon: HandCoins, color: "text-red-500", bg: 'bg-red-500/10' },
        interest_earned: { Icon: PlusCircleIcon, color: "text-primary", bg: 'bg-primary/10' },
        cashback: { Icon: GiftIcon, color: "text-yellow-500", bg: 'bg-yellow-500/10' },
        mission_reward: { Icon: Trophy, color: "text-amber-500", bg: 'bg-amber-500/10' },
        referral_bonus: { Icon: UsersIcon, color: "text-cyan-500", bg: 'bg-cyan-500/10' },
        staking_deposit: { Icon: Lock, color: "text-indigo-500", bg: 'bg-indigo-500/10' },
        staking_withdraw: { Icon: ArrowDownLeft, color: "text-indigo-500", bg: 'bg-indigo-500/10' },
        staking_interest: { Icon: PlusCircleIcon, color: "text-primary", bg: 'bg-primary/10' },
        booking_payment: { Icon: BedDouble, color: "text-blue-500", bg: 'bg-blue-500/10' },
        govt_fee: { Icon: BookUserIcon, color: "text-purple-500", bg: 'bg-purple-500/10' },
        train_ticket: { Icon: TrainFront, color: "text-orange-500", bg: 'bg-orange-500/10' },
        bus_ticket: { Icon: Bus, color: "text-lime-500", bg: 'bg-lime-500/10' },
    };

    const current = iconMap[type] || { Icon: Receipt, color: "text-gray-400", bg: 'bg-gray-500/10' };
    const { Icon, color, bg } = current;

    return (
        <div className={`h-10 w-10 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={20} className={color} />
        </div>
    );
}

export default TransactionIcon;