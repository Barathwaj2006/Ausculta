package com.example.ausculta.audio

import java.io.File
import java.io.FileOutputStream
import java.io.RandomAccessFile
import java.nio.ByteBuffer
import java.nio.ByteOrder

class WavAudioEncoder(private val outputFile: File, private val sampleRate: Int = 4000) {
    private var outputStream: FileOutputStream? = null
    private var totalAudioBytes = 0

    fun startEncoding() {
        outputStream = FileOutputStream(outputFile)
        writeWavHeader(outputStream!!, sampleRate, 1, 16, 0)
    }

    fun appendSamples(pcmSamples: ShortArray) {
        val stream = outputStream ?: return
        val buffer = ByteBuffer.allocate(pcmSamples.size * 2).order(ByteOrder.LITTLE_ENDIAN)
        for (sample in pcmSamples) {
            buffer.putShort(sample)
        }
        val bytes = buffer.array()
        stream.write(bytes)
        totalAudioBytes += bytes.size
    }

    fun stopEncoding() {
        outputStream?.flush()
        outputStream?.close()
        outputStream = null
        updateHeaderChunkSizes()
    }

    private fun writeWavHeader(out: FileOutputStream, sampleRate: Int, channels: Int, bitsPerSample: Int, pcmDataLength: Int) {
        val totalDataLen = pcmDataLength + 36
        val byteRate = sampleRate * channels * bitsPerSample / 8

        val header = ByteArray(44)
        header[0] = 'R'.code.toByte(); header[1] = 'I'.code.toByte(); header[2] = 'F'.code.toByte(); header[3] = 'F'.code.toByte()
        header[4] = (totalDataLen and 0xff).toByte()
        header[5] = (totalDataLen shr 8 and 0xff).toByte()
        header[6] = (totalDataLen shr 16 and 0xff).toByte()
        header[7] = (totalDataLen shr 24 and 0xff).toByte()
        header[8] = 'W'.code.toByte(); header[9] = 'A'.code.toByte(); header[10] = 'V'.code.toByte(); header[11] = 'E'.code.toByte()
        header[12] = 'f'.code.toByte(); header[13] = 'm'.code.toByte(); header[14] = 't'.code.toByte(); header[15] = ' '.code.toByte()
        header[16] = 16; header[17] = 0; header[18] = 0; header[19] = 0
        header[20] = 1; header[21] = 0
        header[22] = channels.toByte(); header[23] = 0
        header[24] = (sampleRate and 0xff).toByte()
        header[25] = (sampleRate shr 8 and 0xff).toByte()
        header[26] = (sampleRate shr 16 and 0xff).toByte()
        header[27] = (sampleRate shr 24 and 0xff).toByte()
        header[28] = (byteRate and 0xff).toByte()
        header[29] = (byteRate shr 8 and 0xff).toByte()
        header[30] = (byteRate shr 16 and 0xff).toByte()
        header[31] = (byteRate shr 24 and 0xff).toByte()
        header[32] = (channels * bitsPerSample / 8).toByte(); header[33] = 0
        header[34] = bitsPerSample.toByte(); header[35] = 0
        header[36] = 'd'.code.toByte(); header[37] = 'a'.code.toByte(); header[38] = 't'.code.toByte(); header[39] = 'a'.code.toByte()
        header[40] = (pcmDataLength and 0xff).toByte()
        header[41] = (pcmDataLength shr 8 and 0xff).toByte()
        header[42] = (pcmDataLength shr 16 and 0xff).toByte()
        header[43] = (pcmDataLength shr 24 and 0xff).toByte()

        out.write(header, 0, 44)
    }

    private fun updateHeaderChunkSizes() {
        val raf = RandomAccessFile(outputFile, " rw\)
 val totalDataLen = totalAudioBytes + 36
 val pcmDataLength = totalAudioBytes

 raf.seek(4)
 raf.write(intToByteArray(totalDataLen))
 raf.seek(40)
 raf.write(intToByteArray(pcmDataLength))
 raf.close()
 }

 private fun intToByteArray(value: Int): ByteArray {
 return byteArrayOf(
 (value and 0xff).toByte(),
 (value shr 8 and 0xff).toByte(),
 (value shr 16 and 0xff).toByte(),
 (value shr 24 and 0xff).toByte()
 )
 }
}