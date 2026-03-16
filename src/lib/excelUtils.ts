import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], columns: { header: string; key: string; transform?: (val: any, row: any) => any }[], fileName: string) => {
  const rows = data.map(row => {
    const obj: any = {};
    columns.forEach(col => {
      const val = col.key.split('.').reduce((o, k) => o?.[k], row);
      obj[col.header] = col.transform ? col.transform(val, row) : (val ?? '');
    });
    return obj;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  
  // Auto-width columns
  const colWidths = columns.map(col => ({
    wch: Math.max(col.header.length, ...rows.map(r => String(r[col.header] || '').length).slice(0, 100)) + 2
  }));
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const importFromExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const downloadTemplate = (columns: { header: string }[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet([], { header: columns.map(c => c.header) });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  ws['!cols'] = columns.map(col => ({ wch: col.header.length + 5 }));
  XLSX.writeFile(wb, `Template_${fileName}.xlsx`);
};
