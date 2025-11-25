import pg from 'pg';
import config from 'config';
import { WeatherData, WeatherDataSchema, WeatherFilter } from './dto.js';

const poolConfig = config.get<pg.PoolConfig>('database');

export class WeatherDataRepository {
  private pool: pg.Pool;

  constructor() {
    this.pool = new pg.Pool({
      ...poolConfig,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async createTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS weather (
        location VARCHAR(256),
        date TIMESTAMP,
        temperature DECIMAL,
        humidity DECIMAL,
        PRIMARY KEY(location, date)
      );
      CREATE INDEX IF NOT EXISTS idx_weather_location_date ON weather(location, date);
    `;
    await this.pool.query(query);
  }

  async insertWeatherData(weatherData: WeatherData): Promise<void> {
    const query = `
      INSERT INTO weather (location, date, temperature, humidity)
      VALUES ($1, $2, $3, $4)
    `;
    const values = [
      weatherData.location,
      weatherData.date,
      weatherData.temperature,
      weatherData.humidity,
    ];
    await this.pool.query(query, values);
  }

  async insertWeatherDataBatch(weatherDataArray: WeatherData[]): Promise<void> {
    if (weatherDataArray.length === 0) {
      return;
    }

    const values: any[] = [];
    const placeholders: string[] = [];
    
    weatherDataArray.forEach((data, index) => {
      const offset = index * 4;
      placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`);
      values.push(data.location, data.date, data.temperature, data.humidity);
    });

    const query = `
      INSERT INTO weather (location, date, temperature, humidity)
      VALUES ${placeholders.join(', ')}
      ON CONFLICT (location, date) DO NOTHING
    `;

    await this.pool.query(query, values);
  }

  async getWeatherDataByLocation(
    location: string,
    filter?: WeatherFilter
  ): Promise<WeatherData[] | null> {
    let query = `SELECT * FROM weather WHERE location = $1`;
    const params: any[] = [location];
    let paramIndex = 2;

    if (filter?.from) {
      query += ` AND date > $${paramIndex}`;
      params.push(filter.from);
      paramIndex++;
    }

    if (filter?.to) {
      query += ` AND date < $${paramIndex}`;
      params.push(filter.to);
      paramIndex++;
    }

    query += ` ORDER BY date DESC`;

    query += ` LIMIT $${paramIndex}`;
    params.push(filter?.limit || 100);
    paramIndex++;

    query += ` OFFSET $${paramIndex}`;
    params.push(filter?.offset || 0);

    const result: pg.QueryResult = await this.pool.query(query, params);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows as WeatherData[];
  }

  async getMean(location: string, filter?: WeatherFilter): Promise<number | null> {
    let query = `SELECT AVG(temperature) as mean FROM weather WHERE location = $1`;
    const params: any[] = [location];
    let paramIndex = 2;

    if (filter?.from) {
      query += ` AND date > $${paramIndex}`;
      params.push(filter.from);
      paramIndex++;
    }

    if (filter?.to) {
      query += ` AND date < $${paramIndex}`;
      params.push(filter.to);
      paramIndex++;
    }

    const result: pg.QueryResult = await this.pool.query(query, params);

    if (result.rows.length === 0 || result.rows[0].mean === null) {
      return null;
    }

    return parseFloat(result.rows[0].mean);
  }

  async getMax(location: string, filter?: WeatherFilter): Promise<number | null> {
    let query = `SELECT MAX(temperature) as max FROM weather WHERE location = $1`;
    const params: any[] = [location];
    let paramIndex = 2;

    if (filter?.from) {
      query += ` AND date > $${paramIndex}`;
      params.push(filter.from);
      paramIndex++;
    }

    if (filter?.to) {
      query += ` AND date < $${paramIndex}`;
      params.push(filter.to);
      paramIndex++;
    }

    const result: pg.QueryResult = await this.pool.query(query, params);

    if (result.rows.length === 0 || result.rows[0].max === null) {
      return null;
    }

    return parseFloat(result.rows[0].max);
  }

  async getMin(location: string, filter?: WeatherFilter): Promise<number | null> {
    let query = `SELECT MIN(temperature) as min FROM weather WHERE location = $1`;
    const params: any[] = [location];
    let paramIndex = 2;

    if (filter?.from) {
      query += ` AND date > $${paramIndex}`;
      params.push(filter.from);
      paramIndex++;
    }

    if (filter?.to) {
      query += ` AND date < $${paramIndex}`;
      params.push(filter.to);
      paramIndex++;
    }

    const result: pg.QueryResult = await this.pool.query(query, params);

    if (result.rows.length === 0 || result.rows[0].min === null) {
      return null;
    }

    return parseFloat(result.rows[0].min);
  }

  async getAllWeatherData(): Promise<WeatherData[]> {
    const query = 'SELECT * FROM weather';
    const result: pg.QueryResult = await this.pool.query(query);
    return result.rows as WeatherData[];
  }
}

export default new WeatherDataRepository();