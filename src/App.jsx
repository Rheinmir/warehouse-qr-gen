import React, { useState, useMemo } from "react";
import {
  Package,
  Download,
  Grid,
  Database,
  FileText,
  QrCode,
  Loader2,
  Settings2,
} from "lucide-react";
import { jsPDF } from "jspdf";

// Hàm chuyển đổi số sang số La Mã
const toRoman = (num) => {
  if (isNaN(num)) return num;
  const lookup = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };
  let roman = "";
  for (let i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman || "0";
};

const App = () => {
  // State for configuration
  const [config, setConfig] = useState({
    warehouseName: "Kho 2(miền Nam, new)",
    racks: 10,
    levels: 4,
    rows: 5,
    rackFormat: "roman", // 'arabic' or 'roman'
    levelFormat: "arabic", // 'arabic' or 'roman'
    rowFormat: "arabic", // 'arabic' or 'roman'
  });

  const [previewLimit, setPreviewLimit] = useState(10);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Helper to format numbers based on config
  const formatValue = (val, type) => {
    const format = config[`${type}Format`];
    if (format === "roman") {
      return toRoman(val);
    }
    return val.toString().padStart(2, "0");
  };

  // Calculate positions
  const positions = useMemo(() => {
    const list = [];
    for (let k = 1; k <= config.racks; k++) {
      for (let t = config.levels; t >= 1; t--) {
        for (let h = 1; h <= config.rows; h++) {
          const rLabel = formatValue(k, "rack");
          const tLabel = formatValue(t, "level");
          const hLabel = formatValue(h, "row");

          // Định dạng: Tên Kho-Kệ-Tầng-Hàng
          const id = `${config.warehouseName}-${rLabel}-${tLabel}-${hLabel}`;

          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(id)}`;

          list.push({
            warehouse: config.warehouseName,
            rack: rLabel,
            level: tLabel,
            row: hLabel,
            code: id,
            qrUrl: qrUrl,
          });
        }
      }
    }
    return list;
  }, [config]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const toggleFormat = (field) => {
    const key = `${field}Format`;
    setConfig((prev) => ({
      ...prev,
      [key]: prev[key] === "arabic" ? "roman" : "arabic",
    }));
  };

  const exportToCSV = () => {
    // Đã sửa đổi: Thay thế "Trạng thái" bằng "Link QR Code"
    const headers = ["Kho", "Kệ", "Tầng", "Hàng", "Mã Vị Trí", "Link QR Code"];
    const csvContent = [
      headers.join(","),
      ...positions.map(
        (p) =>
          `"${p.warehouse}","${p.rack}","${p.level}","${p.row}","${p.code}","${p.qrUrl}"`,
      ),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `danh_sach_vi_tri_${config.warehouseName.replace(/\s+/g, "_")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      // Create new jsPDF instance
      const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const itemsPerPage = 12;
      const margin = 10;
      const cardWidth = 60;
      const cardHeight = 60;
      const gap = 5;

      for (let i = 0; i < positions.length; i++) {
        const item = positions[i];
        const pageIdx = i % itemsPerPage;
        if (i > 0 && pageIdx === 0) doc.addPage();
        const col = pageIdx % 3;
        const row = Math.floor(pageIdx / 3);
        const x = margin + col * (cardWidth + gap);
        const y = margin + row * (cardHeight + gap);

        doc.setDrawColor(200, 200, 200);
        doc.rect(x, y, cardWidth, cardHeight);
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text(item.warehouse, x + cardWidth / 2, y + 5, {
          align: "center",
          maxWidth: 50,
        });
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, "bold");
        doc.text(item.code, x + cardWidth / 2, y + 15, {
          align: "center",
          maxWidth: 55,
        });
        doc.setFontSize(8);
        doc.setFont(undefined, "normal");
        doc.text(
          `Kệ: ${item.rack} | Tầng: ${item.level} | Hàng: ${item.row}`,
          x + cardWidth / 2,
          y + 55,
          { align: "center" },
        );
      }
      doc.save(`Nhan_Kho_${config.warehouseName}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
              <Package className="text-blue-600" />
              Quản lý Nhãn Vị Trí Kho
            </h1>
            <p className="text-slate-500 mt-1">
              Định dạng linh hoạt số thập phân & số La Mã
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm"
            >
              <Download size={18} /> CSV
            </button>
            <button
              onClick={exportToPDF}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg"
            >
              {isGeneratingPdf ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <FileText size={18} />
              )}
              Xuất PDF
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 border-b pb-2 text-slate-700">
                <Settings2 size={18} /> Cấu hình định dạng
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                    Tên Kho hiển thị
                  </label>
                  <input
                    type="text"
                    name="warehouseName"
                    value={config.warehouseName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Rack Config */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Kệ (Rack)
                    </label>
                    <button
                      onClick={() => toggleFormat("rack")}
                      className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-200"
                    >
                      {config.rackFormat === "arabic"
                        ? "1, 2, 3..."
                        : "I, II, III..."}
                    </button>
                  </div>
                  <input
                    type="number"
                    name="racks"
                    value={config.racks}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md outline-none"
                  />
                </div>

                {/* Level Config */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Tầng (Level)
                    </label>
                    <button
                      onClick={() => toggleFormat("level")}
                      className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-200"
                    >
                      {config.levelFormat === "arabic"
                        ? "1, 2, 3..."
                        : "I, II, III..."}
                    </button>
                  </div>
                  <input
                    type="number"
                    name="levels"
                    value={config.levels}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md outline-none"
                  />
                </div>

                {/* Row Config */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Hàng (Row)
                    </label>
                    <button
                      onClick={() => toggleFormat("row")}
                      className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-200"
                    >
                      {config.rowFormat === "arabic"
                        ? "1, 2, 3..."
                        : "I, II, III..."}
                    </button>
                  </div>
                  <input
                    type="number"
                    name="rows"
                    value={config.rows}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl shadow-lg text-white">
              <h2 className="text-xs font-semibold opacity-60 mb-4 uppercase tracking-widest">
                Mẫu nhãn hiện tại
              </h2>
              <div className="bg-white p-5 rounded-xl flex flex-col items-center shadow-inner text-slate-900">
                <div className="w-24 h-24 mb-3">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${config.warehouseName}-${formatValue(1, "rack")}-${formatValue(config.levels, "level")}-${formatValue(1, "row")}`)}`}
                    alt="QR"
                  />
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-bold text-slate-400 truncate w-40">
                    {config.warehouseName}
                  </div>
                  <div className="text-sm font-black mt-1">
                    {formatValue(1, "rack")}-
                    {formatValue(config.levels, "level")}-
                    {formatValue(1, "row")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-white">
                <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                  <Grid size={18} className="text-blue-500" />
                  Danh sách vị trí ({positions.length} mã)
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                      <th className="px-6 py-4">Mã Vị Trí</th>
                      <th className="px-6 py-4">QR</th>
                      <th className="px-6 py-4">Kệ</th>
                      <th className="px-6 py-4">Tầng</th>
                      <th className="px-6 py-4">Hàng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {positions.slice(0, previewLimit).map((item, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-blue-50/20 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">
                          {item.code}
                        </td>
                        <td className="px-6 py-4">
                          <img
                            src={item.qrUrl}
                            alt="QR"
                            className="w-10 h-10 border rounded shadow-sm bg-white"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                            {item.rack}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                            {item.level}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs">
                            {item.row}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {positions.length > previewLimit && (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-6 text-center bg-slate-50/30"
                        >
                          <button
                            onClick={() => setPreviewLimit((prev) => prev + 20)}
                            className="text-sm font-bold text-blue-600 hover:underline"
                          >
                            + Hiển thị thêm vị trí
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
