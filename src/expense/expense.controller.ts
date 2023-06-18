import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto';
import { JwtGuard } from '@/auth/guard';
import { GetUser } from '@/auth/decorator';

@Controller('expense')
export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}
  @Post('/new')
  @UseGuards(JwtGuard)
  newExpense(@Body() dto: CreateExpenseDto, @GetUser('userId') userId: string) {
    return this.expenseService.createExpense(dto, userId);
  }
}
