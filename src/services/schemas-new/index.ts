// ================ NUEVOS SCHEMAS PARA SERVICIO MODULAR ================

export * from './service-month-option.schema';
export * from './service-screen-option.schema';
export * from './service-plan.schema';

// ================ IMPORTS CONSOLIDADOS ================

export { 
  ServiceMonthOption, 
  ServiceMonthOptionDocument, 
  ServiceMonthOptionSchema 
} from './service-month-option.schema';

export { 
  ServiceScreenOption, 
  ServiceScreenOptionDocument, 
  ServiceScreenOptionSchema 
} from './service-screen-option.schema';

export { 
  ServicePlan, 
  ServicePlanDocument, 
  ServicePlanSchema 
} from './service-plan.schema';
