import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { BulkUpdateSettingsDto } from './dto/bulk-update-settings.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Get('public')
  getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }

  @Post()
  create(@Body() body: CreateSettingDto) {
    return this.settingsService.set(body.key, body.value, body.description, body.type);
  }

  @Put('bulk')
  updateMultiple(@Body() body: BulkUpdateSettingsDto) {
    return this.settingsService.updateMultiple(body.settings);
  }

  @Put(':key')
  update(
    @Param('key') key: string,
    @Body() body: UpdateSettingDto
  ) {
    return this.settingsService.set(key, body.value, body.description, body.type);
  }

  @Delete(':key')
  delete(@Param('key') key: string) {
    return this.settingsService.delete(key);
  }
}
