import { z } from 'zod';

export const WeatherDataSchema = z.object({
  location: z.string(),
  date: z.coerce.date(),
  temperature: z.coerce.number(),
  humidity: z.coerce.number(),
});

export type WeatherData = z.infer<typeof WeatherDataSchema>;

export const WeatherDataBatchSchema = z.array(WeatherDataSchema).min(1).max(1000);

export type WeatherDataBatch = z.infer<typeof WeatherDataBatchSchema>;

export const WeatherFilterSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().min(1).max(1000).optional().default(100),
  offset: z.coerce.number().min(0).optional().default(0),
});

export type WeatherFilter = z.infer<typeof WeatherFilterSchema>;