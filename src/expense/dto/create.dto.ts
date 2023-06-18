import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

type expenseType = 'expense' | 'income';

export class CreateExpenseDto {
  @IsNotEmpty()
  @IsString()
  product: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  date: string;

  @IsString()
  location: string;

  @IsString()
  type: expenseType;
}
