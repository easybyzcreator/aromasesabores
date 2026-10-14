import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Printer, ExternalLink, Copy, X, Settings2, Check, Scissors } from 'lucide-react';
import { toast } from 'sonner';
import { Order } from '../types';
import {
  PrinterWidth,
  PrinterFontSize,
  getSavedPrinterWidth,
  setSavedPrinterWidth,
  getSavedPrinterFontSize,
  setSavedPrinterFontSize,
  executeThermalPrint,
  getPrintCssRules,
} from '../utils/printReceipt';

export interface PrintReceiptData {
  title: string;
  htmlContent: string;
  textVersion: string;
  order?: Order;
}

interface PrintReceiptModalProps {
  activePrintReceipt: PrintReceiptData | null;
  onClose: () => void;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  activePrintReceipt,
  onClose,
}) => {
  const [printerWidth, setPrinterWidthState] = useState<PrinterWidth>('58mm');
  const [fontSize, setFontSizeState] = useState<PrinterFontSize>('standard');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setPrinterWidthState(getSavedPrinterWidth());
    setFontSizeState(getSavedPrinterFontSize());
  }, []);

  if (!activePrintReceipt) return null;

  const handleWidthChange = (width: PrinterWidth) => {
    setPrinterWidthState(width);
    setSavedPrinterWidth(width);
    toast.success(`Formato alterado para ${width === '58mm' ? '58mm (Mini Impressora)' : '80mm (Bobina Larga)'}`);
  };

  const handleFontSizeChange = (size: PrinterFontSize) => {
    setFontSizeState(size);
    setSavedPrinterFontSize(size);
  };

  const handleDirectPrint = () => {
    try {
      executeThermalPrint(activePrintReceipt.htmlContent, activePrintReceipt.title, {
        width: printerWidth,
        fontSize: fontSize,
      });
      toast.success('Enviando para a impressora...');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao acionar impressora.');
    }
  };

  const handleOpenPdfTab = () => {
    try {
      const css = getPrintCssRules(printerWidth, fontSize);
      const fullDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${activePrintReceipt.title}</title>
  <style>${css}</style>
</head>
<body>
  ${activePrintReceipt.htmlContent}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;
      const blob = new Blob([fullDoc], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error(err);
      window.print();
    }
  };

  const handleCopyText = () => {
    if (activePrintReceipt.textVersion) {
      navigator.clipboard.writeText(activePrintReceipt.textVersion);
      toast.success('Texto da comanda copiado!');
    }
  };

  // Preview container width based on selected profile
  const previewMaxWidth = printerWidth === '58mm' ? 'max-w-[270px]' : 'max-w-[360px]';
  const previewFontSize = 
    fontSize === 'compact' ? 'text-[10px]' : 
    fontSize === 'large' ? 'text-[12px]' : 'text-[11px]';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-gray-100 flex items-center justify-between bg-amber-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-800 text-white flex items-center justify-center shadow-xs">
              <Printer size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-sm">Comanda de Impressão</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  printerWidth === '58mm'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-blue-100 text-blue-800 border-blue-300'
                }`}>
                  {printerWidth === '58mm' ? '58mm Mini POS' : '80mm Padrão'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium truncate max-w-[240px]">
                {activePrintReceipt.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                showSettings ? 'bg-amber-200 text-amber-900' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
              title="Ajustes de Impressão"
            >
              <Settings2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printer Format & Font Controls Toolbar */}
        <div className="px-3.5 py-2.5 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Format selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-2xs">
            <button
              onClick={() => handleWidthChange('58mm')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all cursor-pointer ${
                printerWidth === '58mm'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Printer size={13} />
              <span>58mm (Mini Impressora)</span>
              {printerWidth === '58mm' && <Check size={12} className="ml-0.5" />}
            </button>

            <button
              onClick={() => handleWidthChange('80mm')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all cursor-pointer ${
                printerWidth === '80mm'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span>80mm</span>
              {printerWidth === '80mm' && <Check size={12} className="ml-0.5" />}
            </button>
          </div>

          {/* Font size selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-[11px] text-gray-500 font-medium px-1.5">Fonte:</span>
            <button
              onClick={() => handleFontSizeChange('compact')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                fontSize === 'compact'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              P
            </button>
            <button
              onClick={() => handleFontSizeChange('standard')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                fontSize === 'standard'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              M
            </button>
            <button
              onClick={() => handleFontSizeChange('large')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                fontSize === 'large'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              G
            </button>
          </div>
        </div>

        {/* Collapsible Info Note */}
        {showSettings && (
          <div className="p-3 bg-amber-50/80 border-b border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
            <span className="text-amber-800 font-bold shrink-0">💡 Dica:</span>
            <span>
              O modo <strong>58mm</strong> é ideal para mini impressoras térmicas portáteis ou desktop (como o modelo Elgin / POS-58 com bobina de 58mm). Ele ajusta a largura útil para 48mm, usa preto 100% monocromático e inclui margem de avanço para a serrilha de corte.
            </span>
          </div>
        )}

        {/* Thermal Receipt Body Preview */}
        <div className="p-4 overflow-y-auto flex-grow bg-neutral-200/80 flex flex-col items-center">
          <div className="text-[11px] text-gray-500 font-medium mb-1.5 flex items-center gap-1.5">
            <Scissors size={13} className="text-gray-400" />
            <span>Pré-visualização da bobina térmica ({printerWidth})</span>
          </div>

          <div
            className={`bg-white w-full ${previewMaxWidth} p-3.5 shadow-lg rounded-sm border border-gray-300 font-mono ${previewFontSize} text-black leading-snug select-text relative transition-all duration-200`}
            style={{
              boxShadow: '0 4px 14px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: activePrintReceipt.htmlContent }} />

            {/* Visual Tear / Feed line */}
            <div className="mt-4 pt-2 border-t border-dashed border-gray-300 flex items-center justify-center gap-1 text-[10px] text-gray-400 select-none">
              <Scissors size={11} />
              <span>Linha de corte / serrilha</span>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-3.5 sm:p-4 border-t border-gray-100 bg-white space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDirectPrint}
              className="flex items-center justify-center gap-2 py-3 px-3 bg-amber-800 text-white rounded-xl font-bold text-xs hover:bg-amber-900 shadow-md transition-all cursor-pointer"
            >
              <Printer size={16} />
              <span>Imprimir Agora ({printerWidth})</span>
            </button>

            <button
              onClick={handleOpenPdfTab}
              className="flex items-center justify-center gap-1.5 py-3 px-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 shadow-md transition-all cursor-pointer"
            >
              <ExternalLink size={16} />
              <span>Nova Aba / PDF</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopyText}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
            >
              <Copy size={15} />
              <span>Copiar Texto</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold text-xs transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
