import TemperatureChart from "../components/charts/TemperatureChart";

function CityWeatherPage() {
  return (
    <div>
      <h1>City weather</h1>
      <TemperatureChart data={chartData} />
    </div>
  );
}
export default CityWeatherPage