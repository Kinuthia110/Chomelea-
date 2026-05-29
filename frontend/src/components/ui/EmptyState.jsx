function EmptyState({ title = "No data found", message = "Create your first record to get started." }) {
  return (
    <div className="bg-[#0D1117] border border-dashed border-gray-700 rounded-2xl p-8 text-center">
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-gray-400 mt-2">{message}</p>
    </div>
  );
}

export default EmptyState;