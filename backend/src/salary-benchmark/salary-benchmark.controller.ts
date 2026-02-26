// src/salary-benchmark/salary-benchmark.controller.ts
import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { SalaryBenchmarkService ,SalaryComparisonResult} from './salary-benchmark.service';

@Controller('api/benchmark')
export class SalaryBenchmarkController {
  constructor(private benchmarkService: SalaryBenchmarkService) {}

  @Get('/:industry/:location')
  async getBenchmark(
    @Param('industry') industry: string,
    @Param('location') location: string
  ) {
    return await this.benchmarkService.getBenchmark(industry, location);
  }

  @Post('/compare')
  async compareSalary(
    @Body() data: { salary: number; industry: string; location?: string }
  ): Promise<SalaryComparisonResult> {
    return await this.benchmarkService.compareSalary(
      data.salary,
      data.industry,
      data.location
    );
  }

  @Get('/trend/:industry')
  async getTrend(@Param('industry') industry: string) {
    return await this.benchmarkService.getSalaryTrend(industry);
  }
}