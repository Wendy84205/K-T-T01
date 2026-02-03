import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from '../../database/entities/core/system-setting.entity';

@Injectable()
export class SystemSettingsService {
    constructor(
        @InjectRepository(SystemSetting)
        private settingsRepository: Repository<SystemSetting>,
    ) { }

    async getSettings(): Promise<any> {
        const settings = await this.settingsRepository.find();
        const config = {};
        settings.forEach(s => {
            try {
                config[s.key] = JSON.parse(s.value);
            } catch {
                config[s.key] = s.value;
            }
        });

        // Default values if not set
        const defaults = {
            mfa: true,
            bruteForce: true,
            fingerprint: false,
            hostname: 'secure-node-01',
            endpoint: 'https://api.cybersecure.local/v1',
            environment: 'PRODUCTION',
            retention: '90 Days',
            dbBackup: 'Daily',
            dbOptimize: true,
            emailAlerts: true,
            smsAlerts: false,
            webhookUrl: '',
            workerThreads: 8
        };

        return { ...defaults, ...config };
    }

    async updateSettings(newConfig: any): Promise<any> {
        const promises = Object.entries(newConfig).map(async ([key, value]) => {
            let setting = await this.settingsRepository.findOne({ where: { key } });
            if (!setting) {
                setting = this.settingsRepository.create({ key });
            }
            setting.value = JSON.stringify(value);
            return this.settingsRepository.save(setting);
        });

        await Promise.all(promises);
        return this.getSettings();
    }
}
