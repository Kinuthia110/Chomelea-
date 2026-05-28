import { useState } from "react";
import Sidebar from "../components/sidebar.jsx";

function FileUploads() {
  const [file, setFile] = useState(null);
  const [folder, setFolder] = useState("chomelea/projects");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);

    setUploading(true);

    try {
      const response = await fetch("http://localhost:5000/api/uploads/image", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setUploadedUrl(data.url);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white flex">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6">
        <h1 className="text-4xl font-bold text-orange-500">File Uploads</h1>

        <p className="text-gray-400 mt-2">
          Upload project images, receipts, and fabrication photos.
        </p>

        <form
          onSubmit={handleUpload}
          className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 mt-8 space-y-4"
        >
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#0D1117] border border-gray-700"
          >
            <option value="chomelea/projects">Project Images</option>
            <option value="chomelea/receipts">Receipts</option>
            <option value="chomelea/gallery">Gallery</option>
            <option value="chomelea/profiles">Profile Images</option>
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full p-3 rounded-lg bg-[#0D1117] border border-gray-700"
          />

          <button
            disabled={uploading}
            className="w-full bg-orange-500 hover:bg-orange-600 p-3 rounded-lg font-bold disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
        </form>

        {uploadedUrl && (
          <section className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 mt-8">
            <h2 className="text-2xl font-bold mb-4">Uploaded Image</h2>

            <img
              src={uploadedUrl}
              alt="Uploaded"
              className="max-w-md w-full rounded-xl border border-gray-700"
            />

            <p className="text-gray-400 mt-4 break-all">{uploadedUrl}</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default FileUploads;