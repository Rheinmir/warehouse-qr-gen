import React, { useState, useMemo, useRef } from "react";
import {
  Package,
  Download,
  Grid,
  Database,
  FileText,
  QrCode,
  Loader2,
  Settings2,
  List,
  Image,
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import JSZip from "jszip";

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
  // Ref for PNG export
  const previewRef = useRef(null);
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
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);

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

          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
            id,
          )}`;

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

  const getCSVBlob = () => {
    const headers = ["Kho", "Kệ", "Tầng", "Hàng", "Mã Vị Trí", "Link QR Code"];
    const csvContent = [
      headers.join(","),
      ...positions.map(
        (p) =>
          `"${p.warehouse}","${p.rack}","${p.level}","${p.row}","${p.code}","${p.qrUrl}"`,
      ),
    ].join("\n");

    return new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
  };

  const exportToCSV = () => {
    const blob = getCSVBlob();
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

  const getPDFBlob = async () => {
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const itemsPerPage = 12;
    const margin = 10;
    const cardWidth = 60;
    const cardHeight = 60;
    const gap = 5;
    const qrSize = 25; // QR code size in mm

    // Helper function to load image as base64
    const loadImageAsBase64 = async (url) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("Failed to load QR image:", error);
        return null;
      }
    };

    for (let i = 0; i < positions.length; i++) {
      const item = positions[i];
      const pageIdx = i % itemsPerPage;
      if (i > 0 && pageIdx === 0) doc.addPage();
      const col = pageIdx % 3;
      const row = Math.floor(pageIdx / 3);
      const x = margin + col * (cardWidth + gap);
      const y = margin + row * (cardHeight + gap);

      // Draw border
      doc.setDrawColor(200, 200, 200);
      doc.rect(x, y, cardWidth, cardHeight);

      // Warehouse Name (Top)
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(item.warehouse, x + cardWidth / 2, y + 4, {
        align: "center",
        baseline: "top",
      });

      // QR Code (Center)
      const qrBase64 = await loadImageAsBase64(item.qrUrl);
      if (qrBase64) {
        const qrX = x + (cardWidth - qrSize) / 2;
        const qrY = y + 8;
        doc.addImage(qrBase64, "PNG", qrX, qrY, qrSize, qrSize);
      }

      // Code (Below QR)
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, "bold");
      const codeLines = doc.splitTextToSize(item.code, 55);
      const codeY = y + 8 + qrSize + 2;
      doc.text(codeLines, x + cardWidth / 2, codeY, {
        align: "center",
        baseline: "top",
      });

      // Info (Bottom)
      doc.setFontSize(7);
      doc.setFont(undefined, "normal");
      doc.text(
        `Kệ: ${item.rack} | Tầng: ${item.level} | Hàng: ${item.row}`,
        x + cardWidth / 2,
        y + cardHeight - 3,
        { align: "center", baseline: "bottom" },
      );
    }
    return doc.output("blob");
  };

  const exportToPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const blob = await getPDFBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Nhan_Kho_${config.warehouseName}.pdf`;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const getPNGBlob = async () => {
    if (!previewRef.current) return null;
    const canvas = await html2canvas(previewRef.current, {
      scale: 2, // Higher quality
      backgroundColor: "#ffffff",
    });
    return new Promise((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });
  };

  // Generate individual QR card as canvas
  const generateQRCard = async (item, logoUrl = "/CTD.png") => {
    const cardWidth = 320;
    const cardHeight = 340; // Compact - no extra space
    const padding = 12; // Tight padding
    const canvas = document.createElement("canvas");
    canvas.width = cardWidth * 2; // 2x for high quality
    canvas.height = cardHeight * 2;
    const ctx = canvas.getContext("2d");
    const scale = 2;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle border
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 2 * scale;
    ctx.strokeRect(
      scale,
      scale,
      canvas.width - 2 * scale,
      canvas.height - 2 * scale,
    );

    // === LOGO at top (centered) ===
    const logoHeight = 52 * scale; // Larger for sharper quality
    const logoY = padding * scale;
    try {
      const logoImg = new window.Image();
      logoImg.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
        logoImg.src = logoUrl;
      });
      // Calculate width to maintain aspect ratio
      const logoAspect = logoImg.width / logoImg.height;
      const logoW = logoHeight * logoAspect;
      const logoX = (canvas.width - logoW) / 2;
      // High quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(logoImg, logoX, logoY, logoW, logoHeight);
    } catch (err) {
      console.error("Failed to load logo:", err);
    }

    // === Warehouse name (below logo, close to QR) ===
    const warehouseY = logoY + logoHeight + 16 * scale;
    ctx.fillStyle = "#6b7280";
    ctx.font = `300 ${12 * scale}px 'Lexend Deca', sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(item.warehouse, canvas.width / 2, warehouseY);

    // === QR Code (centered) ===
    const qrSize = 160 * scale;
    const qrX = (canvas.width - qrSize) / 2;
    const qrY = warehouseY + 12 * scale; // Close to warehouse name
    try {
      const qrImg = new window.Image();
      qrImg.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
        qrImg.src = item.qrUrl;
      });
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    } catch (err) {
      console.error("Failed to load QR for:", item.code);
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(qrX, qrY, qrSize, qrSize);
      ctx.fillStyle = "#9ca3af";
      ctx.font = `300 ${12 * scale}px 'Lexend Deca', sans-serif`;
      ctx.fillText("QR Error", canvas.width / 2, qrY + qrSize / 2);
    }

    // === Bottom section: 2 lines compact right below QR ===
    const textGap = 16 * scale; // Gap after QR
    const lineHeight = 22 * scale; // Space between 2 lines

    // Code line (right below QR)
    const codeY = qrY + qrSize + textGap + 14 * scale;
    ctx.fillStyle = "#111827";
    ctx.font = `500 ${14 * scale}px 'Lexend Deca', sans-serif`;
    ctx.textAlign = "center";

    // Measure and shrink if too long
    const maxWidth = (cardWidth - padding * 2) * scale;
    const codeText = item.code;
    if (ctx.measureText(codeText).width > maxWidth) {
      ctx.font = `500 ${11 * scale}px 'Lexend Deca', sans-serif`;
    }
    ctx.fillText(codeText, canvas.width / 2, codeY);

    // Info line (below code line)
    const infoY = codeY + lineHeight;
    ctx.fillStyle = "#9ca3af";
    ctx.font = `300 ${11 * scale}px 'Lexend Deca', sans-serif`;
    ctx.fillText(
      `Kệ: ${item.rack}  •  Tầng: ${item.level}  •  Hàng: ${item.row}`,
      canvas.width / 2,
      infoY,
    );

    return new Promise((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });
  };

  const exportToPNG = async () => {
    setIsGeneratingPng(true);
    try {
      const zip = new JSZip();
      const pngFolder = zip.folder("qr_images");

      // Process in batches to avoid overwhelming the browser
      const batchSize = 20;
      for (let i = 0; i < positions.length; i += batchSize) {
        const batch = positions.slice(i, i + batchSize);
        const promises = batch.map(async (item, idx) => {
          const blob = await generateQRCard(item);
          if (blob) {
            const fileName = `${item.code.replace(/[/\\?%*:|"<>]/g, "_")}.png`;
            pngFolder.file(fileName, blob);
          }
        });
        await Promise.all(promises);
      }

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `QR_Batch_${Date.now()}.zip`;
      link.click();
    } catch (err) {
      console.error("PNG export failed:", err);
    } finally {
      setIsGeneratingPng(false);
    }
  };

  const exportToZIP = async () => {
    setIsGeneratingZip(true);
    try {
      const zip = new JSZip();

      // Add CSV
      zip.file(`danh_sach_vi_tri_${config.warehouseName}.csv`, getCSVBlob());

      // Add PDF
      zip.file(`Nhan_Kho_${config.warehouseName}.pdf`, await getPDFBlob());

      // Add ALL PNG images in subfolder
      const pngFolder = zip.folder("qr_images");
      const batchSize = 20;
      for (let i = 0; i < positions.length; i += batchSize) {
        const batch = positions.slice(i, i + batchSize);
        const promises = batch.map(async (item) => {
          const blob = await generateQRCard(item);
          if (blob) {
            const fileName = `${item.code.replace(/[/\\?%*:|"<>]/g, "_")}.png`;
            pngFolder.file(fileName, blob);
          }
        });
        await Promise.all(promises);
      }

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `QRgen_Pack_${config.warehouseName}.zip`;
      link.click();
    } catch (err) {
      console.error("ZIP export failed:", err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10 flex justify-center">
      <div className="max-w-7xl w-full space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200/60">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 flex items-center gap-3">
              <Package className="text-blue-500" strokeWidth={2} />
              Quản lý Nhãn Vị Trí Kho
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              className="mac-button bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 flex items-center gap-2"
            >
              <Download size={16} /> CSV
            </button>
            <button
              onClick={exportToPNG}
              disabled={isGeneratingPng}
              className="mac-button bg-purple-500 text-white hover:bg-purple-600 border-transparent shadow-purple-500/20 shadow-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGeneratingPng ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Image size={16} />
              )}
              Xuất PNG ({positions.length})
            </button>
            <button
              onClick={exportToPDF}
              disabled={isGeneratingPdf}
              className="mac-button bg-blue-500 text-white hover:bg-blue-600 border-transparent shadow-blue-500/20 shadow-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGeneratingPdf ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <FileText size={16} />
              )}
              Xuất PDF
            </button>
            <button
              onClick={exportToZIP}
              disabled={isGeneratingZip}
              className="mac-button bg-green-500 text-white hover:bg-green-600 border-transparent shadow-green-500/20 shadow-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGeneratingZip ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Package size={16} />
              )}
              Xuất ZIP
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Settings Side Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass rounded-2xl p-6 border border-white/40 shadow-xl shadow-gray-200/40">
              <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Settings2 size={18} className="text-gray-500" />
                Cấu hình
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Tên Kho
                  </label>
                  <input
                    type="text"
                    name="warehouseName"
                    value={config.warehouseName}
                    onChange={handleInputChange}
                    className="mac-input w-full"
                    placeholder="Nhập tên kho..."
                  />
                </div>

                {["rack", "level", "row"].map((field) => (
                  <div
                    key={field}
                    className="p-4 bg-gray-50/50 rounded-xl border border-gray-100/60"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        {field === "rack"
                          ? "Kệ (Rack)"
                          : field === "level"
                            ? "Tầng (Level)"
                            : "Hàng (Row)"}
                      </label>
                      <button
                        onClick={() => toggleFormat(field)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
                          config[`${field}Format`] === "roman"
                            ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        }`}
                      >
                        {config[`${field}Format`] === "arabic" ? "123" : "III"}
                      </button>
                    </div>
                    <input
                      type="number"
                      name={`${field}s`}
                      value={config[`${field}s`]}
                      onChange={handleInputChange}
                      className="mac-input w-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Card - matches PNG export layout */}
            <div
              ref={previewRef}
              className="bg-white rounded-2xl p-4 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* Logo */}
              <img
                src="/CTD.png"
                alt="Logo"
                className="h-10 object-contain mb-2"
              />

              {/* Warehouse name */}
              <div
                className="text-xs text-gray-500 font-light mb-1"
                style={{ fontFamily: "'Lexend Deca', sans-serif" }}
              >
                {config.warehouseName}
              </div>

              {/* QR Code */}
              <div className="bg-white p-2 rounded-lg mb-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                    `${config.warehouseName}-${formatValue(1, "rack")}-${formatValue(config.levels, "level")}-${formatValue(1, "row")}`,
                  )}`}
                  alt="QR Preview"
                  className="w-32 h-32"
                />
              </div>

              {/* Position code */}
              <div
                className="text-sm font-medium text-gray-900 mb-1"
                style={{ fontFamily: "'Lexend Deca', sans-serif" }}
              >
                {config.warehouseName}-{formatValue(1, "rack")}-
                {formatValue(config.levels, "level")}-{formatValue(1, "row")}
              </div>

              {/* Info line */}
              <div
                className="text-xs text-gray-400 font-light"
                style={{ fontFamily: "'Lexend Deca', sans-serif" }}
              >
                Kệ: {formatValue(1, "rack")} • Tầng:{" "}
                {formatValue(config.levels, "level")} • Hàng:{" "}
                {formatValue(1, "row")}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/30 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100/50 rounded-lg text-blue-600">
                    <List size={20} />
                  </div>
                  <h2 className="text-base font-semibold text-gray-800">
                    Danh sách mã định danh
                  </h2>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {positions.length} vị trí
                </span>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-left bg-gray-50/50">
                      <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        Mã Vị Trí
                      </th>
                      <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        QR Code
                      </th>
                      <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        Kệ
                      </th>
                      <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        Tầng
                      </th>
                      <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        Hàng
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {positions.slice(0, previewLimit).map((item, idx) => (
                      <tr
                        key={idx}
                        className="group hover:bg-blue-50/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm font-medium text-gray-700 bg-gray-100/50 px-2 py-1 rounded inline-block group-hover:bg-white group-hover:shadow-sm transition-all">
                            {item.code}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <img
                            src={item.qrUrl}
                            alt="QR"
                            className="w-8 h-8 rounded border border-gray-100 bg-white p-0.5"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 font-medium">
                            {item.rack}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-600 rounded-md border border-blue-100/50">
                            {item.level}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100/50">
                            {item.row}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {positions.length > previewLimit && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/30 text-center">
                  <button
                    onClick={() => setPreviewLimit((prev) => prev + 20)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all"
                  >
                    Hiển thị thêm...
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
