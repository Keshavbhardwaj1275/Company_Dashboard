import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Trigger browser file download with Blob
 */
const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export data array to standard RFC 4180 CSV file with UTF-8 BOM
 */
export const exportToCSV = (
  filename: string,
  headers: string[],
  rows: (string | number)[][]
): boolean => {
  try {
    const escapeCell = (val: string | number) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = '\uFEFF' + [
      headers.map(escapeCell).join(','),
      ...rows.map((row) => row.map(escapeCell).join(',')),
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const targetFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    triggerDownload(blob, targetFilename);
    return true;
  } catch (err) {
    console.error('CSV Export Error:', err);
    return false;
  }
};

/**
 * Export to real Microsoft Excel (.xlsx) workbook using XLSX library
 */
export const exportToExcel = (
  filename: string,
  headers: string[],
  rows: (string | number)[][],
  sheetName = 'Workforce Report'
): boolean => {
  try {
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Auto calculate column widths
    const colWidths = headers.map((h, colIdx) => {
      let maxLen = h.length;
      rows.forEach((r) => {
        const cellStr = String(r[colIdx] ?? '');
        if (cellStr.length > maxLen) maxLen = cellStr.length;
      });
      return { wch: Math.min(Math.max(maxLen + 3, 12), 40) };
    });
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const targetFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    XLSX.writeFile(wb, targetFilename);
    return true;
  } catch (err) {
    console.error('Excel Export Error:', err);
    return false;
  }
};

export interface ExportMetaItem {
  label: string;
  value: string;
}

/**
 * Generate and download a professional vector PDF report using jsPDF and autoTable
 */
export const exportToPDF = (
  filename: string,
  reportTitle: string,
  headers: string[],
  rows: (string | number)[][],
  metaInfo?: ExportMetaItem[]
): boolean => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Top Gold/Yellow Accent Stripe
    doc.setFillColor(255, 233, 86); // FlowSphere yellow
    doc.rect(14, 10, 269, 3, 'F');

    // FlowSphere Brand Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    doc.text('FLOWSPHERE WORKFORCE INTELLIGENCE', 14, 20);

    // Report Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(reportTitle, 14, 27);

    // Right-aligned Generation Date
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated: ${dateStr}`, 283, 27, { align: 'right' });

    // Meta Info Banner
    let startY = 33;
    if (metaInfo && metaInfo.length > 0) {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, 31, 269, 10, 1.5, 1.5, 'FD');
      
      doc.setFontSize(8.5);
      let curX = 18;
      metaInfo.forEach((m) => {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`${m.label}:`, curX, 37.5);
        const labelWidth = doc.getTextWidth(`${m.label}: `);
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(m.value, curX + labelWidth, 37.5);
        
        curX += labelWidth + doc.getTextWidth(m.value) + 14;
      });
      startY = 45;
    }

    // Table Generation
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: startY,
      theme: 'striped',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
        halign: 'left',
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
        cellPadding: 2.8,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
      didDrawPage: () => {
        // Page Footer
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('FlowSphere Workforce Tracking & Productivity Intelligence • Confidential Report', 14, 202);
        doc.text(`Page ${doc.getNumberOfPages()}`, 283, 202, { align: 'right' });
      },
    });

    const targetFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    doc.save(targetFilename);
    return true;
  } catch (err) {
    console.error('PDF Export Error:', err);
    return false;
  }
};

