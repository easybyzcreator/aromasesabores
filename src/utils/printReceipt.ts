export type PrinterWidth = '58mm' | '80mm';
export type PrinterFontSize = 'compact' | 'standard' | 'large';

const STORAGE_KEY_WIDTH = 'patitour_printer_width';
const STORAGE_KEY_FONT_SIZE = 'patitour_printer_font_size';

export const getSavedPrinterWidth = (): PrinterWidth => {
  try {
    const val = localStorage.getItem(STORAGE_KEY_WIDTH);
    if (val === '80mm') return '80mm';
    return '58mm'; // Default to 58mm for the user's mini thermal printer
  } catch {
    return '58mm';
  }
};

export const setSavedPrinterWidth = (width: PrinterWidth): void => {
  try {
    localStorage.setItem(STORAGE_KEY_WIDTH, width);
  } catch (e) {
    console.error('Error saving printer width to localStorage:', e);
  }
};

export const getSavedPrinterFontSize = (): PrinterFontSize => {
  try {
    const val = localStorage.getItem(STORAGE_KEY_FONT_SIZE);
    if (val === 'compact' || val === 'standard' || val === 'large') return val;
    return 'standard';
  } catch {
    return 'standard';
  }
};

export const setSavedPrinterFontSize = (size: PrinterFontSize): void => {
  try {
    localStorage.setItem(STORAGE_KEY_FONT_SIZE, size);
  } catch (e) {
    console.error('Error saving printer font size to localStorage:', e);
  }
};

export const getPrintCssRules = (
  width: PrinterWidth = '58mm',
  fontSize: PrinterFontSize = 'standard'
): string => {
  const is58 = width === '58mm';

  // Base font size calculations
  let baseFontSize = '10.5px';
  let titleFontSize = '13px';
  let headerFontSize = '11px';
  let smallFontSize = '9px';
  let totalFontSize = '13.5px';

  if (is58) {
    if (fontSize === 'compact') {
      baseFontSize = '9.5px';
      titleFontSize = '12px';
      headerFontSize = '10px';
      smallFontSize = '8.5px';
      totalFontSize = '12px';
    } else if (fontSize === 'large') {
      baseFontSize = '11.5px';
      titleFontSize = '14px';
      headerFontSize = '12px';
      smallFontSize = '9.5px';
      totalFontSize = '14px';
    }
  } else {
    // 80mm
    if (fontSize === 'compact') {
      baseFontSize = '11px';
      titleFontSize = '14px';
      headerFontSize = '11.5px';
      smallFontSize = '9.5px';
      totalFontSize = '14px';
    } else if (fontSize === 'large') {
      baseFontSize = '13px';
      titleFontSize = '16px';
      headerFontSize = '13.5px';
      smallFontSize = '11px';
      totalFontSize = '16px';
    } else {
      baseFontSize = '12px';
      titleFontSize = '15px';
      headerFontSize = '12.5px';
      smallFontSize = '10px';
      totalFontSize = '15px';
    }
  }

  const printableWidth = is58 ? '48mm' : '72mm';
  const pageMargin = is58 ? '0' : '1.5mm';
  const bodyPadding = is58 ? '1mm 0.5mm 15mm 0.5mm' : '2mm 1mm 12mm 1mm';

  return `
    @page {
      size: ${width} auto;
      margin: ${pageMargin};
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff !important;
      color: #000000 !important;
    }
    body {
      font-family: 'Courier New', Courier, Consolas, Monaco, monospace;
      width: ${printableWidth};
      max-width: ${printableWidth};
      margin: 0 auto;
      padding: ${bodyPadding};
      font-size: ${baseFontSize};
      line-height: ${is58 ? '1.25' : '1.32'};
      color: #000000;
      word-break: break-word;
    }
    .receipt-title {
      font-size: ${titleFontSize};
      font-weight: 900;
      text-transform: uppercase;
      text-align: center;
      line-height: 1.2;
    }
    .receipt-header {
      font-size: ${headerFontSize};
      font-weight: bold;
    }
    .receipt-small {
      font-size: ${smallFontSize};
    }
    .receipt-total {
      font-size: ${totalFontSize};
      font-weight: 900;
    }
    .receipt-divider-solid {
      border-bottom: 1.5px solid #000000;
      margin: 4px 0;
    }
    .receipt-divider-dashed {
      border-bottom: 1px dashed #000000;
      margin: 4px 0;
    }
    .receipt-item-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 4px;
      font-weight: bold;
    }
    .receipt-item-title {
      flex: 1;
      word-break: break-word;
    }
    .receipt-item-price {
      white-space: nowrap;
      text-align: right;
      margin-left: 4px;
    }
    .paper-feed-spacer {
      height: 15mm;
      min-height: 15mm;
      line-height: 15mm;
      visibility: hidden;
    }
    @media print {
      body {
        width: ${printableWidth} !important;
        max-width: ${printableWidth} !important;
        padding: ${bodyPadding} !important;
      }
      .no-print {
        display: none !important;
      }
    }
  `;
};

export const executeThermalPrint = (
  htmlContent: string,
  title: string,
  options?: { width?: PrinterWidth; fontSize?: PrinterFontSize }
): void => {
  const width = options?.width || getSavedPrinterWidth();
  const fontSize = options?.fontSize || getSavedPrinterFontSize();
  const css = getPrintCssRules(width, fontSize);

  // Update DOM container for fallback direct print
  let container = document.getElementById('printable-receipt-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'printable-receipt-container';
    document.body.appendChild(container);
  }
  container.className = width === '80mm' ? 'receipt-80mm' : 'receipt-58mm';
  container.innerHTML = htmlContent;

  try {
    let iframe = document.getElementById('print-iframe') as HTMLIFrameElement;
    if (iframe && iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }

    iframe = document.createElement('iframe');
    iframe.id = 'print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.left = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '10px';
    iframe.style.height = '10px';
    iframe.style.opacity = '0.01';
    iframe.style.border = '0';
    iframe.style.pointerEvents = 'none';
    iframe.style.zIndex = '-9999';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>${css}</style>
</head>
<body>
  ${htmlContent}
</body>
</html>`);
      iframeDoc.close();
    }

    setTimeout(() => {
      try {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } else {
          window.print();
        }
      } catch (err) {
        console.warn('Iframe print blocked, falling back to window.print:', err);
        window.print();
      }
    }, 350);
  } catch (err) {
    console.error('Error executing thermal print:', err);
    window.print();
  }
};
