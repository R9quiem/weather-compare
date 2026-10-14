import { describe, expect, it, vi } from "vitest";
import type { City, DailyWeather, WeatherState } from "../types/weather.ts";
import {
    aggregateDailyDataByMonth,
    MONTH_EDGES,
} from "../components/charts/ClimateChart/chartUtils.ts";
import { prepareMonthlyPrecipitation } from "../components/charts/PrecipitationChart/precipitationUtils.ts";
import {
    addTemperatureRange,
    getTemperatureDomain,
} from "../components/charts/TemperatureChart/temperatureUtils.ts";
import { calculateWindSummary } from "../components/charts/WindChart/windUtils.ts";
import { calculateClimateSummary } from "../pages/CityWeatherPage/climateSummary.ts";
import { calculateComparisonSummary } from "../pages/WeatherComparePage/compareSummary.ts";
import { addApparentTemperature } from "../pages/CityWeatherPage/metricInsights.ts";

vi.mock("../i18n.ts", () => ({
    default: { resolvedLanguage: "en", t: (key: string) => key },
}));

function day(overrides: Partial<DailyWeather> = {}): DailyWeather {
    return {
        city_id: 1,
        observed_date: "01-01",
        temperature_2m_mean: 10,
        temperature_2m_min: 5,
        temperature_2m_max: 15,
        apparent_temperature_mean: null,
        precipitation_sum: 2,
        cloud_cover_mean: 40,
        sunshine_duration_sum: 100,
        relative_humidity_2m_mean: 70,
        wind_speed_10m_mean: 18,
        wind_direction_10m_dominant: 90,
        wind_gusts_10m_max: 25,
        ...overrides,
    };
}

function weather(data: DailyWeather[]): WeatherState {
    return { data, windRose: [], cloudCover: [], isLoading: false, error: null };
}

const firstCity: City = {
    id: 1,
    name: "First",
    slug: "first",
    country_code: "RU",
    latitude: 0,
    longitude: 0,
};
const secondCity: City = { ...firstCity, id: 2, name: "Second", slug: "second" };

describe("climate calculations after the TypeScript migration", () => {
    it("keeps February 29 and averages ranges without counting missing values", () => {
        const points = [
            { observed_date: "02-28", value: 10, range: [null, 20] },
            { observed_date: "02-29", value: null, range: [4, 30] },
            { observed_date: "03-01", value: 15, range: [5, 25] },
        ];
        expect(MONTH_EDGES).toContain("02-01");
        expect(aggregateDailyDataByMonth(points)).toEqual([
            { observed_date: "02-15", _isMonthlyAggregate: true, value: 10, range: [4, 25] },
            { observed_date: "03-15", _isMonthlyAggregate: true, value: 15, range: [5, 25] },
        ]);
    });

    it("sums monthly precipitation, including leap day and empty months", () => {
        const result = prepareMonthlyPrecipitation([
            day({ observed_date: "02-28", precipitation_sum: 3 }),
            day({ observed_date: "02-29", precipitation_sum: 7 }),
            day({ observed_date: "03-01", precipitation_sum: null }),
        ]);
        expect(result.data).toHaveLength(12);
        expect(result.data[1].precipitation).toBe(10);
        expect(result.data[2].precipitation).toBe(0);
        expect(result.monthlyAverage).toBeCloseTo(10 / 12);
        expect(result.yDomain).toEqual([0, 20]);
    });

    it("keeps missing temperatures in range data and derives the axis from extrema", () => {
        const data = addTemperatureRange([
            day({ temperature_2m_min: null }),
            day({ temperature_2m_max: 25 }),
        ]);
        expect(data[0].temperatureRange).toEqual([null, 15]);
        expect(
            getTemperatureDomain(data, [
                {
                    id: "test",
                    meanKey: "temperature_2m_mean",
                    minKey: "temperature_2m_min",
                    maxKey: "temperature_2m_max",
                    rangeKey: "temperatureRange",
                },
            ])
        ).toEqual([-2, 27]);
    });

    it("ignores missing wind values and keeps a useful domain for empty data", () => {
        expect(calculateWindSummary([])).toEqual({ annualAverage: null, yDomain: [0, 10] });
        expect(
            calculateWindSummary([
                day({ wind_speed_10m_mean: null }),
                day({ wind_speed_10m_mean: 20 }),
            ])
        ).toEqual({ annualAverage: 20, yDomain: [0, 25] });
    });

    it("retains annual totals and monthly humidity limits", () => {
        const result = calculateClimateSummary([
            day({ observed_date: "01-01", relative_humidity_2m_mean: 60, precipitation_sum: 3 }),
            day({ observed_date: "02-01", relative_humidity_2m_mean: 80, precipitation_sum: 7 }),
        ]);
        expect(result).toMatchObject({
            annualMean: 10,
            annualHumidity: 70,
            monthlyHumidityMin: 60,
            monthlyHumidityMax: 80,
            annualPrecipitation: 10,
            wettestMonthIndex: 1,
        });
        expect(calculateClimateSummary([])).toBeNull();
    });

    it("selects the comparison leader, handles ties and reports missing data", () => {
        const compare = (a: DailyWeather[], b: DailyWeather[]) =>
            calculateComparisonSummary(
                "temperature",
                weather(a),
                weather(b),
                firstCity,
                secondCity
            );
        expect(compare([day({ temperature_2m_mean: 20 })], [day()])).toMatchObject({
            leader: firstCity,
            difference: 10,
            leaderSide: "first",
            differenceIntensity: 1,
        });
        expect(compare([day()], [day({ temperature_2m_mean: 10.02 })])).toMatchObject({
            leader: null,
            isTie: true,
            leaderSide: "neutral",
        });
        expect(compare([], [day()])).toMatchObject({
            leader: null,
            difference: null,
            leaderSide: "neutral",
        });
    });

    it("uses an existing apparent temperature and does not calculate with missing inputs", () => {
        const result = addApparentTemperature([
            day({ apparent_temperature_mean: 4 }),
            day({ relative_humidity_2m_mean: null }),
            day(),
        ]);
        expect(result[0].apparent_temperature_mean).toBe(4);
        expect(result[1].apparent_temperature_mean).toBeNull();
        expect(result[2].apparent_temperature_mean).toBeCloseTo(5.332, 3);
    });
});
