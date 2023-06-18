import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateExpenseDto } from './dto';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async createExpense(createDto: CreateExpenseDto, userId: string) {
    try {
      const { product, amount, date, location, type } = createDto;

      if (!product || !amount || !date || !location || !type) {
        throw new BadRequestException({
          message: 'All fields are mandatory.',
          success: false,
        });
      }

      const createdExpense = await this.prisma.expense.create({
        data: {
          product,
          amount,
          date,
          location,
          type,
          userId,
        },
      });

      const { balance } = await this.prisma.user.findFirst({
        where: {
          userId,
        },
      });

      if (type === 'expense') {
        await this.prisma.user.update({
          data: {
            balance: balance - amount,
          },
          where: {
            userId,
          },
        });
      } else {
        await this.prisma.user.update({
          data: {
            balance: balance + amount,
          },
          where: {
            userId,
          },
        });
      }

      return {
        message: 'Expense added',
        success: true,
        data: {
          ...createdExpense,
        },
      };
    } catch (error) {
      throw new BadRequestException({
        message: error?.message || 'An error has occurred',
        success: false,
      });
    }
  }
}
