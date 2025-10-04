import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSettings } from '../entities/site-settings.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SiteSettings)
    private settingsRepository: Repository<SiteSettings>,
  ) {}

  async findAll() {
    return this.settingsRepository.find();
  }

  async findByKey(key: string) {
    return this.settingsRepository.findOne({ where: { key } });
  }

  async getValue(key: string, defaultValue: string | null = null) {
    const setting = await this.findByKey(key);
    if (!setting) return defaultValue;

    // Parse value based on type
    switch (setting.type) {
      case 'number':
        return parseFloat(setting.value);
      case 'boolean':
        return setting.value === 'true';
      case 'json':
        try {
          return JSON.parse(setting.value);
        } catch {
          return defaultValue;
        }
      default:
        return setting.value;
    }
  }

  async set(key: string, value: string, description?: string, type: string = 'string') {
    let setting = await this.findByKey(key);

    // Convert value to string for storage
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

    if (setting) {
      setting.value = stringValue;
      setting.type = type;
      if (description) setting.description = description;
      return this.settingsRepository.save(setting);
    } else {
      setting = this.settingsRepository.create({
        key,
        value: stringValue,
        description,
        type,
      });
      return this.settingsRepository.save(setting);
    }
  }

  async updateMultiple(settings: Array<{ key: string; value: string; description?: string; type?: string }>) {
    const results: SiteSettings[] = [];
    for (const setting of settings) {
      const result = await this.set(
        setting.key,
        setting.value,
        setting.description,
        setting.type || 'string'
      );
      results.push(result);
    }
    return results;
  }

  async delete(key: string) {
    const setting = await this.findByKey(key);
    if (setting) {
      return this.settingsRepository.remove(setting);
    }
    return null;
  }

  // Get all public settings (for frontend)
  async getPublicSettings() {
    const all = await this.findAll();
    const publicSettings: Record<string, any> = {};

    for (const setting of all) {
      const value = await this.getValue(setting.key);
      publicSettings[setting.key] = value;
    }

    return publicSettings;
  }
}
