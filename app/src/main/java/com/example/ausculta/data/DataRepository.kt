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
    private val scope = CoroutineScope(Dispatchers.IO + Job())
    private val db = AppDatabase.getDatabase(context)
    private val patientDao = db.patientDao()
    private val sessionDao = db.sessionDao()

    val deviceCommunicator = DeviceCommunicator(context, scope)
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
            deviceCommunicator.rawPacketFlow.collect { packet ->
                processIncomingPacket(packet)
            }
        }
        scope.launch { seedInitialData() }
    }

    private fun processIncomingPacket(packet: DevicePacket) {
        val heartSummary = heartAnalyzer.analyzeBatch(packet.audioSamples)
        val lungSummary = lungAnalyzer.analyzeBatch(packet.audioSamples)
        val spectrum = FftCalculator.computeSpectrum16(packet.audioSamples)
        _liveSpectrum.value = spectrum

        _signalMetrics.value = _signalMetrics.value.copy(
            currentBpm = heartSummary.bpm,
            rmsEnergy = heartSummary.rmsEnergy,
            murmurProbability = heartSummary.murmurProbability,
            wheezeProbability = lungSummary.wheezeProbability,
            crackleProbability = lungSummary.crackleProbability
        )

        currentWavEncoder?.appendSamples(packet.audioSamples)
    }

    fun startRecording(context: Context): File {
        val dir = File(context.filesDir, " recordings\)
 if (!dir.exists()) dir.mkdirs()
 val file = File(dir, \ausculta_\ + System.currentTimeMillis() + \.wav\)
 currentRecordingFile = file
 currentWavEncoder = WavAudioEncoder(file, 4000).apply { startEncoding() }
 recordingStartTimeMs = System.currentTimeMillis()
 _signalMetrics.value = _signalMetrics.value.copy(isRecording = true)
 return file
 }

 suspend fun stopRecordingAndSave(
 patientId: String,
 patientName: String,
 site: AuscultationSite,
 filterMode: FilterMode
 ): Session {
 currentWavEncoder?.stopEncoding()
 currentWavEncoder = null
 _signalMetrics.value = _signalMetrics.value.copy(isRecording = false)
 val durationSecs = ((System.currentTimeMillis() - recordingStartTimeMs) / 1000).toInt().coerceAtLeast(1)

 val metrics = _signalMetrics.value
 val session = Session(
 patientId = patientId,
 patientName = patientName,
 site = site,
 filterMode = filterMode,
 durationSeconds = durationSecs,
 averageHeartRateBpm = metrics.currentBpm,
 signalQualityScore = metrics.signalQualityPercentage,
 audioFilePath = currentRecordingFile?.absolutePath ?: \\,
 s1s2Detected = true,
 murmurDetected = metrics.murmurProbability > 0.3f,
 wheezeDetected = metrics.wheezeProbability > 0.3f,
 crackleDetected = metrics.crackleProbability > 0.3f,
 aiSummary = \Auscultation recording completed at \ + site.displayName + \.\
 )
 sessionDao.insertSession(SessionEntity.fromDomain(session))
 return session
 }

 suspend fun runAiAnalysis(session: Session): AiAnalysisResult {
 val key = secureStorage.getApiKey()
 val result = if (!key.isNullOrEmpty()) {
 geminiAi.analyzeSession(session, key)
 } else {
 clinicalEngine.analyzeOffline(session)
 }
 val updated = session.copy(aiSummary = result.primaryImpression)
 sessionDao.insertSession(SessionEntity.fromDomain(updated))
 return result
 }

 fun generatePdf(session: Session, aiResult: AiAnalysisResult): File {
 return pdfGenerator.generateReport(session, aiResult)
 }

 suspend fun addPatient(patient: Patient) {
 patientDao.insertPatient(PatientEntity.fromDomain(patient))
 }

 private suspend fun seedInitialData() {
 if (patientDao.getPatientById(\demo-1\) == null) {
 patientDao.insertPatient(PatientEntity(\demo-1\, \PT-9841\, \John Doe\, 45, \Male\, \No prior cardiac history\, System.currentTimeMillis()))
 sessionDao.insertSession(SessionEntity(
 \id-demo-1\, \demo-1\, \John Doe\, \MITRAL\, \HEART_BANDPASS\, 30, 72, 95,
 \\, s1s2Detected = true, murmurDetected = false, wheezeDetected = false, crackleDetected = false,
 60f, \Normal S1/S2 acoustics with no murmurs.\, System.currentTimeMillis()
 ))
 }
 }
}