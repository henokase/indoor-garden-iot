import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function HistoryChart({ title, data, dataKey, unit, color, isLoading }) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const chartData = Array.isArray(data) ? data : [];

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
      layout
    >
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="h-[300px]">
        <AnimatePresence mode="wait">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(time) => new Date(time).toLocaleTimeString()} 
              />
              <YAxis unit={unit} />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleString()}
                formatter={(value) => [`${value}${unit}`, dataKey]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                dot={false}
                animationDuration={300}
              />
            </LineChart>
          </ResponsiveContainer>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default HistoryChart; 