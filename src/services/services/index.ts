// ================ NUEVOS SERVICIOS PARA PRICING MODULAR ================

export { ServiceMonthOptionService } from './service-month-option.service';
export { ServiceScreenOptionService } from './service-screen-option.service';
export { ServicePlanService } from './service-plan.service';
export { ServicePricingIntegrationService } from './service-pricing-integration.service';

// ================ TIPOS PARA SERVICIOS ================

export interface PricingCreationResult {
  months: any[];
  screens: any[];
  plans: any[];
  errors: string[];
}

export interface ServicePricingMatrix {
  service_id: string;
  plan_type: 'plan' | 'repayment';
  matrix: any[];
  summary: {
    total_combinations: number;
    configured_plans: number;
    missing_plans: number;
  };
}

export interface PricingValidationResult {
  service_id: string;
  is_complete: boolean;
  expected_combinations: number;
  actual_plans: number;
  issues: string[];
  missing_combinations: Array<{
    month_id: number;
    month: number;
    screen_id: number;
    screen: number;
  }>;
}
