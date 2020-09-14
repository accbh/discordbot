import axios, { AxiosInstance, AxiosError } from 'axios';
import { Logger } from './logger';

export class VatsimApi {
    constructor(private readonly baseUrl: string, private readonly logger: Logger, private readonly timeout: number = 5000) { }

    async getApiInstance(): Promise<AxiosInstance> {
        return await axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'Accepts': 'application/json',
            },
            timeout: this.timeout
        });
    }

    async getVatsimUser(apiInstance: AxiosInstance, userCid: string): Promise<any> {
        return apiInstance.get(`/api/ratings/${userCid}`)
            .then(res => {
                if (res.status === 200) {
                    return res.data;
                }

                return {
                    error: 'Not working!'
                };
            }, (err: AxiosError) => {
                if (err.isAxiosError && err.response.status === 404) {
                    this.logger.error('Error with getting VATSIM User Data (404)');
                } else {
                    this.logger.error('Error with getting VATSIM User Data (N/A)');
                }
            });
    }
}
