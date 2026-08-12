package com.example.ausculta.data

import android.content.Context
import com.example.ausculta.ai.ClinicalDiagnosticEngine
import com.example.ausculta.ai.GeminiAiService
import com.example.ausculta.audio.AudioPlayerManager
import com.example.ausculta.audio.WavAudioEncoder
import com.example.ausculta.data.db.AppDatabase
import com.example.ausculta.data.db.PatientEntity
import com.example.ausculta.data.db.SessionEntity
import com.example.ausculta.device.DeviceCommunicator
import com.example.ausculta.dsp.FftCalculator
import com.example.ausculta.dsp.HeartSoundAnalyzer
import com.example.ausculta.dsp.LungSoundAnalyzer
import com.example.ausculta.model.*
import com.example.ausculta.report.PdfReportGenerator
import com.example.ausculta.security.SecureStorage
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import java.io.File

class DataRepository(private val context: Context) {
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private val db = AppDatabase.getDatabase(context)
    private val patientDao = db.patientDao()
    private val sessionDao = db.sessionDao()

    val deviceCommunicator = DeviceCommunicator(context)
    val audioPlayer = AudioPlayerManager(context)
    private val geminiAi = GeminiAiService(context)
    private val clinicalEngine = ClinicalDiagnosticEngine()
    private val pdfGenerator = PdfReportGenerator(context)
    val secureStorage = SecureStorage(context)

    val patients: Flow<List<Patient>> = patientDao.getAllPatients().map { list ->
        list.map { entity -> entity.toDomain() }
    }

    val sessions: Flow<List<Session>> = sessionDao.getAllSessions().map { list ->
        list.map { entity -> entity.toDomain() }
    }

    private val heartAnalyzer = HeartSoundAnalyzer(4000)
    private val lungAnalyzer = LungSoundAnalyzer(4000)

    private val _signalMetrics = MutableStateFlow(SignalMetrics())
    val signalMetrics: StateFlow<SignalMetrics> = _signalMetrics

    private val _liveSpectrum = MutableStateFlow(FloatArray(16))
    val liveSpectrum: StateFlow<FloatArray> = _liveSpectrum

    private var currentWavEncoder: WavAudioEncoder? = null
    private var currentRecordingFile: File? = null
    private var recordingStartTimeMs = 0L

    init {
        scope.launch {
            deviceCommunicator.packetState.collect { packet ->
                processIncomingPacket(packet)
            }
        }
        scope.launch { seedInitialData() }
    }

    private fun processIncomingPacket(packet: DevicePacket) {
        val heartSummary = heartAnalyzer.analyzeBatch(packet.wave)
        val lungSummary = lungAnalyzer.analyzeBatch(packet.wave)
        val spectrum = FftCalculator.computeSpectrum16(packet.wave)
        _liveSpectrum.value = spectrum

        _signalMetrics.value = _signalMetrics.value.copy(
            currentBpm = packet.bpm,
            spo2 = packet.spo2,
            fingerDetected = packet.finger,
            sensorActive = packet.active,
            rmsEnergy = heartSummary.rmsEnergy,
            murmurProbability = heartSummary.murmurProbability,
            wheezeProbability = lungSummary.wheezeProbability,
            crackleProbability = lungSummary.crackleProbability
        )

        currentWavEncoder?.appendSamples(packet.wave)
    }

    fun startRecording(context: Context): File {
        val dir = File(context.filesDir, "recordings")
        if (!dir.exists()) dir.mkdirs()
        val file = File(dir, "ausculta_${System.currentTimeMillis()}.wav")
        currentRecordingFile = file
        currentWavEncoder = WavAudioEncoder(file, 4000).apply { startEncoding() }
        recordingStartTimeMs = System.currentTimeMillis()
        _signalMetrics.value = _signalMetrics.value.copy(isRecording = true)
        return file
    }

