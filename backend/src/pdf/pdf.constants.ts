export const PDF_QUEUE = 'pdf-conversion';
export const PDF_JOB = 'convert-pdf';

export interface PdfConversionJob {
  materiId: string;
  pdfUrl: string;
  version: string;
}
