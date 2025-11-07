import jsPDF from "jspdf";
import QRCode from "qrcode";

interface BookingData {
  bookingNumber: string;
  passengerName: string;
  cruiseName: string;
  shipName: string;
  departurePort: string;
  departureDate: string;
  returnDate: string;
  cabinType: string;
  cabinNumber: string;
  passengers: Array<{
    name: string;
    age: number;
  }>;
}

export async function generateETicket(bookingData: BookingData): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors
  const primaryColor = "#003366";
  const accentColor = "#FFD700";
  const lightGray = "#F5F5F5";

  // Background
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, pageWidth, 40, "F");

  // MSC Logo area (text-based since we don't have image)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("MSC CRUISES", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("E-TICKET", pageWidth / 2, 30, { align: "center" });

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Booking Number Section
  doc.setFillColor(lightGray);
  doc.rect(15, 50, pageWidth - 30, 25, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("BOOKING NUMBER", 20, 58);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(bookingData.bookingNumber, 20, 68);

  // Generate QR Code
  try {
    const qrCodeData = await QRCode.toDataURL(
      `MSC-${bookingData.bookingNumber}`,
      {
        width: 200,
        margin: 1,
      }
    );
    doc.addImage(qrCodeData, "PNG", pageWidth - 45, 50, 25, 25);
  } catch (error) {
    console.error("QR Code generation failed:", error);
  }

  let yPos = 85;

  // Passenger Information
  doc.setFillColor(primaryColor);
  doc.rect(15, yPos, pageWidth - 30, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PASSENGER INFORMATION", 20, yPos + 5.5);

  yPos += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text("Primary Passenger:", 20, yPos);
  doc.setFont("helvetica", "bold");
  doc.text(bookingData.passengerName, 70, yPos);
  yPos += 7;

  doc.setFont("helvetica", "normal");
  doc.text("Total Passengers:", 20, yPos);
  doc.setFont("helvetica", "bold");
  doc.text(bookingData.passengers.length.toString(), 70, yPos);
  yPos += 10;

  // All Passengers List
  doc.setFont("helvetica", "normal");
  bookingData.passengers.forEach((passenger, index) => {
    doc.text(`${index + 1}. ${passenger.name} (${passenger.age} years old)`, 25, yPos);
    yPos += 6;
  });

  yPos += 5;

  // Cruise Information
  doc.setFillColor(primaryColor);
  doc.rect(15, yPos, pageWidth - 30, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("CRUISE INFORMATION", 20, yPos + 5.5);

  yPos += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);

  const cruiseInfo = [
    { label: "Cruise Name:", value: bookingData.cruiseName },
    { label: "Ship:", value: bookingData.shipName },
    { label: "Departure Port:", value: bookingData.departurePort },
    { label: "Departure Date:", value: new Date(bookingData.departureDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
    { label: "Return Date:", value: new Date(bookingData.returnDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
  ];

  cruiseInfo.forEach((info) => {
    doc.setFont("helvetica", "normal");
    doc.text(info.label, 20, yPos);
    doc.setFont("helvetica", "bold");
    doc.text(info.value, 70, yPos);
    yPos += 7;
  });

  yPos += 5;

  // Cabin Information
  doc.setFillColor(primaryColor);
  doc.rect(15, yPos, pageWidth - 30, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("CABIN INFORMATION", 20, yPos + 5.5);

  yPos += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);

  doc.setFont("helvetica", "normal");
  doc.text("Cabin Type:", 20, yPos);
  doc.setFont("helvetica", "bold");
  doc.text(bookingData.cabinType, 70, yPos);
  yPos += 7;

  doc.setFont("helvetica", "normal");
  doc.text("Cabin Number:", 20, yPos);
  doc.setFont("helvetica", "bold");
  doc.text(bookingData.cabinNumber, 70, yPos);
  yPos += 15;

  // Important Information
  doc.setFillColor(accentColor);
  doc.rect(15, yPos, pageWidth - 30, 8, "F");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("IMPORTANT INFORMATION", 20, yPos + 5.5);

  yPos += 15;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const importantInfo = [
    "✓ Please arrive at the port at least 2 hours before departure",
    "✓ Valid passport required (must be valid for 6 months after return date)",
    "✓ This e-ticket must be presented at boarding",
    "✓ Complete online check-in 48 hours before departure",
    "✓ Baggage allowance: 2 pieces per person (max 23kg each)",
  ];

  importantInfo.forEach((info) => {
    doc.text(info, 20, yPos);
    yPos += 6;
  });

  // Footer
  const footerY = pageHeight - 30;
  doc.setDrawColor(primaryColor);
  doc.setLineWidth(0.5);
  doc.line(15, footerY, pageWidth - 15, footerY);

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("MSC Cruises S.A. - www.msccruises.com", pageWidth / 2, footerY + 5, { align: "center" });
  doc.text("For assistance: +82 1588-1234 | support@msccruises.com", pageWidth / 2, footerY + 10, { align: "center" });
  doc.text(`Generated on: ${new Date().toLocaleString("en-US")}`, pageWidth / 2, footerY + 15, { align: "center" });

  // Barcode at bottom
  doc.setFillColor(0, 0, 0);
  for (let i = 0; i < 50; i++) {
    const height = Math.random() > 0.5 ? 8 : 6;
    doc.rect(15 + i * 3.5, footerY + 18, 2, height, "F");
  }

  // Save the PDF
  doc.save(`MSC-ETicket-${bookingData.bookingNumber}.pdf`);
}
