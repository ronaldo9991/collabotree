import PDFDocument from 'pdfkit';

interface ContractData {
  id: string;
  title: string;
  buyer?: { name: string; email: string };
  student?: { name: string; email: string };
  createdAt: Date;
  paidAt?: Date | null;
  updatedAt: Date;
  status: string;
  paymentStatus: string;
  progressStatus: string;
  priceCents?: number;
  platformFeeCents?: number;
  studentPayoutCents?: number;
  deliverables?: string[];
  timeline?: number;
  completionNotes?: string | null;
  progressNotes?: string | null;
  service?: { title: string; description?: string };
}

export function generateContractPDF(contract: ContractData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header with CollaboTree branding
      doc
        .fillColor('#1a1a1a')
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('CollaboTree', 50, 50, { align: 'center' })
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#666666')
        .text('Connecting Students with Opportunities', 50, 80, { align: 'center' })
        .moveDown(2);

      // Draw a line under header
      doc
        .strokeColor('#e0e0e0')
        .lineWidth(1)
        .moveTo(50, 110)
        .lineTo(562, 110)
        .stroke();

      // Contract Title
      doc
        .fillColor('#1a1a1a')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('CONTRACT DOCUMENT', 50, 130, { align: 'center' })
        .moveDown(1);

      // Contract Information Section
      let yPos = 180;

      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#1a1a1a')
        .text('Contract Details', 50, yPos);

      yPos += 25;

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#333333')
        .text(`Contract ID: ${contract.id}`, 50, yPos)
        .text(`Project Title: ${contract.title || contract.service?.title || 'N/A'}`, 50, yPos + 15)
        .text(`Status: ${contract.status}`, 50, yPos + 30)
        .text(`Payment Status: ${contract.paymentStatus}`, 50, yPos + 45)
        .text(`Progress Status: ${contract.progressStatus}`, 50, yPos + 60);

      yPos += 90;

      // Parties Section
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#1a1a1a')
        .text('Parties', 50, yPos);

      yPos += 25;

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#333333')
        .text('Buyer:', 50, yPos)
        .font('Helvetica-Bold')
        .text(contract.buyer?.name || 'N/A', 100, yPos)
        .font('Helvetica')
        .text(contract.buyer?.email || '', 100, yPos + 12, { continued: false });

      yPos += 40;

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#333333')
        .text('Student:', 50, yPos)
        .font('Helvetica-Bold')
        .text(contract.student?.name || 'N/A', 100, yPos)
        .font('Helvetica')
        .text(contract.student?.email || '', 100, yPos + 12, { continued: false });

      yPos += 50;

      // Dates Section
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#1a1a1a')
        .text('Project Timeline', 50, yPos);

      yPos += 25;

      const startDate = new Date(contract.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const endDate = contract.updatedAt
        ? new Date(contract.updatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'Ongoing';
      const paidDate = contract.paidAt
        ? new Date(contract.paidAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'Not paid';

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#333333')
        .text(`Start Date: ${startDate}`, 50, yPos)
        .text(`End Date: ${endDate}`, 50, yPos + 15)
        .text(`Payment Date: ${paidDate}`, 50, yPos + 30);

      if (contract.timeline) {
        doc.text(`Timeline: ${contract.timeline} days`, 50, yPos + 45);
        yPos += 15;
      }

      yPos += 60;

      // Financial Details Section
      if (contract.priceCents || contract.platformFeeCents || contract.studentPayoutCents) {
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .fillColor('#1a1a1a')
          .text('Financial Details', 50, yPos);

        yPos += 25;

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#333333');

        if (contract.priceCents) {
          doc.text(`Total Price: $${(contract.priceCents / 100).toFixed(2)}`, 50, yPos);
          yPos += 15;
        }
        if (contract.platformFeeCents) {
          doc.text(`Platform Fee (10%): $${(contract.platformFeeCents / 100).toFixed(2)}`, 50, yPos);
          yPos += 15;
        }
        if (contract.studentPayoutCents) {
          doc.text(`Student Payout: $${(contract.studentPayoutCents / 100).toFixed(2)}`, 50, yPos);
          yPos += 15;
        }

        yPos += 20;
      }

      // Deliverables Section
      if (contract.deliverables && contract.deliverables.length > 0) {
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .fillColor('#1a1a1a')
          .text('Deliverables', 50, yPos);

        yPos += 25;

        doc.fontSize(10).font('Helvetica').fillColor('#333333');

        contract.deliverables.forEach((deliverable, index) => {
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }
          doc.text(`${index + 1}. ${deliverable}`, 60, yPos);
          yPos += 15;
        });

        yPos += 20;
      }

      // Service Description
      if (contract.service?.description) {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }

        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .fillColor('#1a1a1a')
          .text('Service Description', 50, yPos);

        yPos += 25;

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#333333')
          .text(contract.service.description, 50, yPos, {
            width: 462,
            align: 'left',
          });

        yPos += 60;
      }

      // Progress Notes
      if (contract.progressNotes) {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }

        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .fillColor('#1a1a1a')
          .text('Progress Notes', 50, yPos);

        yPos += 25;

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#333333')
          .text(contract.progressNotes, 50, yPos, {
            width: 462,
            align: 'left',
          });

        yPos += 60;
      }

      // Completion Notes
      if (contract.completionNotes) {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }

        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .fillColor('#1a1a1a')
          .text('Completion Notes', 50, yPos);

        yPos += 25;

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#333333')
          .text(contract.completionNotes, 50, yPos, {
            width: 462,
            align: 'left',
          });

        yPos += 60;
      }

      // Footer on last page
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#999999')
        .text(
          `Generated by CollaboTree on ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}`,
          50,
          doc.page.height - 30,
          { align: 'center' }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

