import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    if (!id) {
      throw new AppError('Id has to be informed');
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const result = await transactionsRepository.delete(id);

    if (!result.affected || result.affected <= 0) {
      throw new AppError('Transaction not found');
    }
  }
}

export default DeleteTransactionService;
