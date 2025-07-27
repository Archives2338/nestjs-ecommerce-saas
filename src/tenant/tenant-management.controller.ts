import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TenantManagementService } from './tenant-management.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';

@Controller('tenants')
export class TenantManagementController {
  constructor(private readonly tenantManagementService: TenantManagementService) {}

  @Post()
  async createTenant(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantManagementService.createTenant(createTenantDto);
  }

  @Get()
  async getAllTenants() {
    return this.tenantManagementService.getAllTenants();
  }

  @Get(':tenantId')
  async getTenant(@Param('tenantId') tenantId: string) {
    return this.tenantManagementService.getTenantById(tenantId);
  }

  @Put(':tenantId')
  async updateTenant(
    @Param('tenantId') tenantId: string,
    @Body() updateTenantDto: UpdateTenantDto
  ) {
    return this.tenantManagementService.updateTenant(tenantId, updateTenantDto);
  }

  @Delete(':tenantId')
  async deleteTenant(@Param('tenantId') tenantId: string) {
    return this.tenantManagementService.deleteTenant(tenantId);
  }

  @Post(':tenantId/activate')
  async activateTenant(@Param('tenantId') tenantId: string) {
    return this.tenantManagementService.toggleTenantStatus(tenantId, true);
  }

  @Post(':tenantId/deactivate')
  async deactivateTenant(@Param('tenantId') tenantId: string) {
    return this.tenantManagementService.toggleTenantStatus(tenantId, false);
  }
}
