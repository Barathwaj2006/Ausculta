package com.example.ausculta.report

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import com.example.ausculta.model.AiAnalysisResult
import com.example.ausculta.model.Session
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class PdfReportGenerator(private val context: Context) {
    fun generateReport(session: Session, aiResult: AiAnalysisResult): File {
        val pdfDocument = PdfDocument()
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create() // A4
        val page = pdfDocument.startPage(pageInfo)
        val canvas = page.canvas

        val paint = Paint()
        paint.color = Color.BLACK

        // Header
        paint.textSize = 20f
        paint.isBoldText = true
        canvas.drawText("AUSCULTA - Clinical Auscultation Report", 40f, 50f, paint)

        paint.textSize = 12f
        paint.isBoldText = false
        val dfm = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US)
        canvas.drawText("Generated: ${djm.format(Date())}", 40f, 70f, paint)

        // Divider
        canvas.drawLine(40f, 85f, 555f, 85f, paint)

        // Patient & Session Info
        paint.isBoldText = true
        canvas.drawText("Patient: ${session.patientName}", 40f, 110f, paint)
        canvas.drawText("Auscultation Site: ${session.site.displayName}", 40f, 130f, paint)
        canvas.drawText("Heart Rate: ${session.averageHeartRateBpm} BPM", 40f, 150f, paint)
        canvas.drawText("Signal Quality: ${session.signalQualityScore}%i", 40f, 170f, paint)

        // AI Impression
        canvas.drawLine(40f, 190f, 555f, 190f, paint)
        paint.textSize = 14f
        canvas.drawText("AI Clinical Impression", 40f, 210f, paint)
        paint.textSize = 11f
        paint.isBoldText = false
        canvas.drawText(aiResult.primaryImpression, 40f, 230f, paint)
        canvas.drawText("acoustic severity score: ${aiResult.acousticSeverityScore}/10", 40f, 250f, paint)

        pdfDocument.finishPage(page)

        val outDir = File(context.filesDir, "reports")
        if (!outDir.exists()) outDir.mkdirs()
        val file = File(outDir, "report_${session.id}.pdf")
        pdfDocument.writeTo(FileOutputStream(file))
        pdfDocument.close()
        return file
    }
}
