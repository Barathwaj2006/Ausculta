package com.example.ausculta.report

import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import androidx.core.content.FileProvider
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
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create()
        val page = pdfDocument.startPage(pageInfo)
        val canvas = page.canvas

        val paint = Paint()
        paint.color = Color.BLACK

        paint.textSize = 18f
        paint.isBoldText = true
        canvas.drawText("Ausculta - Consumer Self-Monitoring Report", 40f, 50f, paint)

        paint.textSize = 10f
        paint.isBoldText = false
        val sdf = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US)
        canvas.drawText("Generated: " + sdf.format(Date()) + " | Population Scope: Adult (Age 18+)", 40f, 68f, paint)
        canvas.drawLine(40f, 80f, 555f, 80f, paint)

        paint.isBoldText = true
        paint.textSize = 12f
        canvas.drawText("User Profile: " + session.patientName + " (" + session.patientAge + "y, " + session.patientSex + ")", 40f, 105f, paint)
        paint.isBoldText = false
        paint.textSize = 11f
        canvas.drawText("Examination Type: " + session.examinationType + " - Location: " + session.site.displayName, 40f, 125f, paint)
        canvas.drawText("Recorded Date & Time: " + session.getFormattedStartTime() + " (" + session.getFriendlyTimeOfDay() + ")", 40f, 143f, paint)
        canvas.drawText("Hardware Device: ESP32 SoftAP HTTP 192.168.4.1/data", 40f, 161f, paint)

        canvas.drawLine(40f, 178f, 555f, 178f, paint)
        paint.isBoldText = true
        canvas.drawText("Physiological Measurements & Reference Ranges:", 40f, 198f, paint)
        paint.isBoldText = false
        canvas.drawText("* SpO2: " + session.spo2 + "% - " + session.po2Status, 50f, 218f, paint)
        canvas.drawText("* Pulse Rate: " + session.bpm + " BPM - " + session.bpmStatus, 50f, 238f, paint)
        canvas.drawText("* Acoustic Signal Quality: " + session.signalQualityScore + "% (" + session.waveformStability + ")", 50f, 258f, paint)

        canvas.drawLine(40f, 275f, 555f, 275f, paint)
        paint.isBoldText = true
        canvas.drawText("AI-Assisted Session Summary:", 40f, 295f, paint)
        paint.isBoldText = false
        canvas.drawText(aiResult.summaryTitle, 50f, 315f, paint)
        canvas.drawText(aiResult.summaryDetails, 50f, 335f, paint)
        canvas.drawText("* " + aiResult.po2Interpretation, 50f, 355f, paint)
        canvas.drawText("* " + aiResult.pulseInterpretation, 50f, 375f, paint)

        canvas.drawLine(40f, 400f, 555f, 400f, paint)
        paint.isBoldText = true
        canvas.drawText("Mandatory Non-Diagnostic Disclaimer:", 40f, 420f, paint)
        paint.isBoldText = false
        paint.textSize = 9f
        canvas.drawText("Ausculta is an AI-assisted consumer health self-monitoring application.", 40f, 438f, paint)
        canvas.drawText("It does not provide clinical medical diagnosis or detect structural heart diseases.", 40f, 453f, paint)

        pdfDocument.finishPage(page)

        val outDir = File(context.filesDir, "reports")
        if (!outDir.exists()) outDir.mkdirs()
        val file = File(outDir, "ausculta_report_" + session.id.take(8) + ".pdf")
        pdfDocument.writeTo(FileOutputStream(file))
        pdfDocument.close()

        return file
    }

    fun shareReportViaIntent(context: Context, pdfFile: File) {
        try {
            val uri = FileProvider.getUriForFile(context, context.packageName + ".fileprovider", pdfFile)
            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "application/pdf"
                putExtra(Intent.EXTRA_STREAM, uri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            val chooser = Intent.createChooser(shareIntent, "Share Examination Report via WhatsApp / Email")
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(chooser)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
