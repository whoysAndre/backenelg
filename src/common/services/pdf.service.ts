import { Injectable } from "@nestjs/common";
import PdfPrinter from "pdfmake"
import { TDocumentDefinitions } from "pdfmake/interfaces";
import path from "path";

const fonts = {
  Roboto: {
    normal: path.join(__dirname, '../../../static/fonts/Montserrat-Regular.ttf'),
    bold: path.join(__dirname, '../../../static/fonts/Montserrat-Bold.ttf'),
    italics: path.join(__dirname, '../../../static/fonts/Montserrat-Italic.ttf'),
  }
}

@Injectable()
export class PdfService {

  private printer = new PdfPrinter(fonts);
  createPdf(docDefinition: TDocumentDefinitions) {
    return this.printer.createPdfKitDocument(docDefinition);
  }

}