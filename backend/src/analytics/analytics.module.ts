// src/analytics/analytics.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { CompaniesModule } from '../companies/companies.module';
import { ComparisonsModule } from '../comparisons/comparisons.module';

@Module({
  imports: [
    CompaniesModule,
    ComparisonsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}