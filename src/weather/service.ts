import repositoryInstance, { WeatherDataRepository } from './repository.js';
import { WeatherData, WeatherFilter } from './dto.js';
import SimpleCache from '../cache.js';

export class WeatherService {
  private weatherRepository: WeatherDataRepository;
  private dataCache: SimpleCache<WeatherData[] | null>;
  private statsCache: SimpleCache<number | null>;

  constructor() {
    this.weatherRepository = repositoryInstance;
    this.dataCache = new SimpleCache<WeatherData[] | null>(300);
    this.statsCache = new SimpleCache<number | null>(300);
  }

  async addData(data: WeatherData) {
    this.dataCache.clear();
    this.statsCache.clear();
    return this.weatherRepository.insertWeatherData(data);
  }

  async addDataBatch(dataArray: WeatherData[]) {
    this.dataCache.clear();
    this.statsCache.clear();
    return this.weatherRepository.insertWeatherDataBatch(dataArray);
  }

  async getData(location: string, options: WeatherFilter) {
    const cacheKey = this.dataCache.generateKey('data', location, options.from, options.to);
    const cached = this.dataCache.get(cacheKey);
    
    if (cached !== null) {
      return cached;
    }

    const data = await this.weatherRepository.getWeatherDataByLocation(location, options);
    this.dataCache.set(cacheKey, data);
    return data;
  }

  async getMean(location: string, options: WeatherFilter) {
    const cacheKey = this.statsCache.generateKey('mean', location, options.from, options.to);
    const cached = this.statsCache.get(cacheKey);
    
    if (cached !== null) {
      return cached;
    }

    const mean = await this.weatherRepository.getMean(location, options);
    this.statsCache.set(cacheKey, mean);
    return mean;
  }

  async getMax(location: string, options: WeatherFilter) {
    const cacheKey = this.statsCache.generateKey('max', location, options.from, options.to);
    const cached = this.statsCache.get(cacheKey);
    
    if (cached !== null) {
      return cached;
    }

    const max = await this.weatherRepository.getMax(location, options);
    this.statsCache.set(cacheKey, max);
    return max;
  }

  async getMin(location: string, options: WeatherFilter) {
    const cacheKey = this.statsCache.generateKey('min', location, options.from, options.to);
    const cached = this.statsCache.get(cacheKey);
    
    if (cached !== null) {
      return cached;
    }

    const min = await this.weatherRepository.getMin(location, options);
    this.statsCache.set(cacheKey, min);
    return min;
  }
}

export default new WeatherService();