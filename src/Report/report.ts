import { readFileSync } from "fs";
// const fs = require("fs");
// const pdfConverter = require("./pdfConverter.ts");
import { convertHtmlToPdf } from "./pdfConverter";

export const generateGraphReport = async () => {
    try {
        const htmlData = await readFileSync("report.html").toString();
        console.log(htmlData)
        await convertHtmlToPdf(htmlData);
    } catch (err) {
        console.log("Error :", err);
    }
}