    suspend fun stopRecordingAndSave(
        patientId: String,
        patientName: String,
        patientAge: Int = 30,
        patientSex: String = "Male",
        examinationType: String = "Chest & Lung Auscultation",
        site: AuscultationSite = AuscultationSite.ANTERIOR_CHEST,
        filterMode: FilterMode = FilterMode.WIDEBAND
    ): Session {
        currentWavEncoder?.stopEncoding()
        currentWavEncoder = null
        _signalMetrics.value = _signalMetrics.value.copy(isRecording = false)
        val endTimeMs = System.currentTimeMillis()
        val durationSeconds = ((endTimeMs - recordingStartTimeMs) / 1000).coerceAtLeast(1)

        val metrics = _signalMetrics.value
        val session = Session(
            patientId = patientId,
            patientName = patientName,
            patientAge = patientAge,
            patientSex = patientSex,
            examinationType = examinationType,
            site = site,
            filterMode = filterMode,
            startTimestampMs = recordingStartTimeMs,
            endTimestampMs = endTimeMs,
            durationSeconds = durationSeconds,
            deviceStatus = deviceCommunicator.connectionState.value.displayName,
            deviceIdentifier = "ESP32-SoftAP (192.168.4.1)",
            spo2 = metrics.spo2,
            spo2Status = metrics.getSpo2StatusText(),
            bpm = metrics.currentBpm,
            bpmStatus = metrics.getBpmStatusText(),
            signalQualityScore = metrics.signalQualityPercentage,
            waveformStability = metrics.getWaveformStabilityText(),
            isUsableSignal = metrics.isUsableSignal(),
            sampleCount = 200,
            waveDataCsv = "",
            audioFilePath = currentRecordingFile?.absolutePath ?: "",
            aiSummary = "Auscultation recording completed for ${site.displayName}."
        )
        sessionDao.insertSession(SessionEntity.fromDomain(session))
        return session
    }

    suspend fun runAiAnalysis(session: Session): AiAnalysisResult {
        val key = secureStorage.getApiKey()
        val result = if (!key.isNullOrEmpty()) {
            geminiAi.analyzeSession(session, key)
        } else {
            clinicalEngine.generateDeterministicSummary(session)
        }
        val updated = session.copy(aiSummary = result.summaryDetails)
        sessionDao.insertSession(SessionEntity.fromDomain(updated))
        return result
    }

    fun generatePdf(session: Session, aiResult: AiAnalysisResult): File {
        return pdfGenerator.generateReport(session, aiResult)
    }

    fun sharePdf(context: Context, pdfFile: File) {
        pdfGenerator.shareReportViaIntent(context, pdfFile)
    }

    fun getAllSessions(): Flow<List<Session>> = sessions

    suspend fun addPatient(patient: Patient) {
        patientDao.insertPatient(PatientEntity.fromDomain(patient))
    }

    private suspend fun seedInitialData() {
        if (patientDao.getPatientById("user-self") == null) {
            patientDao.insertPatient(PatientEntity("user-self", "My Profile", 30, "Male", "Personal Baseline Records"))
            sessionDao.insertSession(SessionEntity(
                id = "id-demo-1",
                patientId = "user-self",
                patientName = "My Profile",
                patientAge = 30,
                patientSex = "Male",
                examinationType = "Baseline Respiratory Check",
                siteName = AuscultationSite.ANTERIOR_CHEST.name,
                filterModeName = FilterMode.WIDEBAND.name,
                startTimestampMs = System.currentTimeMillis() - 86400000,
                endTimestampMs = System.currentTimeMillis() - 86370000,
                durationSeconds = 30,
                appSessionId = "SESSION-BASELINE-01",
                appVersion = "1.0.0",
                deviceStatus = "Connected (Wi-Fi AP)",
                deviceIdentifier = "ESP32-SoftAP (192.168.4.1)",
                spo2 = 98,
                spo2Status = "Within Reference Range (95-100%)",
                bpm = 72,
                bpmStatus = "Within Reference Range (60-100 BPM)",
                signalQualityScore = 95,
                waveformStability = "Stable Waveform",
                isUsableSignal = true,
                sampleCount = 200,
                waveDataCsv = "",
                audioFilePath = "",
                aiSummary = "Waveform and physiological metrics evaluated deterministically within expected reference range.",
                reportPath = ""
            ))
        }
    }
}
