import { Module } from '@nestjs/common';
import { CompaniesModule } from './companies/companies.module';
import { ComparisonsModule } from './comparisons/comparisons.module';
import { AiModule } from './ai/ai.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SalaryBenchmarkModule } from './salary-benchmark/salary-benchmark.module';
import { ComparisonGateway } from './comparisons/comparison.gateway';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [CompaniesModule, ComparisonsModule,AiModule,AnalyticsModule,SalaryBenchmarkModule,AuthModule  ],
  providers: [ComparisonGateway]
})
export class AppModule {}