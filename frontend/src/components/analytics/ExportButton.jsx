import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, FileSpreadsheet, Check } from "lucide-react";
import { exportToCSV, exportToPDF } from "../../lib/export";

function ExportButton({ dateRange, data }) {
    const [showOptions, setShowOptions] = useState(false);
    const [exportStatus, setExportStatus] = useState(null);
    const exportRef = useRef(null);

    const handleExport = async (format) => {
        setExportStatus("loading");
        try {
            if (format === "csv") {
                await exportToCSV(data, dateRange);
            } else {
                await exportToPDF(data, dateRange);
            }
            setExportStatus("success");
            setTimeout(() => setExportStatus(null), 2000);
        } catch (error) {
            setExportStatus("error");
            setTimeout(() => setExportStatus(null), 2000);
        }
        setShowOptions(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                exportRef.current &&
                !exportRef.current.contains(event.target)
            ) {
                setShowOptions(false);
            }
        };
        document.addEventListener("click", handleClickOutside)
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative">
            <motion.button
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                    e.stopPropagation()
                    setShowOptions(!showOptions)
                }}
            >
                <Download className="w-4 h-4" />
                <span>Export</span>
            </motion.button>

            <AnimatePresence>
                {showOptions && (
                    <motion.div
                        ref={exportRef}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <button
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleExport("csv")}
                        >
                            <FileSpreadsheet className="w-4 h-4 dark:text-gray-200" />
                            <span className="dark:text-gray-200">
                                Export as CSV
                            </span>
                        </button>
                        <button
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleExport("pdf")}
                        >
                            <FileText className="w-4 h-4 dark:text-gray-200" />
                            <span className="dark:text-gray-200">
                                Export as PDF
                            </span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {exportStatus && (
                    <motion.div
                        className="absolute right-0 mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {exportStatus === "loading" ? (
                            <span>Exporting...</span>
                        ) : exportStatus === "success" ? (
                            <span className="flex items-center gap-2 text-green-500">
                                <Check className="w-4 h-4" />
                                Export complete
                            </span>
                        ) : (
                            <span className="text-red-500">Export failed</span>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ExportButton;
