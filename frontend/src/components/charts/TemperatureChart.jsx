import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from "recharts";

function TemperatureChart({ data }) {
    return (
        <div style={{ width: "100%", height: 360 }}>
        <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 10,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="observed_date"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickMargin={10}
            minTickGap={24}
          />

          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickMargin={10}
            unit="°C"
          />

          <Tooltip
            formatter={(value) => [`${value} °C`, "Средняя температура"]}
            labelFormatter={(label) => `Дата: ${label}`}
          />

          <Line
            type="monotone"
            dataKey="temperature_2m_mean"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
        </div>
    );
}

export default TemperatureChart;
