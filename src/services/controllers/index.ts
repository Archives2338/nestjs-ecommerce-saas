// ================ CONTROLADORES ADMIN PARA PRICING MODULAR ================

export { AdminMonthOptionsController } from './admin-month-options.controller';
export { AdminScreenOptionsController } from './admin-screen-options.controller';
export { AdminServicePlansController } from './admin-service-plans.controller';
export { AdminServicePricingController } from './admin-service-pricing.controller';

// ================ AGRUPACIÓN POR FUNCIONALIDAD ================

import { AdminMonthOptionsController } from './admin-month-options.controller';
import { AdminScreenOptionsController } from './admin-screen-options.controller';
import { AdminServicePlansController } from './admin-service-plans.controller';
import { AdminServicePricingController } from './admin-service-pricing.controller';

// Controladores de opciones individuales
export const OPTION_CONTROLLERS = [
  AdminMonthOptionsController,
  AdminScreenOptionsController
];

// Controladores de precios y planes
export const PRICING_CONTROLLERS = [
  AdminServicePlansController,
  AdminServicePricingController
];

// Todos los controladores
export const ALL_ADMIN_PRICING_CONTROLLERS = [
  ...OPTION_CONTROLLERS,
  ...PRICING_CONTROLLERS
];
