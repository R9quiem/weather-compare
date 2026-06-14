import {XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line} from 'recharts';

function TemperatureChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="temperature_2m_mean"
          stroke="#2563eb"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default TemperatureChart;
