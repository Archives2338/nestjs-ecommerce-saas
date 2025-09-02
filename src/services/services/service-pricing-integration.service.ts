import { Injectable } from '@nestjs/common';
import { ServiceMonthOptionService } from './service-month-option.service';
import { ServiceScreenOptionService } from './service-screen-option.service';
import { ServicePlanService } from './service-plan.service';
import { Types } from 'mongoose';

@Injectable()
export class ServicePricingIntegrationService {
  constructor(
    private monthOptionService: ServiceMonthOptionService,
    private screenOptionService: ServiceScreenOptionService,
    private planService: ServicePlanService
  ) {}

  /**
   * Obtener la estructura completa de pricing para un servicio (formato compatible con API actual)
   */
  async getServiceWithPricing(serviceId: string) {
    const [monthOptions, screenOptions, plans, repaymentPlans] = await Promise.all([
      this.monthOptionService.findByService(serviceId),
      this.screenOptionService.findByService(serviceId),
      this.planService.findByService(serviceId, 'plan'),
      this.planService.findByService(serviceId, 'repayment')
    ]);

    return {
      plans: this.formatPlansForAPI(plans, monthOptions, screenOptions),
      repayment: this.formatPlansForAPI(repaymentPlans, monthOptions, screenOptions),
      defaults: {
        month_id: monthOptions.find(m => m.is_default)?.month_id || monthOptions[0]?.month_id,
        screen_id: screenOptions.find(s => s.is_default)?.screen_id || screenOptions[0]?.screen_id
      }
    };
  }

  /**
   * Formatear planes para que coincidan con la estructura actual de la API
   */
  private formatPlansForAPI(plans: any[], monthOptions: any[], screenOptions: any[]) {
    const monthGroups: { [key: string]: any } = {};
    const screenGroups: { [key: string]: any } = {};

    // Inicializar grupos
    monthOptions.forEach(month => {
      monthGroups[month.month_id] = {
        month_id: month.month_id,
        month: month.month,
        month_content: month.month_content,
        screen: []
      };
    });

    screenOptions.forEach(screen => {
      screenGroups[screen.screen_id] = {
        screen_id: screen.screen_id,
        max_user: screen.max_user,
        substitute_recharge: screen.substitute_recharge,
        screen: screen.screen,
        screen_content: screen.screen_content,
        seat_type: screen.seat_type,
        sort: screen.sort,
        month: []
      };
    });

    // Llenar con planes
    plans.forEach(plan => {
      const planData = {
        month_id: plan.month_id,
        month: monthOptions.find(m => m.month_id === plan.month_id)?.month || 0,
        month_content: monthOptions.find(m => m.month_id === plan.month_id)?.month_content || '',
        screen_id: plan.screen_id,
        max_user: screenOptions.find(s => s.screen_id === plan.screen_id)?.max_user || 0,
        substitute_recharge: screenOptions.find(s => s.screen_id === plan.screen_id)?.substitute_recharge || 0,
        screen: screenOptions.find(s => s.screen_id === plan.screen_id)?.screen || 0,
        screen_content: screenOptions.find(s => s.screen_id === plan.screen_id)?.screen_content || '',
        seat_type: screenOptions.find(s => s.screen_id === plan.screen_id)?.seat_type || '',
        type_plan_id: plan.type_plan_id,
        sort: plan.sort,
        currency_icon1: plan.currency_icon1,
        currency_icon2: plan.currency_icon2,
        currency_show_type: plan.currency_show_type,
        original_price: plan.original_price.toString(),
        sale_price: plan.sale_price.toString(),
        average_price: plan.average_price.toString(),
        discount: plan.discount
      };

      if (monthGroups[plan.month_id]) {
        monthGroups[plan.month_id].screen.push(planData);
      }

      if (screenGroups[plan.screen_id]) {
        screenGroups[plan.screen_id].month.push(planData);
      }
    });

    return {
      month: Object.values(monthGroups),
      screen: Object.values(screenGroups)
    };
  }

  /**
   * Crear un servicio completo con todas sus opciones y planes
   */
  async createCompleteServicePricing(serviceId: string, pricingData: any) {
    const results: {
      months: any[],
      screens: any[],
      plans: any[],
      errors: string[]
    } = {
      months: [],
      screens: [],
      plans: [],
      errors: []
    };

    try {
      // 1. Crear opciones de meses
      if (pricingData.months) {
        for (const monthData of pricingData.months) {
          try {
            const month = await this.monthOptionService.create(serviceId, monthData);
            results.months.push(month);
          } catch (error) {
            const errorMsg = typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error);
            results.errors.push(`Error creando mes ${monthData.month}: ${errorMsg}`);
          }
        }
      }

      // 2. Crear opciones de pantallas
      if (pricingData.screens) {
        for (const screenData of pricingData.screens) {
          try {
            const screen = await this.screenOptionService.create(serviceId, screenData);
            results.screens.push(screen);
          } catch (error) {
            const errorMsg = typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error);
            results.errors.push(`Error creando pantalla ${screenData.screen}: ${errorMsg}`);
          }
        }
      }

