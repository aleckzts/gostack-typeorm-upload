import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const balance = transactions.reduce(
      (result, currentTransaction) => {
        result[currentTransaction.type] += currentTransaction.value;
        currentTransaction.type === 'income'
          ? (result.total += currentTransaction.value)
          : (result.total -= currentTransaction.value);
        return result;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      } as Balance,
    );

    return balance;
  }
}

export default TransactionsRepository;
