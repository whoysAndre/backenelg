import { Body, Controller, Get, Header, Post, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import type { Response } from 'express';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportService: ReportsService
  ) { }

  @Get("sales")
  async getReport(@Res() res: Response) {

    const pdfDoc = this.reportService.getReportsWhitoutParams();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte.pdf');
    (await pdfDoc).info.Title = 'Factura';
    (await pdfDoc).pipe(res);
    (await pdfDoc).end();
  }

  @Post("sales")
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="sales_reporte.pdf"')
  async getReportWhitParamas(@Body() body: { start: string, end: string }, @Res() res: Response) {
    const pdfDoc = await this.reportService.getReportsWithParams(new Date(body.start), new Date(body.end));
    pdfDoc.info.Title = 'Factura';
    pdfDoc.pipe(res);
    pdfDoc.end();
  }

}