      // 3. Crear planes de precios
      if (pricingData.plans) {
        for (const planData of pricingData.plans) {
          try {
            const plan = await this.planService.create(serviceId, planData);
            results.plans.push(plan);
          } catch (error) {
            const errorMsg = typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error);
            results.errors.push(`Error creando plan ${planData.month_id}-${planData.screen_id}: ${errorMsg}`);
          }
        }
      }

      return results;

    } catch (error) {
      const errorMsg = typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error);
      results.errors.push(`Error general: ${errorMsg}`);
      return results;
    }
  }

  /**
   * Obtener estadísticas completas del pricing por servicio
   */
  async getPricingStats(serviceId: string) {
    const [monthOptions, screenOptions, plans] = await Promise.all([
      this.monthOptionService.findByService(serviceId),
      this.screenOptionService.findByService(serviceId),
      this.planService.findByService(serviceId)
    ]);

    const expectedCombinations = monthOptions.length * screenOptions.length;
    const activePlans = plans.filter(p => p.active).length;

    return {
      service_id: serviceId,
      summary: {
        total_months: monthOptions.length,
        total_screens: screenOptions.length,
        total_plans: plans.length,
        active_plans: activePlans,
        expected_combinations: expectedCombinations,
        completion_percentage: expectedCombinations > 0 ? Math.round((plans.length / expectedCombinations) * 100) : 0
      },
      months: monthOptions.map(m => ({
        month_id: m.month_id,
        month: m.month,
        month_content: m.month_content,
        is_default: m.is_default,
        active: m.active
      })),
      screens: screenOptions.map(s => ({
        screen_id: s.screen_id,
        screen: s.screen,
        screen_content: s.screen_content,
        seat_type: s.seat_type,
        is_default: s.is_default,
        active: s.active
      })),
      plans: plans.map(p => ({
        type_plan_id: p.type_plan_id,
        month_id: p.month_id,
        screen_id: p.screen_id,
        plan_type: p.plan_type,
        sale_price: p.sale_price,
        discount: p.discount,
        active: p.active
      }))
    };
  }

  /**
   * Obtener matriz de precios completa para un servicio
   */
  async getPricingMatrix(serviceId: string) {
    const [monthOptions, screenOptions, plans] = await Promise.all([
      this.monthOptionService.findByService(serviceId),
      this.screenOptionService.findByService(serviceId),
      this.planService.findByService(serviceId)
    ]);

    // Crear matriz
    const matrix = monthOptions.map(month => ({
      month_id: month.month_id,
      month: month.month,
      month_content: month.month_content,
      is_default: month.is_default,
      screens: screenOptions.map(screen => {
        const plan = plans.find(p => 
          p.month_id === month.month_id && 
          p.screen_id === screen.screen_id
        );
        
        return {
          screen_id: screen.screen_id,
          screen: screen.screen,
          screen_content: screen.screen_content,
          seat_type: screen.seat_type,
          is_default: screen.is_default,
          plan: plan ? {
            type_plan_id: plan.type_plan_id,
            plan_type: plan.plan_type,
            original_price: plan.original_price,
            sale_price: plan.sale_price,
            discount: plan.discount,
            currency_icon1: plan.currency_icon1,
            currency_icon2: plan.currency_icon2,
            active: plan.active
          } : null
        };
      })
    }));

    return {
      service_id: serviceId,
      matrix,
      summary: {
        total_months: monthOptions.length,
        total_screens: screenOptions.length,
        total_plans: plans.length,
        expected_combinations: monthOptions.length * screenOptions.length
      }
    };
  }

  /**
   * Obtener combinaciones faltantes para un servicio
   */
  async getMissingCombinations(serviceId: string) {
    const validation = await this.validateServicePricing(serviceId);
    
    return {
      service_id: serviceId,
      missing_count: validation.missing_combinations.length,
      is_complete: validation.is_complete,
      expected_combinations: validation.expected_combinations,
      actual_plans: validation.actual_plans,
      missing_combinations: validation.missing_combinations.map(combo => ({
        month_id: combo.month_id,
        month: combo.month,
        screen_id: combo.screen_id,
        screen: combo.screen,
        suggested_action: `Crear plan para ${combo.month} meses con ${combo.screen} pantalla(s)`
      }))
    };
  }

  /**
   * Validar integridad de datos para un servicio
   */
  async validateServicePricing(serviceId: string) {
    const [monthOptions, screenOptions, plans] = await Promise.all([
      this.monthOptionService.findByService(serviceId),
      this.screenOptionService.findByService(serviceId),
      this.planService.findByService(serviceId)
    ]);

    const issues = [];
    const expectedCombinations = monthOptions.length * screenOptions.length;
    const actualPlans = plans.length;

    if (actualPlans < expectedCombinations) {
      issues.push(`Faltan ${expectedCombinations - actualPlans} combinaciones de precios`);
    }

    // Verificar combinaciones faltantes
    const missingCombinations: Array<{
      month_id: number;
      month: number;
      screen_id: number;
      screen: number;
    }> = [];
    monthOptions.forEach(month => {
      screenOptions.forEach(screen => {
        const planExists = plans.some(p => p.month_id === month.month_id && p.screen_id === screen.screen_id);
        if (!planExists) {
          missingCombinations.push({
            month_id: month.month_id,
            month: month.month,
            screen_id: screen.screen_id,
            screen: screen.screen
          });
        }
      });
    });

    return {
      service_id: serviceId,
      is_complete: issues.length === 0,
      expected_combinations: expectedCombinations,
      actual_plans: actualPlans,
      issues,
      missing_combinations: missingCombinations
    };
  }
}
