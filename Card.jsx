export default function Card({ title, value, unit, color }) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      <div className="flex items-baseline space-x-1">
        <span className={`text-3xl font-bold ${color}`}>{value}</span>
        <span className="text-lg text-gray-500">{unit}</span>
      </div>
    </div>
  );
}