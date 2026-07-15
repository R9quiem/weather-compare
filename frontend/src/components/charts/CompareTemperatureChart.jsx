import {Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,} from "recharts";

function CompareTemperatureChart({
                                     firstCityWeather,
                                     secondCityWeather,
                                     firstCityName,
                                     secondCityName,
                                 }) {


    if (firstCityWeather.length === 0 || secondCityWeather.length === 0) {
        return <p>Выберите два города для сравнения</p>;
    }

    const chartData = firstCityWeather.map((firstWeatherDay, index) => {
        const secondWeatherDay = secondCityWeather[index];

        return {
            observed_date: firstWeatherDay.observed_date,
            first_city_temperature: firstWeatherDay.temperature_2m_mean,
            first_city_temperature_min: firstWeatherDay.temperature_2m_min,
            first_city_temperature_max: firstWeatherDay.temperature_2m_max,
            first_city_range: [
                firstWeatherDay.temperature_2m_min,
                firstWeatherDay.temperature_2m_max,
            ],
            second_city_temperature: secondWeatherDay.temperature_2m_mean,
            second_city_temperature_min: secondWeatherDay.temperature_2m_min,
            second_city_temperature_max: secondWeatherDay.temperature_2m_max,
            second_city_range: [
                secondWeatherDay.temperature_2m_min,
                secondWeatherDay.temperature_2m_max,
            ],
        };
    });

    return (
        <div style={{width: "70%", height: 500}}>
            <ResponsiveContainer>
                <ComposedChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 10,
                        bottom: 20,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>

                    <XAxis
                        dataKey="observed_date"
                        tick={{fontSize: 12, fill: "#6b7280"}}
                        tickMargin={10}
                        minTickGap={24}
                    />

                    <YAxis
                        tick={{fontSize: 12, fill: "#6b7280"}}
                        tickMargin={10}
                        unit="°C"
                        domain={[
                            (dataMin) => Math.floor(dataMin - 1),
                            (dataMax) => Math.ceil(dataMax + 1),
                        ]}
                    />

                    <Tooltip
                        formatter={(value, name) => [
                            `${value} °C`,
                            name,
                        ]}
                        labelFormatter={(label) => `Дата: ${label}`}
                    />

                    <Legend/>

                    <Area
                        type="monotone"
                        dataKey="first_city_range"
                        name={`${firstCityName} — мин–макс`}
                        stroke="#2563eb"
                        fill="#2563eb"
                        fillOpacity={0.18}
                        strokeWidth={1}
                    />

                    <Area
                        type="monotone"
                        dataKey="second_city_range"
                        name={`${secondCityName} — мин–макс`}
                        stroke="#ea580c"
                        fill="#ea580c"
                        fillOpacity={0.18}
                        strokeWidth={1}
                    />

                    <Line
                        type="monotone"
                        dataKey="first_city_temperature"
                        name={`${firstCityName} — средняя`}
                        stroke="#2563eb"
                        strokeWidth={1}
                        strokeDasharray="4 2"
                        dot={false}
                        activeDot={{r: 5}}
                    />

                    <Line
                        type="monotone"
                        dataKey="second_city_temperature"
                        name={`${secondCityName} — средняя`}
                        stroke="#ea580c"
                        strokeWidth={1}
                        strokeDasharray="4 2"
                        dot={false}
                        activeDot={{r: 5}}
                    />

                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}

export default CompareTemperatureChart;