export class CurrencyConverter {
  private static readonly EXCHANGE_RATES = {
    'USD_TO_PEN': 3.75, // Actualizar periódicamente
    'EUR_TO_PEN': 4.10,
  };

  /**
   * Convierte USD a PEN con redondeo para e-commerce
   */
  static convertUsdToPen(usdAmount: number): number {
    const penAmount = usdAmount * this.EXCHANGE_RATES.USD_TO_PEN;
    // Redondear a precio psicológico (.00)
    return Math.ceil(penAmount);
  }

  /**
   * Formatea precio en soles
   */
  static formatPenPrice(amount: number): string {
    return amount.toFixed(2);
  }

  /**
   * Obtiene formato de moneda peruana
   */
  static getPenCurrencyFormat() {
    return {
      currency_icon1: "S/",
      currency_icon2: "PEN(S/)",
      currency_show_type: 1
    };
  }

  /**
   * Convierte precios de un plan de USD a PEN
   */
  static convertPlanPrices(originalPrice: string, salePrice: string) {
    const originalUsd = parseFloat(originalPrice);
    const saleUsd = parseFloat(salePrice);
    
    const originalPen = this.convertUsdToPen(originalUsd);
    const salePen = this.convertUsdToPen(saleUsd);
    
    // Calcular descuento
    const discount = Math.round(((originalPen - salePen) / originalPen) * 100);
    
    return {
      original_price: this.formatPenPrice(originalPen),
      sale_price: this.formatPenPrice(salePen),
      average_price: this.formatPenPrice(salePen),
      discount: `${discount}%`,
      ...this.getPenCurrencyFormat()
    };
  }

  /**
   * Helper para generar IDs de planes
   */
  static generatePlanIds() {
    return {
      MONTH_IDS: {
        1: { id: 1, content: "1 mes" },
        3: { id: 2, content: "3 meses" },
        6: { id: 3, content: "6 meses" },
        12: { id: 4, content: "12 meses" }
      },
      SCREEN_IDS: {
        1: { id: 1, content: "1 perfil" },
        2: { id: 2, content: "2 perfiles" },
        4: { id: 3, content: "4 perfiles" },
        6: { id: 4, content: "Familiar" }
      }
    };
  }

  /**
   * Genera type_plan_id único
   */
  static generateTypePlanId(typeId: number, monthId: number, screenId: number): number {
    return (typeId * 1000) + (monthId * 10) + screenId;
  }
}
