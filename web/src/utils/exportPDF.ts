import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportToPDF(elementId: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF();
  pdf.addImage(imgData, "PNG", 10, 10, 180, 0);
  pdf.save("report.pdf");
}