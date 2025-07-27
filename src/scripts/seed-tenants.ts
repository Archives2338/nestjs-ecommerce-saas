import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { TenantManagementService } from '../tenant/tenant-management.service';

async function seedTenants() {
  console.log('🌱 Iniciando seed de tenants...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const tenantService = app.get(TenantManagementService);

  const sampleTenants = [
    {
      tenantId: 'restaurante-pepito',
      name: 'Restaurante Pepito',
      email: 'admin@restaurantepepito.com',
      businessName: 'Restaurante Pepito S.A.C.',
      subdomain: 'restaurante-pepito',
      settings: {
        theme: 'restaurant',
        currency: 'PEN',
        language: 'es',
        paymentMethods: ['credit_card', 'cash'],
        shippingMethods: ['delivery', 'pickup']
      },
      branding: {
        logo: 'https://example.com/pepito-logo.png',
        colors: {
          primary: '#D97706',
          secondary: '#059669'
        },
        fonts: 'Playfair Display'
      },
      subscriptionPlan: 'professional',
      limits: {
        maxProducts: 500,
        maxOrders: 2000,
        maxUsers: 10
      }
    },
    {
      tenantId: 'tienda-moda',
      name: 'Tienda Moda Bella',
      email: 'admin@modabella.com',
      businessName: 'Moda Bella E.I.R.L.',
      subdomain: 'moda-bella',
      settings: {
        theme: 'fashion',
        currency: 'USD',
        language: 'es',
        paymentMethods: ['credit_card', 'paypal'],
        shippingMethods: ['standard', 'express']
      },
      branding: {
        logo: 'https://example.com/moda-logo.png',
        colors: {
          primary: '#EC4899',
          secondary: '#1F2937'
        },
        fonts: 'Poppins'
      },
      subscriptionPlan: 'starter',
      limits: {
        maxProducts: 100,
        maxOrders: 500,
        maxUsers: 3
      }
    },
    {
      tenantId: 'tech-store',
      name: 'TechStore Pro',
      email: 'admin@techstore.com',
      businessName: 'TechStore Pro S.A.',
      subdomain: 'techstore',
      settings: {
        theme: 'technology',
        currency: 'USD',
        language: 'es',
        paymentMethods: ['credit_card', 'paypal', 'bank_transfer'],
        shippingMethods: ['standard', 'express', 'overnight']
      },
      branding: {
        logo: 'https://example.com/tech-logo.png',
        colors: {
          primary: '#1E40AF',
          secondary: '#DC2626'
        },
        fonts: 'Roboto'
      },
      subscriptionPlan: 'enterprise',
      limits: {
        maxProducts: 9999,
        maxOrders: 99999,
        maxUsers: 50
      }
    }
  ];

  try {
    for (const tenantData of sampleTenants) {
      try {
        const tenant = await tenantService.createTenant(tenantData);
        console.log(`✅ Tenant creado: ${tenant.tenantId} (${tenant.name})`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('ya existe')) {
          console.log(`⚠️  Tenant ya existe: ${tenantData.tenantId}`);
        } else {
          console.error(`❌ Error creando tenant ${tenantData.tenantId}:`, errorMessage);
        }
      }
    }

    console.log('\n🎉 ¡Seed completado!');
    console.log('\n📋 Tenants disponibles para pruebas:');
    console.log('1. restaurante-pepito (Restaurante)');
    console.log('2. moda-bella (Tienda de Moda)');
    console.log('3. techstore (Tienda de Tecnología)');
    
    console.log('\n🌐 Puedes probar accediendo con:');
    console.log('- Header: X-Tenant-ID: restaurante-pepito');
    console.log('- Query: ?tenant=moda-bella');
    console.log('- Subdominio: techstore.localhost:3000');

  } catch (error) {
    console.error('❌ Error en el seed:', error);
  } finally {
    await app.close();
  }
}

// Ejecutar el seed
seedTenants().catch(console.error);
