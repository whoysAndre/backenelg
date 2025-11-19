import { Body, Controller, Get, Header, Post, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import type { Response } from 'express';
import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/interfaces';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportService: ReportsService
  ) { }

  @Get("sales")
  @Auth(Roles.ADMIN)
  async getReport(@Res() res: Response) {

    const pdfDoc = this.reportService.getReportsWhitoutParams();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte.pdf');
    (await pdfDoc).info.Title = 'Factura';
    (await pdfDoc).pipe(res);
    (await pdfDoc).end();
  }

  @Post("sales")
  @Auth(Roles.ADMIN)
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="sales_reporte.pdf"')
  async getReportWhitParamas(
    @Body() body: { start: string, end: string },
    @Res() res: Response
  ) {
    const parseDate = (str: string): Date => {
      const [y, m, d] = str.split('-').map(Number);
      return new Date(y, m - 1, d);
    };
    const start = parseDate(body.start);
    const end = parseDate(body.end);

    const pdfDoc = await this.reportService.getReportsWithParams(start, end);

    pdfDoc.info.Title = 'Factura';
    pdfDoc.pipe(res);
    pdfDoc.end();
  }
}
