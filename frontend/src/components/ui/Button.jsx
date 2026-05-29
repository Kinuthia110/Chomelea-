function Button({ children, type = "button", onClick, disabled, variant = "primary", className = "" }) {
  const styles = {
    primary: "bg-orange-500 hover:bg-orange-600 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    success: "bg-green-500 hover:bg-green-600 text-white",
    dark: "bg-[#0D1117] hover:bg-gray-900 text-white border border-gray-700"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;