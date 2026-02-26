import { Module } from '@nestjs/common';
import { SalaryBenchmarkService } from './salary-benchmark.service';
import { SalaryBenchmarkController } from './salary-benchmark.controller';
@Module({
  controllers: [SalaryBenchmarkController],
  providers: [SalaryBenchmarkService],
  exports: [SalaryBenchmarkService]
})
export class SalaryBenchmarkModule {}