import { IsOptional, IsDateString } from "class-validator";

export class ReportParamsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
