import { Injectable } from '@nestjs/common';
import { TDocumentDefinitions, TableCell } from 'pdfmake/interfaces';
import { PdfService } from 'src/common/services/pdf.service';
import { SalesService } from 'src/sales/sales.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly pdfService: PdfService,
    private readonly salesService: SalesService
  ) { }

  async getReportsWhitoutParams(): Promise<PDFKit.PDFDocument> {

    const sales = await this.salesService.findAll();

    const rows: TableCell[][] = [
      [
        { text: 'Cliente', style: 'tableHeader' },
        { text: 'Producto', style: 'tableHeader' },
        { text: 'Color', style: 'tableHeader' },
        { text: 'Talla', style: 'tableHeader' },
        { text: 'Cantidad', style: 'tableHeader' },
        { text: 'Precio', style: 'tableHeader' },
        { text: 'Subtotal', style: 'tableHeader' },
        { text: 'Fecha', style: 'tableHeader' },
      ]
    ];

    let totalGeneral = 0;

    for (const sale of sales) {
      for (const det of sale.details) {
        rows.push([
          `${sale.client.name} ${sale.client.lastname}`,
          det.productTitle,
          det.variantColor,
          det.variantSizes,
          det.quantity,
          `$${det.unitPrice}`,
          `$${det.subtotal}`,
          new Date(sale.saleDate).toLocaleDateString(),
        ]);

        totalGeneral += Number(det.subtotal);
      }
    }

    const docDefinition: TDocumentDefinitions = {

      pageMargins: [40, 60, 40, 40],

      content: [
        {
          columns: [
            {
              text: 'REPORTE DE VENTAS',
              style: 'header'
            },
            {
              text: new Date().toLocaleDateString(),
              alignment: 'right',
              style: 'date'
            }
          ]
        },
        {
          canvas: [
            {
              type: 'rect',
              x: 0, y: 0, w: 515, h: 2,
              color: '#1A73E8'
            }
          ],
          margin: [0, 10, 0, 20]
        },
        {
          text: `Total de ventas procesadas: ${sales.length}`,
          style: 'summaryText'
        },
        {
          text: `Total generado: $${totalGeneral}`,
          style: 'summaryAmount',
          margin: [0, 0, 0, 20]
        },

        {
          style: 'tableStyle',
          table: {
            headerRows: 1,
            widths: ['*', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: rows
          },

          layout: {
            fillColor: (rowIndex: number) => {
              if (rowIndex === 0) return '#E8EEF7';
              return rowIndex % 2 === 0 ? '#F7F9FC' : null;
            },
            hLineWidth: () => 0.4,
            vLineWidth: () => 0.4,
            hLineColor: () => '#cccccc',
            vLineColor: () => '#cccccc',
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4,
          }
        },

        {
          text: `TOTAL GENERAL: $${totalGeneral}`,
          style: 'totalFinal'
        }
      ],

      styles: {
        header: {
          fontSize: 26,
          bold: true,
          color: '#1A73E8'
        },
        date: {
          fontSize: 12,
          italics: true,
          color: '#555'
        },
        summaryText: {
          fontSize: 14,
          bold: true,
          color: '#333',
          margin: [0, 0, 0, 5]
        },
        summaryAmount: {
          fontSize: 16,
          bold: true,
          color: '#1A73E8'
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: '#1A73E8'
        },
        totalFinal: {
          margin: [0, 20, 0, 0],
          bold: true,
          fontSize: 16,
          alignment: 'right',
          color: '#1A73E8'
        }
      }
    };

    return this.pdfService.createPdf(docDefinition);
  }

  async getReportsWithParams(start: Date, end: Date): Promise<any> {
    const sales = await this.salesService.findByDateRange(start, end);
    const totalGeneral = sales.reduce((acc, s) => acc + Number(s.total), 0);

    const docDefinition: any = {
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          color: '#1a237e',
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 12,
          bold: true,
          margin: [0, 5, 0, 3],
          color: '#424242'
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: 'white',
          fillColor: '#1a237e',
        },
        tableData: {
          fontSize: 10,
          color: '#212121'
        }
      },
      content: [
        {
          text: "📊 Reporte de Ventas",
          style: "header",
        },
        {
          columns: [
            [
              { text: `Desde: ${start.toLocaleDateString()}`, style: 'subheader' },
              { text: `Hasta: ${end.toLocaleDateString()}`, style: 'subheader' },
            ],
            {
              text: `Total General: S/ ${totalGeneral.toFixed(2)}`,
              alignment: "right",
              fontSize: 14,
              bold: true,
              color: "#1b5e20",
              margin: [0, 10, 0, 0]
            }
          ]
        },
        { text: '\n' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: "Cliente", style: "tableHeader" },
                { text: "Fecha", style: "tableHeader" },
                { text: "Monto (S/)", style: "tableHeader" },
                { text: "Estado", style: "tableHeader" },
              ],
              ...sales.map(s => ([
                { text: `${s.client.name} ${s.client.lastname}`, style: 'tableData' },
                { text: new Date(s.saleDate).toLocaleDateString(), style: 'tableData' },
                { text: Number(s.total).toFixed(2), style: 'tableData' },
                { text: s.status, style: 'tableData' },
              ]))
            ]
          },
          layout: {
            fillColor: function (rowIndex: number) {
              return rowIndex % 2 === 0 ? '#f5f5f5' : null;
            }
          }
        },
        { text: '\n\n' },
        {
          text: "Detalle por Venta",
          style: "subheader",
          bold: true,
          fontSize: 14,
          margin: [0, 10, 0, 10]
        },
        ...sales.map(s => ({
          stack: [
            { text: `🧾 Venta #${s.id}`, bold: true, margin: [0, 10, 0, 5] },
            {
              table: {
                widths: ['*', 'auto', 'auto', 'auto'],
                body: [
                  [
                    { text: "Producto", style: "tableHeader" },
                    { text: "Cantidad", style: "tableHeader" },
                    { text: "Precio (S/)", style: "tableHeader" },
                    { text: "Subtotal (S/)", style: "tableHeader" }
                  ],
                  ...s.details.map((d: any) => ([
                    { text: `${d.productTitle} (${d.variantColor}, Talla ${d.variantSizes})`, style: "tableData" },
                    { text: d.quantity.toString(), style: "tableData" },
                    { text: Number(d.unitPrice).toFixed(2), style: "tableData" },
                    { text: Number(d.subtotal).toFixed(2), style: "tableData" },
                  ]))
                ]
              },
              layout: {
                fillColor: function (rowIndex: number) {
                  return rowIndex % 2 === 0 ? '#e8eaf6' : null;
                }
              }
            }
          ]
        }))
      ]
    };

    return this.pdfService.createPdf(docDefinition);
  }





}
