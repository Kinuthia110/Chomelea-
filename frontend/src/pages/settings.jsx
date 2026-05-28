import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar.jsx";

const themes = {
  orange: {
    name: "Industrial Orange",
    primary: "#F97316",
    background: "#0D1117",
    card: "#161B22"
  },

  blue: {
    name: "Steel Blue",
    primary: "#3B82F6",
    background: "#0B1220",
    card: "#111827"
  },

  green: {
    name: "Workshop Green",
    primary: "#22C55E",
    background: "#07130D",
    card: "#0F172A"
  },

  red: {
    name: "Forge Red",
    primary: "#EF4444",
    background: "#140909",
    card: "#1F1111"
  }
};

function Settings() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [selectedTheme, setSelectedTheme] =
    useState(
      localStorage.getItem("theme") || "orange"
    );

  useEffect(() => {
    applyTheme(selectedTheme);
  }, [selectedTheme]);

  const applyTheme = (themeKey) => {
    const theme = themes[themeKey];

    document.documentElement.style.setProperty(
      "--primary-color",
      theme.primary
    );

    document.documentElement.style.setProperty(
      "--background-color",
      theme.background
    );

    document.documentElement.style.setProperty(
      "--card-color",
      theme.card
    );

    localStorage.setItem("theme", themeKey);
  };

  const changeTheme = (themeKey) => {
    setSelectedTheme(themeKey);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen text-white flex"
      style={{
        backgroundColor: "var(--background-color)"
      }}
    >
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 overflow-x-hidden">
        <h1
          className="text-4xl font-bold"
          style={{
            color: "var(--primary-color)"
          }}
        >
          Settings
        </h1>

        <p className="text-gray-400 mt-2">
          Manage account and system preferences.
        </p>

        <section
          className="border border-gray-800 rounded-2xl p-6 mt-8"
          style={{
            backgroundColor: "var(--card-color)"
          }}
        >
          <h2 className="text-2xl font-bold mb-4">
            Account Profile
          </h2>

          <div className="space-y-4">
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor:
                  "var(--background-color)"
              }}
            >
              <p className="text-gray-400">Name</p>

              <p className="text-xl font-bold">
                {user.fullName || "-"}
              </p>
            </div>

            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor:
                  "var(--background-color)"
              }}
            >
              <p className="text-gray-400">Email</p>

              <p className="text-xl font-bold">
                {user.email || "-"}
              </p>
            </div>

            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor:
                  "var(--background-color)"
              }}
            >
              <p className="text-gray-400">Role</p>

              <p
                className="text-xl font-bold"
                style={{
                  color:
                    "var(--primary-color)"
                }}
              >
                {user.role || "-"}
              </p>
            </div>
          </div>
        </section>

        <section
          className="border border-gray-800 rounded-2xl p-6 mt-8"
          style={{
            backgroundColor: "var(--card-color)"
          }}
        >
          <h2 className="text-2xl font-bold mb-6">
            Theme Colors
          </h2>

         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(themes).map(
              ([key, theme]) => (
                <button
                  key={key}
                  onClick={() =>
                    changeTheme(key)
                  }
                  className={`p-5 rounded-2xl border-2 transition-all ${
                    selectedTheme === key
                      ? "border-white scale-105"
                      : "border-transparent"
                  }`}
                  style={{
                    backgroundColor:
                      theme.card
                  }}
                >
                  <div
                    className="w-full h-16 rounded-xl"
                    style={{
                      backgroundColor:
                        theme.primary
                    }}
                  />

                  <p className="mt-4 font-bold">
                    {theme.name}
                  </p>
                </button>
              )
            )}
          </div>
        </section>

        <section
          className="border border-gray-800 rounded-2xl p-6 mt-8"
          style={{
            backgroundColor: "var(--card-color)"
          }}
        >
          <h2 className="text-2xl font-bold mb-4">
            Security
          </h2>

          <button
            onClick={logout}
            className="px-5 py-3 rounded-lg font-bold text-white"
            style={{
              backgroundColor:
                "var(--primary-color)"
            }}
          >
            Logout
          </button>
        </section>
      </main>
    </div>
  );
}

export default Settings;