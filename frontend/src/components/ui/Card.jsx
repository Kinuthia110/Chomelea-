function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-[#161B22] border border-gray-800 rounded-2xl p-6 shadow-lg shadow-black/20 ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;