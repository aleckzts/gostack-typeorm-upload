import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Invalid type, expected income or outcome');
    }

    if (!Number.isNaN(Number(value))) {
      throw new AppError('Value has to be a number');
    }

    if (!category) {
      throw new AppError('Category has to be informed');
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (type === 'outcome') {
      const balance = await transactionsRepository.getBalance();
      if (balance.total - value < 0) {
        throw new AppError(
          'Cannot create outcome transaction without a valid balance',
        );
      }
    }

    const categoriesRepository = getRepository(Category);

    const findCategory = await categoriesRepository.findOne({
      where: {
        title: category,
      },
    });

    let category_id = '';
    if (!findCategory) {
      const newCategory = categoriesRepository.create({
        title: category,
      });
      await categoriesRepository.save(newCategory);
      category_id = newCategory.id;
    } else {
      category_id = findCategory.id;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });
    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
