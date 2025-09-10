import { Injectable, Logger } from '@nestjs/common';

export interface ServiceUpdateEvent {
  serviceId: string;
  typeId: number;
  eventType: 'created' | 'updated' | 'deleted' | 'status_changed';
  serviceData?: any;
  oldData?: any;
  timestamp: Date;
}

@Injectable()
export class ServiceEventsService {
  private readonly logger = new Logger(ServiceEventsService.name);
  private readonly eventHistory: ServiceUpdateEvent[] = [];

  /**
   * 🔔 Registrar evento de creación de servicio
   */
  logServiceCreated(serviceId: string, typeId: number, serviceData: any) {
    const event: ServiceUpdateEvent = {
      serviceId,
      typeId,
      eventType: 'created',
      serviceData,
      timestamp: new Date()
    };

    this.logger.log(`Service created: ${serviceId} (type_id: ${typeId})`);
    this.eventHistory.push(event);
    
    // Mantener solo los últimos 100 eventos
    if (this.eventHistory.length > 100) {
      this.eventHistory.shift();
    }
  }

  /**
   * 🔔 Registrar evento de actualización de servicio
   */
  logServiceUpdated(serviceId: string, typeId: number, serviceData: any, oldData?: any) {
    const event: ServiceUpdateEvent = {
      serviceId,
      typeId,
      eventType: 'updated',
      serviceData,
      oldData,
      timestamp: new Date()
    };

    this.logger.log(`Service updated: ${serviceId} (type_id: ${typeId})`);
    this.eventHistory.push(event);
    
    if (this.eventHistory.length > 100) {
      this.eventHistory.shift();
    }
  }

  /**
   * 🔔 Registrar evento de eliminación de servicio
   */
  logServiceDeleted(serviceId: string, typeId: number, oldData?: any) {
    const event: ServiceUpdateEvent = {
      serviceId,
      typeId,
      eventType: 'deleted',
      oldData,
      timestamp: new Date()
    };

    this.logger.log(`Service deleted: ${serviceId} (type_id: ${typeId})`);
    this.eventHistory.push(event);
    
    if (this.eventHistory.length > 100) {
      this.eventHistory.shift();
    }
  }

  /**
   * 🔔 Registrar evento de cambio de estado de servicio
   */
  logServiceStatusChanged(serviceId: string, typeId: number, serviceData: any, oldData?: any) {
    const event: ServiceUpdateEvent = {
      serviceId,
      typeId,
      eventType: 'status_changed',
      serviceData,
      oldData,
      timestamp: new Date()
    };

    this.logger.log(`Service status changed: ${serviceId} (type_id: ${typeId})`);
    this.eventHistory.push(event);
    
    if (this.eventHistory.length > 100) {
      this.eventHistory.shift();
    }
  }

  /**
   * 📋 Obtener historial de eventos
   */
  getEventHistory(limit: number = 20): ServiceUpdateEvent[] {
    return this.eventHistory.slice(-limit).reverse();
  }

  /**
   * 🔍 Obtener eventos de un servicio específico
   */
  getServiceEvents(serviceId: string): ServiceUpdateEvent[] {
    return this.eventHistory
      .filter(event => event.serviceId === serviceId)
      .reverse();
  }
}
