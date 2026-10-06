import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty({ message: '内容不能为空' })
  content: string;
}
