function Loading({ text = "Loading..." }) {
  return (
    <div className="animate-pulse bg-[#161B22] border border-gray-800 rounded-2xl p-6 text-gray-400">
      {text}
    </div>
  );
}

export default Loading;